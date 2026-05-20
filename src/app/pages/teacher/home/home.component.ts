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

  // 👉 5. เปลี่ยนมารอรับข้อมูลการนัดหมายจริงจากฐานข้อมูล (ลบข้อมูล Mock ออกแล้ว)
  appointments = signal<any[]>([]);

  // ฟังก์ชันแปลงรูปแบบวันที่ (เช่น 2026-01-20 -> 20 ม.ค. 2569)
  formatThaiDate(dateString: string): string {
    if (!dateString) return '';
    const months = [
      'ม.ค.',
      'ก.พ.',
      'มี.ค.',
      'เม.ย.',
      'พ.ค.',
      'มิ.ย.',
      'ก.ค.',
      'ส.ค.',
      'ก.ย.',
      'ต.ค.',
      'พ.ย.',
      'ธ.ค.',
    ];
    const d = new Date(dateString);
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`;
  }

  // ฟังก์ชันแปลงเวลา (ตัดวินาทีออก)
  formatTime(timeString: string): string {
    if (!timeString) return '';
    return timeString.substring(0, 5) + ' น.';
  }

  ngOnInit() {
    // --------------------------------------------------------
    // 👉 ดึงข้อมูลรายชื่อนักศึกษาในการดูแล
    // --------------------------------------------------------
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

        this.studentsInCare.set(formattedStudents);

        // อัปเดตจำนวนตัวเลขบนการ์ดสรุปผล
        this.dashboardStats[0].value = formattedStudents.length;
        const passedPLO = formattedStudents.filter((s) => s.ploStatus === 'PLO ผ่าน').length;
        this.dashboardStats[1].value = passedPLO;
      },
      error: (error) => {
        console.error('ดึงรายชื่อเด็กพังดิครับ:', error.message);
      },
    });

    // --------------------------------------------------------
    // 👉 ดึงข้อมูลการนัดหมายล่าสุดจาก Database จริง 100%
    // --------------------------------------------------------
    const appointmentsUrl = `${environment.apiUrl}/get_appointments.php?advisor_id=14&t=${new Date().getTime()}`;
    this.http.get<any[]>(appointmentsUrl).subscribe({
      next: (data) => {
        const formattedAppointments = (data || []).map((app: any) => {
          // หาข้อมูลนักศึกษาคนแรกในนัดหมายเพื่อดึงชื่อและรูปโปรไฟล์มาแสดงผลหน้า Home
          const firstStudent = app.students && app.students.length > 0 ? app.students[0] : null;

          return {
            id: firstStudent ? firstStudent.id : '-',
            // ถ้าเป็นนัดหมายแบบกลุ่ม (มีเด็กมากกว่า 1 คน) จะเติมข้อความ ' (และคณะ)' ต่อท้ายชื่อคนแรกให้โดยอัตโนมัติ
            name: firstStudent
              ? firstStudent.name + (app.students.length > 1 ? ' (และคณะ)' : '')
              : 'ไม่ระบุชื่อ',
            type: app.type,
            topic: app.title,
            note: app.note, // ผูกบันทึกข้อความผลการปรึกษา
            date: this.formatThaiDate(app.appointment_date),
            time: this.formatTime(app.start_time),
            img:
              firstStudent && firstStudent.img
                ? `${environment.apiUrl}/${firstStudent.img}`
                : `https://i.pravatar.cc/150?u=${firstStudent ? firstStudent.id : 'default'}`,
          };
        });

        this.appointments.set(formattedAppointments);

        // อัปเดตตัวเลข 'นัดหมายทั้งหมด' บนการ์ดสีเหลืองตามจริง
        this.dashboardStats[2].value = formattedAppointments.length;
      },
      error: (error) => {
        console.error('ดึงข้อมูลตารางนัดหมายพังดิครับ:', error.message);
      },
    });
  }
}
