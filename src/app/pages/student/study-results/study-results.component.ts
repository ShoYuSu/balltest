import {
  Component, OnInit, inject, signal, computed,
  HostListener, ElementRef, ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { getAuthUser } from '../auth-user.util';
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
  curriculumMajor = signal('');
  curriculumYear  = signal('');
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
    const studentCode = getAuthUser().student_code;
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

  printTranscript() {
    const name = getAuthUser().full_name;
    const code = getAuthUser().student_code;
    const subjects = this.allSubjects();
    const summary = this.creditSummary();

    const termGroups: Record<string, any[]> = {};
    subjects.forEach((s: any) => {
      if (!termGroups[s.term]) termGroups[s.term] = [];
      termGroups[s.term].push(s);
    });

    const summaryRows = summary.map((c: any) =>
      `<tr><td>${c.name}</td><td class="c">${c.done}</td><td class="c">${c.need}</td><td class="c" style="color:${c.done >= c.need ? '#16a34a' : '#dc2626'}">${c.done >= c.need ? '✓' : `ขาด ${c.need - c.done}`}</td></tr>`
    ).join('');

    let termTables = '';
    Object.entries(termGroups).forEach(([term, subs]) => {
      const rows = (subs as any[]).map(s =>
        `<tr><td>${s.code}</td><td>${s.name}</td><td class="c">${s.credit}</td><td class="c g">${s.grade || '-'}</td></tr>`
      ).join('');
      termTables += `<h3>${term}</h3><table><thead><tr><th>รหัสวิชา</th><th>ชื่อวิชา</th><th class="c">นก.</th><th class="c">เกรด</th></tr></thead><tbody>${rows}</tbody></table>`;
    });

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>ผลการเรียน</title>
<link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Sarabun,Tahoma,Arial,sans-serif;padding:28px 36px;font-size:13px;color:#111;max-width:800px;margin:0 auto}
h1{font-size:20px;font-weight:700;margin-bottom:4px}
.sub{color:#555;font-size:12px;margin-bottom:16px}
.stats{display:flex;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;margin-bottom:20px}
.stat{flex:1;text-align:center;padding:10px 8px;border-right:1px solid #e5e7eb}
.stat:last-child{border-right:none}
.stat-v{font-size:20px;font-weight:800;color:#8B5E3C}
.stat-l{font-size:10px;color:#9ca3af;margin-top:1px}
h3{font-size:13px;font-weight:700;color:#8B5E3C;margin:18px 0 6px;padding-bottom:4px;border-bottom:2px solid #fde8c8}
table{width:100%;border-collapse:collapse;margin-bottom:4px;font-size:12px}
th,td{border:1px solid #e5e7eb;padding:5px 8px;text-align:left}
th{background:#f9fafb;font-weight:700;font-size:11px}
.c{text-align:center}.g{font-weight:700}
tr{page-break-inside:avoid}
table{page-break-inside:auto}
.btn-bar{display:flex;gap:10px;margin-top:28px}
.btn{padding:9px 22px;border:none;border-radius:8px;cursor:pointer;font-family:inherit;font-size:13px;font-weight:600}
.btn-print{background:#8B5E3C;color:#fff}
.btn-pdf{background:#dc2626;color:#fff}
.btn:disabled{opacity:.6;cursor:not-allowed}
@media print{.btn-bar{display:none}}
</style></head><body>
<div id="content">
<h1>ผลการเรียน — ${name}</h1>
<div class="sub">รหัสนักศึกษา: ${code}</div>
<div class="stats">
  <div class="stat"><div class="stat-v">${this.gpax()}</div><div class="stat-l">GPAX</div></div>
  <div class="stat"><div class="stat-v">${this.latestGpa()}</div><div class="stat-l">GPA ล่าสุด</div></div>
  <div class="stat"><div class="stat-v">${this.creditsDone()}/${this.creditsNeed()}</div><div class="stat-l">หน่วยกิตสะสม</div></div>
</div>
<h3>สรุปหน่วยกิตตามหมวดวิชา</h3>
<table><thead><tr><th>หมวดวิชา</th><th class="c">สะสมแล้ว</th><th class="c">ต้องการ</th><th class="c">สถานะ</th></tr></thead><tbody>${summaryRows}</tbody></table>
${termTables}
</div>
<div class="btn-bar">
  <button class="btn btn-print" onclick="window.print()">🖨️ พิมพ์</button>
  <button class="btn btn-pdf" id="dlBtn" onclick="dlPdf()">⬇ ดาวน์โหลด PDF</button>
</div>
<script>
function dlPdf(){
  var btn=document.getElementById('dlBtn');
  btn.textContent='กำลังสร้าง...'; btn.disabled=true;
  function run(){
    window.html2pdf().set({
      margin:[10,10,10,10], filename:'ผลการเรียน_${code}.pdf',
      image:{type:'jpeg',quality:0.97},
      html2canvas:{scale:2,useCORS:true,logging:false,scrollY:0},
      jsPDF:{unit:'mm',format:'a4',orientation:'portrait'},
      pagebreak:{mode:['avoid-all','css','legacy']}
    }).from(document.getElementById('content')).save()
    .then(function(){ btn.textContent='⬇ ดาวน์โหลด PDF'; btn.disabled=false; });
  }
  if(window.html2pdf){ run(); return; }
  var s=document.createElement('script');
  s.src='https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
  s.onload=run; document.head.appendChild(s);
}
</script>
</body></html>`;

    const win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); }
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
    const userId = getAuthUser().user_id;
    if (!userId) return;

    this.http.get<any>(`${this.apiUrl}/get_student_profile.php?user_id=${userId}`).subscribe({
      next: profile => {
        this.studentId.set(profile.student_id);
        this.curriculumMajor.set(profile.major || '');
        this.curriculumYear.set(profile.curriculum_year || '');

        forkJoin({
          curriculum: this.http.get<any>(`${this.apiUrl}/get_curriculum.php?major_name=${encodeURIComponent(profile.major)}`),
          passed:     this.http.get<any[]>(`${this.apiUrl}/get_student_passed_courses.php?student_id=${profile.student_id}`)
        }).subscribe({
          next: ({ curriculum, passed }) => {
            // get_curriculum.php ส่งกลับเป็น { success, curriculum_year, categories }
            // ไม่ใช่ array ตรงๆ ต้องดึง .categories ออกมาก่อน
            const categories = curriculum?.categories ?? [];
            this.curriculum.set(categories);
            if (curriculum?.curriculum_year) {
              this.curriculumYear.set(String(curriculum.curriculum_year));
            }

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
            categories.forEach((cat: any) =>
              cat.modules?.forEach((m: any) =>
                m.courses?.forEach((c: any) => currIds.add(+c.course_id))
              )
            );
            const freeIds = passed.filter((p: any) => !currIds.has(+p.course_id)).map((p: any) => +p.course_id);

            if (freeIds.length > 0) {
              this.http.get<any[]>(`${this.apiUrl}/search_courses.php?ids=${freeIds.join(',')}`).subscribe({
                next: courses => {
                  const slotCount = Math.max(2, freeIds.length);
                  this.freeSlots.set(
                    Array.from({ length: slotCount }, (_, i) => {
                      const id = freeIds[i];
                      const c = id ? courses.find((x: any) => +x.course_id === id) : null;
                      return c
                        ? { query: `${c.course_code} – ${c.course_name}`, results: [], show: false, course: c, conflicted: false }
                        : { query: '', results: [], show: false, course: null, conflicted: false };
                    })
                  );
                }
              });
            } else {
              this.freeSlots.set([
                { query: '', results: [], show: false, course: null, conflicted: false },
                { query: '', results: [], show: false, course: null, conflicted: false },
              ]);
            }

            this.modalLoading.set(false);
          },
          error: err => {
            console.error('[study-results] modal data load error:', err);
            this.modalLoading.set(false);
          }
        });
      },
      error: err => {
        console.error('[study-results] profile load error:', err);
        this.modalLoading.set(false);
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

  addFreeSlot() {
    this.freeSlots.update(slots => [
      ...slots,
      { query: '', results: [], show: false, course: null, conflicted: false }
    ]);
  }

  removeFreeSlot(idx: number) {
    const slot = this.freeSlots()[idx];
    if (slot.course && !slot.conflicted) {
      this.http.post(`${this.apiUrl}/save_student_course_check.php`, {
        student_id: this.studentId(), course_id: slot.course.course_id, is_checked: false
      }).subscribe();
      const map = { ...this.passedMap() };
      delete map[slot.course.course_id];
      this.passedMap.set(map);
    }
    if (this.activeDropdownSlot === idx) {
      this.activeDropdownSlot = -1;
      this.freeDropdownRect = null;
    }
    this.freeSlots.update(slots => slots.filter((_, i) => i !== idx));
  }

  get freeCreditsDone(): number {
    return this.freeSlots().reduce((sum, slot) => {
      if (!slot.course || slot.conflicted) return sum;
      const entry = this.passedMap()[slot.course.course_id];
      if (entry?.grade && !['F', 'U', 'W'].includes(entry.grade)) {
        return sum + +(slot.course.credit || 0);
      }
      return sum;
    }, 0);
  }

  get freeCreditsNeed(): number {
    const elective = this.creditSummary().find((x: any) => x.key === 'elective');
    return elective ? +(elective.need) : 6;
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