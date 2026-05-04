import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { StatCardsComponent } from '../../../shared/components/stat-cards/stat-cards.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, StatCardsComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  private http = inject(HttpClient); // Inject HTTP สำหรับยิง XAMPP

  dashboardStats = [
    {
      label: 'นักศึกษาที่ดูแลทั้งหมด',
      value: 0,
      icon: 'group',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      cardBg: 'bg-[#F3FBFF]',
    },
    {
      label: 'ผ่าน PLO ทั้งหมด',
      value: 0,
      icon: 'school',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      cardBg: 'bg-[#F5FFFA]',
    },
    {
      label: 'นัดหมายทั้งหมด',
      value: 0,
      icon: 'person',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600',
      cardBg: 'bg-[#FFFDF0]',
    },
    {
      label: 'บันทึกการบึกษา',
      value: 0,
      icon: 'assignment',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      cardBg: 'bg-[#FFF5FE]',
    },
  ];

  // --- 1. ตัวแปรสำหรับ Pagination (เก็บของ dev-ball ไว้) ---
  currentPage = signal(1);
  itemsPerPage = 5;

  // --- 2. ข้อมูล Mock นักศึกษา (เก็บของ dev-ball ไว้) ---
  studentsInCare = signal([
    {
      id: '6501230567',
      name: 'นายสมศักดิ์ ทดสอบ',
      year: 1,
      gpa: 3.45,
      ploStatus: 'PLO รอประเมิน',
      img: 'https://i.pravatar.cc/150?u=1',
    },
    {
      id: '6501230568',
      name: 'นางสาวหญิง ทดลอง',
      year: 1,
      gpa: 3.78,
      ploStatus: 'PLO ผ่าน',
      img: 'https://i.pravatar.cc/150?u=2',
    },
    {
      id: '6501230569',
      name: 'นายวิชัย สมบูรณ์',
      year: 1,
      gpa: 3.21,
      ploStatus: 'PLO ไม่ผ่าน',
      img: 'https://i.pravatar.cc/150?u=3',
    },
    {
      id: '6501230570',
      name: 'นางสาวพิมพ์ชนก ดีงาม',
      year: 1,
      gpa: 3.92,
      ploStatus: 'PLO ผ่าน',
      img: 'https://i.pravatar.cc/150?u=4',
    },
    {
      id: '6501230571',
      name: 'นายธนากร รุ่งเรือง',
      year: 1,
      gpa: 3.56,
      ploStatus: 'PLO ผ่าน',
      img: 'https://i.pravatar.cc/150?u=5',
    },
    {
      id: '6501230572',
      name: 'นางสาวแพรว รัตนโชติ',
      year: 2,
      gpa: 3.8,
      ploStatus: 'PLO รอประเมิน',
      img: 'https://i.pravatar.cc/150?u=6',
    },
    {
      id: '6501230573',
      name: 'นายอัครพล สุวรรณ',
      year: 1,
      gpa: 3.1,
      ploStatus: 'PLO ผ่าน',
      img: 'https://i.pravatar.cc/150?u=7',
    },
    {
      id: '6501230574',
      name: 'นางสาวชลดา พิพัฒน์',
      year: 3,
      gpa: 3.4,
      ploStatus: 'PLO ไม่ผ่าน',
      img: 'https://i.pravatar.cc/150?u=8',
    },
    {
      id: '6501230575',
      name: 'นายปิยบุตร เลิศ',
      year: 1,
      gpa: 3.95,
      ploStatus: 'PLO ผ่าน',
      img: 'https://i.pravatar.cc/150?u=9',
    },
    {
      id: '6501230576',
      name: 'นางสาววรินดา เตชะ',
      year: 2,
      gpa: 3.65,
      ploStatus: 'PLO ผ่าน',
      img: 'https://i.pravatar.cc/150?u=10',
    },
    {
      id: '6501230577',
      name: 'นายก้องเกียรติ ยินดี',
      year: 1,
      gpa: 2.8,
      ploStatus: 'PLO รอประเมิน',
      img: 'https://i.pravatar.cc/150?u=11',
    },
    {
      id: '6501230578',
      name: 'นางสาวใจดี รักเรียน',
      year: 4,
      gpa: 4.0,
      ploStatus: 'PLO ผ่าน',
      img: 'https://i.pravatar.cc/150?u=12',
    },
  ]);

  // --- 3. ฟังก์ชันคำนวณหน้า (เก็บของ dev-ball ไว้) ---
  totalItems = computed(() => this.studentsInCare().length);
  totalPages = computed(() => Math.ceil(this.totalItems() / this.itemsPerPage));

  paginatedStudents = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return this.studentsInCare().slice(start, start + this.itemsPerPage);
  });

  pageNumbers = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  // --- 4. ฟังก์ชันเปลี่ยนหน้า (เก็บของ dev-ball ไว้) ---
  goToPage(page: number) {
    this.currentPage.set(page);
  }
  nextPage() {
    if (this.currentPage() < this.totalPages()) this.currentPage.update((p) => p + 1);
  }
  prevPage() {
    if (this.currentPage() > 1) this.currentPage.update((p) => p - 1);
  }

  // --------------------------------------------------------
  appointments = signal([
    {
      name: 'นางสาวจุวาวิน วาวิวา',
      id: '6501234567',
      type: 'อาชีพ/ฝึกงาน',
      topic: 'ปรึกษาเรื่องการเตรียมตัวฝึกงาน',
      date: '18 ม.ค. 2569',
      time: '14:00 น.',
      img: 'https://i.pravatar.cc/150?u=8',
    },
    {
      name: 'นายสมศักดิ์ ทดสอบ',
      id: '6501234567',
      type: 'วิชาการ',
      topic: 'ปรึกษาเรื่องลงทะเบียนเรียนเทอมหน้า',
      note: 'แนะนำให้ลงวิชา Advanced ........',
      date: '5 ม.ค. 2569',
      time: '10:00 น.',
      img: 'https://i.pravatar.cc/150?u=1',
    },
    {
      name: 'วิชัย เก่งมาก',
      id: '6501234567',
      type: 'วิชาการ',
      topic: 'ปรึกษาเรื่องปัญหาส่วนตัวที่กระทบการเรียน',
      note: 'แนะนำให้ลงวิชา Advanced Programming และ......',
      date: '5 ม.ค. 2569',
      time: '10:00 น.',
      img: 'https://i.pravatar.cc/150?u=3',
    },
  ]);

  students = signal<any[]>([]);

  ngOnInit() {
    // ยิง API ไปที่ XAMPP แทน Supabase (เตะ Supabase ของเพื่อนทิ้งไปแล้วใช้ท่านี้)
    this.http.get(`${environment.apiUrl}/get_students.php`).subscribe({
      next: (data: any) => {
        // อัปเดตข้อมูลลงใน Signal
        this.students.set(data);
      },
      error: (error) => {
        console.error('พังดิครับ:', error.message);
      },
    });
  }
}
