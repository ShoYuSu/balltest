import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

interface PloScore {
  label: string;
  score: number;
}

interface StudentAssessment {
  id: string;
  name: string;
  studentId: string;
  status: 'pending' | 'passed' | 'failed';
  statusText: string;
  img: string;
  plos?: PloScore[];
  average?: number | null;
}

@Component({
  selector: 'app-plo-assessment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './plo-assessment.component.html',
  styleUrl: './plo-assessment.component.css',
})
export class PloAssessmentComponent {
  // สถานะแท็บปัจจุบัน (ทั้งหมด, รอประเมิน, ผ่าน, ไม่ผ่าน)
  activeTab = signal<'ทั้งหมด' | 'รอประเมิน' | 'ผ่าน' | 'ไม่ผ่าน'>('ทั้งหมด');

  // ตัวแปรสำหรับการแบ่งหน้า (Pagination)
  currentPage = signal(1);
  itemsPerPage = 5;

  // Mock Data: สร้างข้อมูลนักศึกษา 15 คน
  students = signal<StudentAssessment[]>([
    {
      id: '1',
      name: 'นายสมศักดิ์ ทดสอบ',
      studentId: '6801234501',
      status: 'pending',
      statusText: 'รอประเมิน',
      img: 'https://i.pravatar.cc/150?u=1',
      average: null,
    },
    {
      id: '2',
      name: 'นางสาวสมหญิง ทดลอง',
      studentId: '6801234502',
      status: 'passed',
      statusText: 'ผ่าน',
      img: 'https://i.pravatar.cc/150?u=2',
      plos: this.generatePlos(80, 100),
      average: 88,
    },
    {
      id: '3',
      name: 'นายวิชัย สมบูรณ์',
      studentId: '6801234503',
      status: 'failed',
      statusText: 'ไม่ผ่าน',
      img: 'https://i.pravatar.cc/150?u=3',
      plos: this.generatePlos(10, 49),
      average: 33,
    },
    {
      id: '4',
      name: 'นางสาวพิมพ์ชนก ดีงาม',
      studentId: '6801234504',
      status: 'passed',
      statusText: 'ผ่าน',
      img: 'https://i.pravatar.cc/150?u=4',
      plos: this.generatePlos(70, 90),
      average: 75,
    },
    {
      id: '5',
      name: 'นายธนากร รุ่งเรือง',
      studentId: '6801234505',
      status: 'pending',
      statusText: 'รอประเมิน',
      img: 'https://i.pravatar.cc/150?u=5',
      average: null,
    },
    {
      id: '6',
      name: 'นางสาวแพรว รัตนโชติ',
      studentId: '6801234506',
      status: 'passed',
      statusText: 'ผ่าน',
      img: 'https://i.pravatar.cc/150?u=6',
      plos: this.generatePlos(60, 85),
      average: 72,
    },
    {
      id: '7',
      name: 'นายอัครพล สุวรรณ',
      studentId: '6801234507',
      status: 'failed',
      statusText: 'ไม่ผ่าน',
      img: 'https://i.pravatar.cc/150?u=7',
      plos: this.generatePlos(20, 50),
      average: 45,
    },
    {
      id: '8',
      name: 'นางสาวชลดา พิพัฒน์',
      studentId: '6801234508',
      status: 'pending',
      statusText: 'รอประเมิน',
      img: 'https://i.pravatar.cc/150?u=8',
      average: null,
    },
    {
      id: '9',
      name: 'นายปิยบุตร เลิศ',
      studentId: '6801234509',
      status: 'passed',
      statusText: 'ผ่าน',
      img: 'https://i.pravatar.cc/150?u=9',
      plos: this.generatePlos(90, 100),
      average: 95,
    },
    {
      id: '10',
      name: 'นายจิรภัทร วาวิวัา',
      studentId: '6801234510',
      status: 'passed',
      statusText: 'ผ่าน',
      img: 'https://i.pravatar.cc/150?u=10',
      plos: this.generatePlos(50, 70),
      average: 60,
    },
    {
      id: '11',
      name: 'นางสาววรินดา เตชะ',
      studentId: '6801234511',
      status: 'failed',
      statusText: 'ไม่ผ่าน',
      img: 'https://i.pravatar.cc/150?u=11',
      plos: this.generatePlos(30, 45),
      average: 38,
    },
    {
      id: '12',
      name: 'นายธนกฤต ศิริ',
      studentId: '6801234512',
      status: 'pending',
      statusText: 'รอประเมิน',
      img: 'https://i.pravatar.cc/150?u=12',
      average: null,
    },
    {
      id: '13',
      name: 'นางสาวกมลวรรณ ใจดี',
      studentId: '6801234513',
      status: 'passed',
      statusText: 'ผ่าน',
      img: 'https://i.pravatar.cc/150?u=13',
      plos: this.generatePlos(75, 95),
      average: 82,
    },
    {
      id: '14',
      name: 'นายสมปอง น้องสมชาย',
      studentId: '6801234514',
      status: 'failed',
      statusText: 'ไม่ผ่าน',
      img: 'https://i.pravatar.cc/150?u=14',
      plos: this.generatePlos(10, 30),
      average: 22,
    },
    {
      id: '15',
      name: 'นางสาวสุดสวย รักเรียน',
      studentId: '6801234515',
      status: 'passed',
      statusText: 'ผ่าน',
      img: 'https://i.pravatar.cc/150?u=15',
      plos: this.generatePlos(60, 80),
      average: 70,
    },
  ]);

  // --- นับจำนวนแต่ละสถานะแบบอัตโนมัติ เพื่อไปแสดงที่แท็บ ---
  countAll = computed(() => this.students().length);
  countPending = computed(() => this.students().filter((s) => s.status === 'pending').length);
  countPassed = computed(() => this.students().filter((s) => s.status === 'passed').length);
  countFailed = computed(() => this.students().filter((s) => s.status === 'failed').length);

  // --- ระบบ Filter: กรองข้อมูลตามแท็บที่เลือก ---
  filteredStudents = computed(() => {
    const tab = this.activeTab();
    const all = this.students();
    if (tab === 'รอประเมิน') return all.filter((s) => s.status === 'pending');
    if (tab === 'ผ่าน') return all.filter((s) => s.status === 'passed');
    if (tab === 'ไม่ผ่าน') return all.filter((s) => s.status === 'failed');
    return all;
  });

  // --- ระบบ Pagination: ตัดเอาเฉพาะข้อมูลหน้าปัจจุบัน ---
  paginatedStudents = computed(() => {
    const filtered = this.filteredStudents();
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return filtered.slice(start, start + this.itemsPerPage);
  });

  // คำนวณจำนวนหน้าทั้งหมด
  totalPages = computed(() => Math.ceil(this.filteredStudents().length / this.itemsPerPage));

  // สร้าง Array ของเลขหน้า [1, 2, 3, ...]
  pageNumbers = computed(() => {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  });

  // --- ฟังก์ชันการทำงาน ---

  // เปลี่ยนแท็บ (เมื่อเปลี่ยนแท็บให้รีเซ็ตกลับไปหน้า 1)
  setTab(tab: 'ทั้งหมด' | 'รอประเมิน' | 'ผ่าน' | 'ไม่ผ่าน') {
    this.activeTab.set(tab);
    this.currentPage.set(1);
  }

  // เปลี่ยนหน้า
  goToPage(page: number) {
    this.currentPage.set(page);
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((p) => p + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update((p) => p - 1);
    }
  }

  // --- ฟังก์ชันช่วยเหลือ (Helper Functions) ---

  // สุ่มคะแนน PLO แบบง่ายๆ เอาไว้ทำ Mock Data
  private generatePlos(min: number, max: number): PloScore[] {
    return [
      { label: 'PLO1: ความรู้', score: Math.floor(Math.random() * (max - min + 1)) + min },
      { label: 'PLO2: ทักษะ', score: Math.floor(Math.random() * (max - min + 1)) + min },
      { label: 'PLO3: จริยธรรม', score: Math.floor(Math.random() * (max - min + 1)) + min },
      { label: 'PLO4: สื่อสาร', score: Math.floor(Math.random() * (max - min + 1)) + min },
      { label: 'PLO5: วิเคราะห์', score: Math.floor(Math.random() * (max - min + 1)) + min },
    ];
  }

  getProgressBarColor(score: number): string {
    return score >= 50 ? 'bg-[#10B981]' : 'bg-[#EF4444]';
  }

  getProgressTextColor(score: number): string {
    return score >= 50 ? 'text-[#10B981]' : 'text-[#EF4444]';
  }
}
