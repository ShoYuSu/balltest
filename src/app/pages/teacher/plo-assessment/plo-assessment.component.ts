import { Component, OnInit, signal, computed, inject } from '@angular/core';
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

  activeTab = signal<'ทั้งหมด' | 'รอประเมิน' | 'ผ่าน' | 'ไม่ผ่าน'>('ทั้งหมด');
  currentPage = signal(1);
  itemsPerPage = 5;
  searchQuery = signal('');
  students = signal<StudentAssessment[]>([]);

  isEvalModalOpen = signal(false);
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

  openEvalModal(student: StudentAssessment, event: Event) {
    event.stopPropagation();
    this.selectedStudent.set(student);
    this.isEvalModalOpen.set(true);
    this.isLoadingEval.set(true);

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

  closeEvalModal() {
    this.isEvalModalOpen.set(false);
    this.selectedStudent.set(null);
  }

  // 🎯 ให้กดผ่านเฉพาะระดับ SubPLO
  setSubPLOStatus(ploIndex: number, subIndex: number, status: 'passed' | 'failed') {
    const plos = [...this.evalPLOs()];
    plos[ploIndex].sub_plos[subIndex].status = status;
    this.evalPLOs.set(plos);
  }

  // 🎯 YLO แยกกดอิสระ
  setYLOStatus(yloIndex: number, status: 'passed' | 'failed') {
    const ylos = [...this.evalYLOs()];
    ylos[yloIndex].status = status;
    this.evalYLOs.set(ylos);
  }

  // 🎯 คำนวณ % ให้ PLO จากจำนวน SubPLO ที่ผ่าน
  calculatePLOProgress(plo: EvalPLO): number {
    if (!plo.sub_plos || plo.sub_plos.length === 0) return 0;
    const passed = plo.sub_plos.filter((s) => s.status === 'passed').length;
    return Math.round((passed / plo.sub_plos.length) * 100);
  }

  saveEvaluation() {
    const student = this.selectedStudent();
    if (!student) return;
    this.isSaving.set(true);

    // ดึงเปอร์เซ็นต์ของ PLO ส่งไปเก็บในตาราง scores
    const evaluatedPLOs = this.evalPLOs().map((p) => ({
      code: p.plo_name,
      score: this.calculatePLOProgress(p),
    }));

    // ดึงผล YLO ที่ประเมิน ส่งไปเก็บในตาราง assessment_details
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
      ylos: evaluatedYLOs,
    };

    this.http.post<any>(`${environment.apiUrl}/save_plo_assessment.php`, payload).subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.closeEvalModal();
          this.loadData();
        }
        this.isSaving.set(false);
      },
      error: () => this.isSaving.set(false),
    });
  }

  // --- ส่วนอื่นๆ เหมือนเดิมครับ ---
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
}
