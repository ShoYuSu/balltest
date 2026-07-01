import {
  Component, OnInit, inject, signal, computed,
  HostListener, ElementRef, ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-study-results',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './study-results.component.html',
  styleUrl: './study-results.component.css',
})
export class StudyResultsComponent implements OnInit {
  private http = inject(HttpClient);
  apiUrl = environment.apiUrl;

  @ViewChild('dropdownRef') dropdownRef!: ElementRef;

  // ─── Main Page State ───────────────────────────────────────
  activeTab: 'result' | 'credit' = 'result';
  isDropdownOpen = false;

  gpax        = signal('0.00');
  latestGpa   = signal('0.00');
  creditsDone = signal(0);
  creditsNeed = signal(132);

  terms         = signal<string[]>([]);
  selectedTerm  = signal('');
  allSubjects   = signal<any[]>([]);
  creditSummary = signal<any[]>([]);

  displayedSubjects = computed(() =>
    this.allSubjects().filter(s => s.term === this.selectedTerm())
  );

  termStats = computed(() => {
    const gradeValues: Record<string, number> = {
      A: 4, 'B+': 3.5, B: 3, 'C+': 2.5, C: 2, 'D+': 1.5, D: 1, F: 0
    };
    let credits = 0, points = 0;
    this.displayedSubjects().forEach(s => {
      if (gradeValues[s.grade] !== undefined) {
        credits += s.credit;
        points  += s.credit * gradeValues[s.grade];
      }
    });
    return { credits, gpa: credits > 0 ? (points / credits).toFixed(2) : '0.00' };
  });

  // ─── Edit Modal State ──────────────────────────────────────
  showModal    = signal(false);
  modalLoading = signal(false);
  curriculum   = signal<any[]>([]);
  passedMap    = signal<Record<number, { grade: string; semester: number; year: number }>>({});
  studentId    = signal(0);
  savingSet    = signal<Set<number>>(new Set());

  collapsedCats = signal<Set<number>>(new Set());
  collapsedMods = signal<Set<number>>(new Set());

  readonly gradeOptionsAF = ['', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F', 'W'];
  readonly gradeOptionsSU = ['', 'S', 'U'];

  freeSlots = signal<{ query: string; results: any[]; show: boolean; course: any | null; conflicted: boolean }[]>([
    { query: '', results: [], show: false, course: null, conflicted: false },
    { query: '', results: [], show: false, course: null, conflicted: false },
  ]);

  // Fixed-position dropdown (เพื่อหลีกเลี่ยง overflow clip)
  freeDropdownRect: { top: number; left: number; width: number } | null = null;
  activeDropdownSlot = -1;

  get activeDropdownData(): { slot: any; rect: { top: number; left: number; width: number } } | null {
    if (this.activeDropdownSlot < 0 || !this.freeDropdownRect) return null;
    const slot = this.freeSlots()[this.activeDropdownSlot];
    if (!slot?.show || !slot.results?.length) return null;
    return { slot, rect: this.freeDropdownRect };
  }

  private saveTimers: Record<number, any> = {};
  private searchTimers: Record<number, any> = {};

  // ─── Lifecycle ─────────────────────────────────────────────
  ngOnInit() { this.loadStudyResults(); }

  // ─── Main Page ─────────────────────────────────────────────
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.dropdownRef && !this.dropdownRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }

  selectTerm(term: string) {
    this.selectedTerm.set(term);
    this.isDropdownOpen = false;
  }

  loadStudyResults(restoreTerm?: string) {
    const studentCode = localStorage.getItem('student_code') || localStorage.getItem('username') || '';
    if (!studentCode) return;

    this.http.get<any>(`${this.apiUrl}/get_study_results.php?student_code=${studentCode}&t=${Date.now()}`).subscribe({
      next: res => {
        if (res.error) { console.error('[study-results] error:', res.error); return; }
        this.gpax.set(res.gpax);
        this.latestGpa.set(res.latest_gpa);
        this.creditsDone.set(res.total_credits_done);
        this.creditsNeed.set(res.total_credits_need);
        this.allSubjects.set(res.subjects);
        this.creditSummary.set(res.credit_summary);
        this.terms.set(res.terms);
        // restore เทอมที่เลือกล่าสุด ถ้ายังมีอยู่ใน terms ไม่งั้นไปเทอมแรก
        const target = restoreTerm && res.terms.includes(restoreTerm) ? restoreTerm : res.terms[0];
        if (target) this.selectedTerm.set(target);
      },
      error: err => console.error('[study-results] HTTP error:', err)
    });
  }

  getGradeColor(grade: string) {
    if (['A', 'B+', 'B'].includes(grade))  return 'bg-green-100 text-green-700 border border-green-200';
    if (['C+', 'C'].includes(grade))        return 'bg-blue-100 text-blue-700 border border-blue-200';
    if (['D+', 'D'].includes(grade))        return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
    if (grade === 'F')                      return 'bg-red-100 text-red-700 border border-red-200';
    return 'bg-gray-100 text-gray-700 border border-gray-200';
  }

  // ─── Modal ─────────────────────────────────────────────────
  openModal() {
    this.showModal.set(true);
    this.loadModalData();
  }

  closeModal() {
    const lastTerm = this.selectedTerm();
    this.showModal.set(false);
    this.loadStudyResults(lastTerm);
  }

  loadModalData() {
    this.modalLoading.set(true);
    const userId = localStorage.getItem('user_id');
    if (!userId) return;

    this.http.get<any>(`${this.apiUrl}/get_student_profile.php?user_id=${userId}`).subscribe({
      next: profile => {
        this.studentId.set(profile.student_id);

        forkJoin({
          curriculum: this.http.get<any[]>(`${this.apiUrl}/get_curriculum.php?major_name=${encodeURIComponent(profile.major)}`),
          passed:     this.http.get<any[]>(`${this.apiUrl}/get_student_passed_courses.php?student_id=${profile.student_id}`)
        }).subscribe({
          next: ({ curriculum, passed }) => {
            this.curriculum.set(curriculum);

            const map: Record<number, any> = {};
            passed.forEach(p => {
              map[p.course_id] = {
                grade:    p.grade    ?? '',
                semester: Number(p.semester) || 1,
                year:     Number(p.year)     || 2566
              };
            });
            this.passedMap.set(map);

            // หา free elective courses (ไม่อยู่ใน curriculum modules)
            const currIds = new Set<number>();
            curriculum.forEach((cat: any) =>
              cat.modules?.forEach((m: any) =>
                m.courses?.forEach((c: any) => currIds.add(+c.course_id))
              )
            );
            const freeIds = passed.filter((p: any) => !currIds.has(+p.course_id)).slice(0, 2).map((p: any) => +p.course_id);

            if (freeIds.length > 0) {
              this.http.get<any[]>(`${this.apiUrl}/search_courses.php?ids=${freeIds.join(',')}`).subscribe({
                next: courses => {
                  this.freeSlots.set([0, 1].map(i => {
                    const c = courses.find((x: any) => +x.course_id === freeIds[i]);
                    return c
                      ? { query: `${c.course_code} – ${c.course_name}`, results: [], show: false, course: c, conflicted: false }
                      : { query: '', results: [], show: false, course: null, conflicted: false };
                  }));
                }
              });
            } else {
              this.freeSlots.set([
                { query: '', results: [], show: false, course: null, conflicted: false },
                { query: '', results: [], show: false, course: null, conflicted: false },
              ]);
            }

            this.modalLoading.set(false);
          }
        });
      }
    });
  }

  getCourse(courseId: number) {
    return this.passedMap()[courseId] ?? { grade: '', semester: 1, year: 2566 };
  }

  gradeOptions(gradeSystem: string) {
    return gradeSystem === 'ผ่าน/ไม่ผ่าน (S/U)' ? this.gradeOptionsSU : this.gradeOptionsAF;
  }

  toggleCat(catId: number) {
    const s = new Set(this.collapsedCats());
    s.has(catId) ? s.delete(catId) : s.add(catId);
    this.collapsedCats.set(s);
  }

  isCatCollapsed(catId: number) { return this.collapsedCats().has(catId); }

  toggleMod(modId: number) {
    const s = new Set(this.collapsedMods());
    s.has(modId) ? s.delete(modId) : s.add(modId);
    this.collapsedMods.set(s);
  }

  isModCollapsed(modId: number) { return this.collapsedMods().has(modId); }

  // ─── Category Progress ────────────────────────────────────
  catCreditsDone(cat: any): number {
    if (!cat.modules || cat.modules.length === 0) {
      let done = 0;
      this.freeSlots().forEach(slot => {
        if (slot.course && !slot.conflicted) {
          const entry = this.passedMap()[slot.course.course_id];
          if (entry?.grade && !['F','U','W'].includes(entry.grade)) {
            done += +(slot.course.credit);
          }
        }
      });
      return done;
    }
    let done = 0;
    (cat.modules ?? []).forEach((m: any) => {
      (m.courses ?? []).forEach((c: any) => {
        const entry = this.passedMap()[+c.course_id];
        if (entry?.grade && !['F','U','W'].includes(entry.grade)) {
          done += +(c.credit);
        }
      });
    });
    return done;
  }

  isCurriculumCourse(courseId: number): boolean {
    for (const cat of this.curriculum()) {
      for (const mod of (cat.modules ?? [])) {
        for (const c of (mod.courses ?? [])) {
          if (+c.course_id === +courseId) return true;
        }
      }
    }
    return false;
  }

  // ─── Free Elective Search ──────────────────────────────────
  onFreeSearch(idx: number, query: string, event?: Event) {
    if (event) {
      const el = event.target as HTMLElement;
      const rect = el.getBoundingClientRect();
      this.freeDropdownRect = { top: rect.bottom + 4, left: rect.left, width: Math.max(rect.width, 360) };
      this.activeDropdownSlot = idx;
    }
    this.freeSlots.set(this.freeSlots().map((s, i) => i === idx ? { ...s, query } : s));
    clearTimeout(this.searchTimers[idx]);
    if (query.length < 2) {
      this.freeSlots.set(this.freeSlots().map((s, i) => i === idx ? { ...s, results: [], show: false } : s));
      return;
    }
    this.searchTimers[idx] = setTimeout(() => {
      this.http.get<any[]>(`${this.apiUrl}/search_courses.php?q=${encodeURIComponent(query)}`).subscribe({
        next: results => {
          this.freeSlots.set(this.freeSlots().map((s, i) => i === idx ? { ...s, results, show: true } : s));
        }
      });
    }, 300);
  }

  selectFreeCourse(idx: number, course: any) {
    const inCurriculum = this.isCurriculumCourse(+course.course_id);
    const inOtherSlot  = this.freeSlots().some((s, i) => i !== idx && +s.course?.course_id === +course.course_id);
    const conflicted   = inCurriculum || inOtherSlot;

    this.freeSlots.set(this.freeSlots().map((s, i) =>
      i === idx ? { ...s, query: `${course.course_code} – ${course.course_name}`, results: [], show: false, course, conflicted } : s
    ));
    if (!conflicted && !this.passedMap()[course.course_id]) {
      this.passedMap.set({ ...this.passedMap(), [course.course_id]: { grade: '', semester: 1, year: 2566 } });
    }
  }

  clearFreeSlot(idx: number) {
    const slot = this.freeSlots()[idx];
    if (slot.course && !slot.conflicted) {
      this.http.post(`${this.apiUrl}/save_student_course_check.php`, {
        student_id: this.studentId(), course_id: slot.course.course_id, is_checked: false
      }).subscribe();
      const map = { ...this.passedMap() };
      delete map[slot.course.course_id];
      this.passedMap.set(map);
    }
    this.freeSlots.set(this.freeSlots().map((s, i) =>
      i === idx ? { query: '', results: [], show: false, course: null, conflicted: false } : s
    ));
  }

  closeFreeDropdown(idx: number) {
    setTimeout(() => {
      this.freeSlots.set(this.freeSlots().map((s, i) => i === idx ? { ...s, show: false } : s));
      if (this.activeDropdownSlot === idx) {
        this.activeDropdownSlot = -1;
        this.freeDropdownRect = null;
      }
    }, 200);
  }

  isSaving(courseId: number) { return this.savingSet().has(courseId); }

  onGradeChange(courseId: number, grade: string) {
    if (!grade) {
      // ลบวิชาออก
      this.http.post(`${this.apiUrl}/save_student_course_check.php`, {
        student_id: this.studentId(), course_id: courseId, is_checked: false
      }).subscribe();
      const map = { ...this.passedMap() };
      delete map[courseId];
      this.passedMap.set(map);
      return;
    }

    const cur = this.getCourse(courseId);
    const data = { grade, semester: cur.semester || 1, year: cur.year || 2566 };
    this.passedMap.set({ ...this.passedMap(), [courseId]: data });
    this.saveCourse(courseId, data);
  }

  onFieldChange(courseId: number, field: 'semester' | 'year', value: number) {
    const cur = this.getCourse(courseId);
    if (!cur.grade) return;

    const data = { ...cur, [field]: value };
    this.passedMap.set({ ...this.passedMap(), [courseId]: data });

    clearTimeout(this.saveTimers[courseId]);
    this.saveTimers[courseId] = setTimeout(() => this.saveCourse(courseId, data), 600);
  }

  private saveCourse(courseId: number, data: { grade: string; semester: number; year: number }) {
    const s = new Set(this.savingSet());
    s.add(courseId);
    this.savingSet.set(s);

    this.http.post<any>(`${this.apiUrl}/save_student_course_check.php`, {
      student_id: this.studentId(),
      course_id:  courseId,
      grade:      data.grade,
      semester:   data.semester,
      year:       data.year
    }).subscribe({
      next: () => {
        const set = new Set(this.savingSet());
        set.delete(courseId);
        this.savingSet.set(set);
      }
    });
  }
}
