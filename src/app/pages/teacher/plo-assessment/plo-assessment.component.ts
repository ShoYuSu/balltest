import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';

interface EvalSubItem {
  id: string;
  code: string;
  name: string;
  status: 'passed' | 'failed' | null;
}

interface EvalCard {
  id: string;
  type: 'PLO' | 'YLO';
  code: string;
  name: string;
  subItems: EvalSubItem[];
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

  evalCards = signal<EvalCard[]>([]);

  ngOnInit() {
    this.loadData();
  }

  // 1. ดึงรายชื่อนักศึกษาจากฐานข้อมูล
  // 1. ดึงรายชื่อนักศึกษาจากฐานข้อมูล
  loadData() {
    this.http
      // 👉 แก้ตรงนี้: เปลี่ยนจาก <any[]> เป็น <any> เฉยๆ ครับ
      .get<any>(`${environment.apiUrl}/get_plo_assessments.php?advisor_id=14&t=${Date.now()}`)
      .subscribe({
        next: (data) => {
          // คราวนี้มันจะไม่ด่าบรรทัดนี้แล้วครับ
          if (data.error) {
            console.error('Database Error:', data.error);
            return;
          }
          if (!Array.isArray(data)) return;

          const formattedData = data.map((s) => ({
            ...s,
            img: s.img
              ? `${environment.apiUrl}/${s.img}`
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=fff7ed&color=ea580c`,
          }));
          this.students.set(formattedData);
        },
        error: (err) => console.error('Failed to load PLO assessments', err),
      });
  }
  // 2. เปิด Modal และยิง API ดึงโครงสร้าง PLO/YLO (ของจริง ไม่มี Mock)
  openEvalModal(student: StudentAssessment, event: Event) {
    event.stopPropagation();
    this.selectedStudent.set(student);
    this.isEvalModalOpen.set(true);
    this.isLoadingEval.set(true);
    this.evalCards.set([]); // เคลียร์ของเก่า

    this.http
      .get<
        EvalCard[]
      >(`${environment.apiUrl}/get_student_eval_structure.php?student_id=${student.id}&t=${Date.now()}`)
      .subscribe({
        next: (data) => {
          if (Array.isArray(data)) {
            this.evalCards.set(data); // เอาข้อมูลจาก DB มาใส่เลย
          }
          this.isLoadingEval.set(false);
        },
        error: (err) => {
          console.error('Failed to load structure', err);
          this.isLoadingEval.set(false);
        },
      });
  }

  closeEvalModal() {
    this.isEvalModalOpen.set(false);
    this.selectedStudent.set(null);
  }

  // 3. จัดการสถานะ ผ่าน/ไม่ผ่าน บนหน้าจอ
  setSubItemStatus(cardIndex: number, subIndex: number, status: 'passed' | 'failed') {
    const cards = [...this.evalCards()];
    cards[cardIndex].subItems[subIndex].status = status;
    this.evalCards.set(cards);
  }

  // 4. คำนวณหลอดสีเขียว
  calculateProgress(card: EvalCard): number {
    if (!card.subItems || card.subItems.length === 0) return 0;
    const passedCount = card.subItems.filter((s) => s.status === 'passed').length;
    return Math.round((passedCount / card.subItems.length) * 100);
  }

  // 5. บันทึกข้อมูลลงฐานข้อมูล (ของจริง ไม่มี Timeout หลอก)
  saveEvaluation() {
    const student = this.selectedStudent();
    if (!student) return;

    this.isSaving.set(true);

    const payload = {
      student_id: student.id,
      evaluations: this.evalCards(),
    };

    this.http.post<any>(`${environment.apiUrl}/save_plo_assessment.php`, payload).subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.closeEvalModal();
          this.loadData(); // รีเฟรชข้อมูลหน้าตารางให้เป็นอัปเดตล่าสุด
        }
        this.isSaving.set(false);
      },
      error: (err) => {
        console.error('Error saving evaluation', err);
        this.isSaving.set(false);
      },
    });
  }

  // --- ส่วนของ Filter & Pagination ด้านล่าง ---
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
