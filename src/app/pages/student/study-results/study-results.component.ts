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

  readonly gradeOptionsAF = ['', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F', 'W'];
  readonly gradeOptionsSU = ['', 'S', 'U'];

  private saveTimers: Record<number, any> = {};

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

  loadStudyResults() {
    const studentCode = localStorage.getItem('student_code') || localStorage.getItem('username') || '6504800006';
    if (!studentCode) return;

    this.http.get<any>(`${this.apiUrl}/get_study_results.php?student_code=${studentCode}&t=${Date.now()}`).subscribe({
      next: res => {
        console.log('[study-results] API response:', res);
        if (res.error) { console.error('[study-results] error:', res.error); return; }
        this.gpax.set(res.gpax);
        this.latestGpa.set(res.latest_gpa);
        this.creditsDone.set(res.total_credits_done);
        this.creditsNeed.set(res.total_credits_need);
        this.allSubjects.set(res.subjects);
        this.creditSummary.set(res.credit_summary);
        this.terms.set(res.terms);
        if (res.terms.length > 0) this.selectedTerm.set(res.terms[0]);
        console.log('[study-results] subjects:', res.subjects?.length, '| terms:', res.terms, '| selected:', res.terms?.[0]);
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
    this.showModal.set(false);
    this.loadStudyResults();
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
