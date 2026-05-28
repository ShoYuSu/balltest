import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';

interface PloScore {
  label: string;
  score: number;
}

interface StudentAssessment {
  id: string; // Internal DB ID (student_id)
  name: string;
  studentId: string; // รหัสนักศึกษา
  status: 'pending' | 'passed' | 'failed';
  statusText: string;
  img: string;
  plos?: PloScore[];
  average?: number | null;
}

// 👉 Interface สำหรับรองรับโครงสร้างตัวชี้วัด
interface EvalScore {
  code: string;
  name: string;
  type: 'PLO' | 'Sub-PLO' | 'YLO';
  score: number;
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

  // --- ตัวแปรจัดการหน้าจอและการค้นหา ---
  activeTab = signal<'ทั้งหมด' | 'รอประเมิน' | 'ผ่าน' | 'ไม่ผ่าน'>('ทั้งหมด');
  currentPage = signal(1);
  itemsPerPage = 5;
  searchQuery = signal('');
  students = signal<StudentAssessment[]>([]);

  // --- ตัวแปรสำหรับคุม Modal ประเมินผล ---
  isEvalModalOpen = signal(false);
  isSaving = signal(false);
  isLoadingEval = signal(false); // ควบคุมสถานะโหลดข้อมูลใน Modal
  selectedStudent = signal<StudentAssessment | null>(null);
  evalScores = signal<EvalScore[]>([]); // เก็บโครงสร้างและคะแนนที่จะประเมิน

  ngOnInit() {
    this.loadData();
  }

  // โหลดรายชื่อนักศึกษาทั้งหมด
  loadData() {
    this.http
      .get<any[]>(`${environment.apiUrl}/get_plo_assessments.php?advisor_id=14&t=${Date.now()}`)
      .subscribe({
        next: (data) => {
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

  // --- ส่วนของการจัดการ Modal ประเมินผล ---

  openEvalModal(student: StudentAssessment, event: Event) {
    event.stopPropagation(); // ป้องกันการคลิกทะลุไปหน้าอื่น
    this.selectedStudent.set(student);
    this.isEvalModalOpen.set(true);
    this.isLoadingEval.set(true); // เปิดสถานะกำลังโหลด
    this.evalScores.set([]); // เคลียร์ข้อมูลเก่าออกก่อน

    // 👉 ยิง API ไปดึงโครงสร้างตัวชี้วัด และคะแนนเก่า (ถ้ามี) ของนักศึกษาคนนี้
    this.http
      .get<
        EvalScore[]
      >(`${environment.apiUrl}/get_student_eval_structure.php?student_id=${student.id}`)
      .subscribe({
        next: (data) => {
          this.evalScores.set(data);
          this.isLoadingEval.set(false); // ปิดสถานะโหลดเมื่อได้ข้อมูลแล้ว
        },
        error: (err) => {
          console.error('Failed to load evaluation structure', err);
          this.isLoadingEval.set(false);
        },
      });
  }

  closeEvalModal() {
    this.isEvalModalOpen.set(false);
    this.selectedStudent.set(null);
  }

  saveEvaluation() {
    const student = this.selectedStudent();
    if (!student) return;

    this.isSaving.set(true);
    const payload = {
      student_id: student.id,
      scores: this.evalScores().map((item) => ({ code: item.code, score: item.score })),
    };

    // ส่งคะแนนไปบันทึก
    this.http.post<any>(`${environment.apiUrl}/save_plo_assessment.php`, payload).subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.closeEvalModal();
          this.loadData(); // โหลดข้อมูลใหม่เพื่ออัปเดตหน้าหลัก
        }
        this.isSaving.set(false);
      },
      error: (err) => {
        console.error('Error saving data', err);
        this.isSaving.set(false);
      },
    });
  }

  // --- ส่วนการจัดการข้อมูลตาราง (ตัวกรอง, แบ่งหน้า) ---

  filteredStudents = computed(() => {
    const tab = this.activeTab();
    const query = this.searchQuery().toLowerCase().trim();
    let result = this.students();

    if (tab === 'รอประเมิน') result = result.filter((s) => s.status === 'pending');
    if (tab === 'ผ่าน') result = result.filter((s) => s.status === 'passed');
    if (tab === 'ไม่ผ่าน') result = result.filter((s) => s.status === 'failed');

    if (query) {
      result = result.filter(
        (s) => s.name.toLowerCase().includes(query) || s.studentId.toLowerCase().includes(query),
      );
    }

    return result;
  });

  paginatedStudents = computed(() => {
    const filtered = this.filteredStudents();
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return filtered.slice(start, start + this.itemsPerPage);
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
