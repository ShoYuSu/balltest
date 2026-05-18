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

  // --- 1. ตัวแปรสำหรับ Pagination ---
  currentPage = signal(1);
  itemsPerPage = 5;

  // --- 2. รอรับข้อมูลนักศึกษาจากฐานข้อมูล ---
  studentsInCare = signal<any[]>([]);

  // --- 3. ฟังก์ชันคำนวณหน้า ---
  totalItems = computed(() => this.studentsInCare().length);
  totalPages = computed(() => Math.ceil(this.totalItems() / this.itemsPerPage));

  paginatedStudents = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return this.studentsInCare().slice(start, start + this.itemsPerPage);
  });

  pageNumbers = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  // --- 4. ฟังก์ชันเปลี่ยนหน้า ---
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

  ngOnInit() {
    // ยิง API ไปดึงข้อมูล
    this.http.get<any[]>(`${environment.apiUrl}/get_advisor_students.php?advisor_id=14`).subscribe({
      next: (data) => {
        const formattedStudents = data.map((student: any) => ({
          id: student.student_code,
          name: student.full_name,
          year: student.year,
          gpa: student.gpa,
          ploStatus: student.ploStatus,
          img: student.image
            ? `${environment.apiUrl}/${student.image}`
            : `https://i.pravatar.cc/150?u=${student.student_code}`,
        }));

        // อัปเดตตารางรายชื่อนักศึกษา
        this.studentsInCare.set(formattedStudents);

        // 👉 เพิ่มโค้ดส่วนนี้เพื่ออัปเดตตัวเลขบน Card ด้านบน 👈

        // 1. อัปเดตจำนวน 'นักศึกษาที่ดูแลทั้งหมด' (นับจากจำนวนข้อมูลที่ได้มา)
        this.dashboardStats[0].value = formattedStudents.length;

        // 2. อัปเดตจำนวน 'ผ่าน PLO ทั้งหมด' (นับเฉพาะคนที่สถานะเป็น 'PLO ผ่าน')
        const passedPLO = formattedStudents.filter((s) => s.ploStatus === 'PLO ผ่าน').length;
        this.dashboardStats[1].value = passedPLO;

        // 3. อัปเดตจำนวน 'นัดหมายทั้งหมด' (ดึงจากตัวแปร appointments ที่เรามีอยู่)
        this.dashboardStats[2].value = this.appointments().length;
      },
      error: (error) => {
        console.error('พังดิครับ:', error.message);
      },
    });
  }
}
