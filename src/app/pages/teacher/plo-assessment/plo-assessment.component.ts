import { Component, OnInit, signal, computed, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';

interface EvalYLO {
  ylo_id: number;
  sub_plo_id: number | null;
  plo_id?: number; // เพิ่ม plo_id เข้ามาเพื่อเชื่อมสำหรับหลักสูตรอาหาร
  ylo_name: string;
  description: string;
  status: 'passed' | 'failed' | null;
}

interface EvalSubPLO {
  sub_plo_id: number;
  sub_plo_name: string;
  description: string;
  ylos: EvalYLO[];
}

interface EvalPLO {
  plo_id: number;
  plo_name: string;
  description: string;
  sub_plos: EvalSubPLO[];
  direct_ylos?: EvalYLO[]; // 🎯 เพิ่ม Array สำหรับรองรับ YLO ที่ต่อตรงกับ PLO (หลักสูตรอาหาร)
}

interface StudentAssessment {
  id: string;
  name: string;
  studentId: string;
  status: 'pending' | 'passed' | 'failed';
  statusText: string;
  img: string;
  plos?: { label: string; score: number }[];
  average?: number | null;
}

@Component({
  selector: 'app-plo-assessment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './plo-assessment.component.html',
  styleUrl: './plo-assessment.component.css',
})
export class PloAssessmentComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  isDragging = false;
  startX = 0;
  scrollLeft = 0;

  activeTab = signal<'ทั้งหมด' | 'รอประเมิน' | 'ผ่าน' | 'ไม่ผ่าน'>('ทั้งหมด');
  currentPage = signal(1);
  itemsPerPage = 5;
  searchQuery = signal('');
  students = signal<StudentAssessment[]>([]);

  showEvalPage = signal(false);
  isSaving = signal(false);
  isLoadingEval = signal(false);
  selectedStudent = signal<StudentAssessment | null>(null);

  evalPLOs = signal<EvalPLO[]>([]);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.http
      .get<any>(`${environment.apiUrl}/get_plo_assessments.php?advisor_id=14&t=${Date.now()}`)
      .subscribe({
        next: (data) => {
          if (!data || !Array.isArray(data)) {
            this.students.set([]);
            return;
          }
          const formattedData = data.map((s) => ({
            ...s,
            name: s.name || 'ไม่ระบุชื่อ',
            studentId: s.studentId || '-',
            img: s.img
              ? `${environment.apiUrl}/${s.img}`
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name || 'User')}&background=fff7ed&color=ea580c`,
          }));

          this.students.set(formattedData);

          const state = history.state;
          if (state && state.autoOpenEval && state.targetStudentId) {
            const target = formattedData.find((s) => s.studentId === state.targetStudentId);
            if (target) {
              this.openEvalPage(target);
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          }
        },
        error: (err) => {
          console.error('Failed to load data:', err);
          this.students.set([]);
        },
      });
  }

  openEvalPage(student: StudentAssessment, event?: Event) {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const scrollContainers = document.querySelectorAll(
        '.overflow-y-auto, .overflow-x-auto, .custom-scrollbar',
      );
      scrollContainers.forEach((container) =>
        container.scrollTo({ top: 0, left: 0, behavior: 'smooth' }),
      );
    }, 50);

    if (event) {
      event.stopPropagation();
    }

    this.selectedStudent.set(student);
    this.showEvalPage.set(true);
    this.isLoadingEval.set(true);
    this.evalPLOs.set([]);

    this.http
      .get<any>(
        `${environment.apiUrl}/get_student_eval_structure.php?student_id=${student.id}&t=${Date.now()}`,
      )
      .subscribe({
        next: (data) => {
          const rawPLOs = data.plos || [];
          const rawYLOs = data.ylos || [];

          const structuredPLOs = rawPLOs.map((plo: any) => {
            // 1. แยก YLO ที่เป็นของ SubPLO (วิทคอม)
            const sub_plos = (plo.sub_plos || []).map((sub: any) => {
              return {
                ...sub,
                ylos: rawYLOs
                  .filter((y: any) => y.sub_plo_id === sub.sub_plo_id)
                  .map((y: any) => ({
                    ylo_id: y.ylo_id,
                    sub_plo_id: y.sub_plo_id,
                    plo_id: y.plo_id,
                    ylo_name: y.ylo_name,
                    description: y.description,
                    status: y.status,
                  })),
              };
            });

            // 2. แยก YLO ที่ต่อตรงกับ PLO โดยไม่มี SubPLO (หลักสูตรอาหาร)
            const direct_ylos = rawYLOs
              .filter((y: any) => y.plo_id === plo.plo_id && (!y.sub_plo_id || y.sub_plo_id == 0))
              .map((y: any) => ({
                ylo_id: y.ylo_id,
                sub_plo_id: null,
                plo_id: y.plo_id,
                ylo_name: y.ylo_name,
                description: y.description,
                status: y.status,
              }));

            return {
              ...plo,
              sub_plos: sub_plos,
              direct_ylos: direct_ylos, // ยัดใส่ Array แยกไว้
            };
          });

          this.evalPLOs.set(structuredPLOs);
          this.isLoadingEval.set(false);
        },
        error: () => this.isLoadingEval.set(false),
      });
  }

  closeEvalPage() {
    this.showEvalPage.set(false);
    this.selectedStudent.set(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // 🎯 สร้างฟังก์ชันใหม่สำหรับ Toggle สถานะ โดยอิงจาก "ชื่อ YLO" แทน Index เพื่อความครอบคลุม
  toggleYloStatus(
    targetYloName: string,
    currentStatus: string | null,
    newStatusToSet: 'passed' | 'failed',
  ) {
    const newStatus = currentStatus === newStatusToSet ? null : newStatusToSet;
    const plos = [...this.evalPLOs()];

    plos.forEach((plo) => {
      // อัปเดตในกลุ่มที่มี SubPLO (วิทคอม)
      plo.sub_plos?.forEach((sub) => {
        sub.ylos?.forEach((ylo) => {
          if (ylo.ylo_name === targetYloName) ylo.status = newStatus;
        });
      });
      // อัปเดตในกลุ่มที่ไม่มี SubPLO (หลักสูตรอาหาร)
      plo.direct_ylos?.forEach((ylo) => {
        if (ylo.ylo_name === targetYloName) ylo.status = newStatus;
      });
    });

    this.evalPLOs.set(plos);
  }

  calculateSubPLOProgress(sub: EvalSubPLO): number {
    if (!sub.ylos || sub.ylos.length === 0) return 0;
    const passed = sub.ylos.filter((y) => y.status === 'passed').length;
    return Math.round((passed / sub.ylos.length) * 100);
  }

  calculatePLOProgress(plo: EvalPLO): number {
    // 🎯 กรณีที่ 1: หลักสูตรที่มี Sub-PLO (วิทคอม)
    if (plo.sub_plos && plo.sub_plos.length > 0) {
      let totalSubScore = 0;
      plo.sub_plos.forEach((sub) => {
        totalSubScore += this.calculateSubPLOProgress(sub);
      });
      return Math.round(totalSubScore / plo.sub_plos.length);
    }

    // 🎯 กรณีที่ 2: หลักสูตรที่ไม่มี Sub-PLO ใช้ YLO ตรงๆ (อาหาร)
    if (plo.direct_ylos && plo.direct_ylos.length > 0) {
      const passed = plo.direct_ylos.filter((y) => y.status === 'passed').length;
      return Math.round((passed / plo.direct_ylos.length) * 100);
    }

    return 0; // Fallback
  }

  saveEvaluation() {
    const student = this.selectedStudent();
    if (!student) return;
    this.isSaving.set(true);

    const evaluatedPLOs = this.evalPLOs().map((p) => ({
      code: p.plo_name,
      score: this.calculatePLOProgress(p),
    }));

    const evaluatedYLOs: any[] = [];
    this.evalPLOs().forEach((p) => {
      // เซฟ YLO ในวิทคอม
      p.sub_plos?.forEach((s) => {
        s.ylos?.forEach((y) => {
          if (y.status !== null) {
            evaluatedYLOs.push({ id: y.ylo_id, is_passed: y.status === 'passed' ? 1 : 0 });
          }
        });
      });
      // เซฟ YLO ในหลักสูตรอาหาร
      p.direct_ylos?.forEach((y) => {
        if (y.status !== null) {
          evaluatedYLOs.push({ id: y.ylo_id, is_passed: y.status === 'passed' ? 1 : 0 });
        }
      });
    });

    const payload = {
      student_id: student.id,
      advisor_id: 14,
      plos: evaluatedPLOs,
      ylos: evaluatedYLOs,
    };

    this.http.post<any>(`${environment.apiUrl}/save_plo_assessment.php`, payload).subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.closeEvalPage();
          this.loadData();
        }
        this.isSaving.set(false);
      },
      error: () => this.isSaving.set(false),
    });
  }

  filteredStudents = computed(() => {
    const tab = this.activeTab();
    const query = (this.searchQuery() || '').toLowerCase().trim();
    let result = this.students();
    if (tab === 'รอประเมิน') result = result.filter((s) => s.status === 'pending');
    if (tab === 'ผ่าน') result = result.filter((s) => s.status === 'passed');
    if (tab === 'ไม่ผ่าน') result = result.filter((s) => s.status === 'failed');
    if (query) result = result.filter((s) => this.matchesSearch(s));
    return result;
  });

  paginatedStudents = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return this.filteredStudents().slice(start, start + this.itemsPerPage);
  });

  totalPages = computed(() => Math.ceil(this.filteredStudents().length / this.itemsPerPage) || 1);
  pageNumbers = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));
  countAll = computed(() => this.students().filter((s) => this.matchesSearch(s)).length);
  countPending = computed(
    () => this.students().filter((s) => s.status === 'pending' && this.matchesSearch(s)).length,
  );
  countPassed = computed(
    () => this.students().filter((s) => s.status === 'passed' && this.matchesSearch(s)).length,
  );
  countFailed = computed(
    () => this.students().filter((s) => s.status === 'failed' && this.matchesSearch(s)).length,
  );

  private matchesSearch(s: StudentAssessment): boolean {
    const q = (this.searchQuery() || '').toLowerCase().trim();
    if (!q) return true;
    const name = (s.name || '').toLowerCase();
    const id = (s.studentId || '').toLowerCase();
    return name.includes(q) || id.includes(q);
  }

  setTab(tab: 'ทั้งหมด' | 'รอประเมิน' | 'ผ่าน' | 'ไม่ผ่าน') {
    this.activeTab.set(tab);
    this.currentPage.set(1);
  }
  goToPage(page: number) {
    this.currentPage.set(page);
  }
  nextPage() {
    if (this.currentPage() < this.totalPages()) this.currentPage.update((p) => p + 1);
  }
  prevPage() {
    if (this.currentPage() > 1) this.currentPage.update((p) => p - 1);
  }
  getProgressBarColor(score: number): string {
    return (score || 0) >= 50 ? 'bg-[#10B981]' : 'bg-[#EF4444]';
  }
  getProgressTextColor(score: number): string {
    return (score || 0) >= 50 ? 'text-[#10B981]' : 'text-[#EF4444]';
  }

  goToStudentResult(student: StudentAssessment) {
    const studentData = {
      id: student.studentId,
      name: student.name,
      img: student.img,
      ploStatus: student.statusText,
      year: '-',
    };
    this.router.navigate(['/student-result', student.studentId], {
      state: { student: studentData },
    });
  }

  startDragging(e: MouseEvent) {
    this.isDragging = true;
    this.startX = e.pageX - this.scrollContainer.nativeElement.offsetLeft;
    this.scrollLeft = this.scrollContainer.nativeElement.scrollLeft;
  }
  stopDragging() {
    this.isDragging = false;
  }
  moveEvent(e: MouseEvent) {
    if (!this.isDragging) return;
    e.preventDefault();
    const x = e.pageX - this.scrollContainer.nativeElement.offsetLeft;
    const walk = (x - this.startX) * 1.5;
    this.scrollContainer.nativeElement.scrollLeft = this.scrollLeft - walk;
  }
}
