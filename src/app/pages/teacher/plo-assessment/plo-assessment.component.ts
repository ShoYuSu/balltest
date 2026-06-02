import { Component, OnInit, signal, computed, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';

interface EvalSubPLO {
  sub_plo_id: number;
  sub_plo_name: string;
  description: string;
  status: 'passed' | 'failed' | null;
}

interface EvalPLO {
  plo_id: number;
  plo_name: string;
  description: string;
  sub_plos: EvalSubPLO[];
}

interface EvalYLO {
  ylo_id: number;
  ylo_name: string;
  description: string;
  status: 'passed' | 'failed' | null;
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
  evalYLOs = signal<EvalYLO[]>([]);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.http
      .get<any>(`${environment.apiUrl}/get_plo_assessments.php?advisor_id=14&t=${Date.now()}`)
      .subscribe({
        next: (data) => {
          if (!Array.isArray(data)) return;
          const formattedData = data.map((s) => ({
            ...s,
            img: s.img
              ? `${environment.apiUrl}/${s.img}`
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=fff7ed&color=ea580c`,
          }));
          this.students.set(formattedData);
        },
      });
  }

  openEvalPage(student: StudentAssessment, event: Event) {
    event.stopPropagation();
    this.selectedStudent.set(student);
    this.showEvalPage.set(true);
    this.isLoadingEval.set(true);

    window.scrollTo({ top: 0, behavior: 'smooth' });

    this.evalPLOs.set([]);
    this.evalYLOs.set([]);

    this.http
      .get<any>(
        `${environment.apiUrl}/get_student_eval_structure.php?student_id=${student.id}&t=${Date.now()}`,
      )
      .subscribe({
        next: (data) => {
          if (data.plos) this.evalPLOs.set(data.plos);
          if (data.ylos) this.evalYLOs.set(data.ylos);
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

  setSubPLOStatus(ploIndex: number, subIndex: number, status: 'passed' | 'failed') {
    const plos = [...this.evalPLOs()];
    plos[ploIndex].sub_plos[subIndex].status = status;
    this.evalPLOs.set(plos);
  }

  setYLOStatus(yloIndex: number, status: 'passed' | 'failed') {
    const ylos = [...this.evalYLOs()];
    ylos[yloIndex].status = status;
    this.evalYLOs.set(ylos);
  }

  calculatePLOProgress(plo: EvalPLO): number {
    if (!plo.sub_plos || plo.sub_plos.length === 0) return 0;
    const passed = plo.sub_plos.filter((s) => s.status === 'passed').length;
    return Math.round((passed / plo.sub_plos.length) * 100);
  }

  // 🎯 อัปเดต: ส่งข้อมูล SubPLO ไปบันทึกลงฐานข้อมูลด้วย!
  saveEvaluation() {
    const student = this.selectedStudent();
    if (!student) return;
    this.isSaving.set(true);

    const evaluatedPLOs = this.evalPLOs().map((p) => ({
      code: p.plo_name,
      score: this.calculatePLOProgress(p),
    }));

    // ดึงสถานะ SubPLO ที่กดไป
    const evaluatedSubPLOs: any[] = [];
    this.evalPLOs().forEach((p) => {
      if (p.sub_plos) {
        p.sub_plos.forEach((s) => {
          if (s.status !== null) {
            evaluatedSubPLOs.push({
              id: s.sub_plo_id,
              is_passed: s.status === 'passed' ? 1 : 0,
            });
          }
        });
      }
    });

    const evaluatedYLOs = this.evalYLOs()
      .filter((y) => y.status !== null)
      .map((y) => ({
        id: y.ylo_id,
        is_passed: y.status === 'passed' ? 1 : 0,
      }));

    const payload = {
      student_id: student.id,
      advisor_id: 14,
      plos: evaluatedPLOs,
      sub_plos: evaluatedSubPLOs, // 🚀 ยัด SubPLO ใส่ไปด้วย
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
    const query = this.searchQuery().toLowerCase().trim();
    let result = this.students();
    if (tab === 'รอประเมิน') result = result.filter((s) => s.status === 'pending');
    if (tab === 'ผ่าน') result = result.filter((s) => s.status === 'passed');
    if (tab === 'ไม่ผ่าน') result = result.filter((s) => s.status === 'failed');
    if (query)
      result = result.filter(
        (s) => s.name.toLowerCase().includes(query) || s.studentId.toLowerCase().includes(query),
      );
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
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return true;
    return s.name.toLowerCase().includes(q) || s.studentId.toLowerCase().includes(q);
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
    return score >= 50 ? 'bg-[#10B981]' : 'bg-[#EF4444]';
  }
  getProgressTextColor(score: number): string {
    return score >= 50 ? 'text-[#10B981]' : 'text-[#EF4444]';
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

  // 🌟 สำหรับคลิกแล้วลากเลื่อนจอซ้ายขวา (Drag to scroll)
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
