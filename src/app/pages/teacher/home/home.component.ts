import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { StatCardsComponent } from '../../../shared/components/stat-cards/stat-cards.component';
import { environment } from '../../../../environments/environment';
import { StudentResultModalComponent } from '../student-result-modal/student-result-modal.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, StatCardsComponent, StudentResultModalComponent, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  isModalOpen = false;
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
      label: 'บันทึกการปรึกษา (คน)',
      value: 0,
      icon: 'assignment',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      cardBg: 'bg-[#FFF5FE]',
    },
  ];

  currentPage = signal(1);
  itemsPerPage = 6;
  studentsInCare = signal<any[]>([]);
  appointments = signal<any[]>([]);

  totalItems = computed(() => this.studentsInCare().length);
  totalPages = computed(() => Math.ceil(this.totalItems() / this.itemsPerPage) || 1);
  paginatedStudents = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return this.studentsInCare().slice(start, start + this.itemsPerPage);
  });
  pageNumbers = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    // 🟢 ไม่ต้องดึง advisorId จาก localStorage แล้ว เพราะ Interceptor จะส่ง Token ไปให้หลังบ้านเอง

    // 1. ดึงข้อมูลนักศึกษา
    this.http
      .get<any[]>(`${environment.apiUrl}/get_advisor_students.php?t=${Date.now()}`)
      .subscribe({
        next: (data) => {
          const formattedStudents = data.map((student: any) => ({
            id: student.student_code,
            name: student.full_name,
            year: student.year,
            gpa: student.gpa || '-',
            ploStatus: student.ploStatus,
            img: student.image
              ? `${environment.apiUrl}/${student.image}`
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(student.full_name)}&background=fff7ed&color=ea580c`,
          }));

          this.studentsInCare.set(formattedStudents);
          this.dashboardStats[0].value = formattedStudents.length;
          this.dashboardStats[1].value = formattedStudents.filter((s) =>
            s.ploStatus.includes('ผ่าน'),
          ).length;

          const validStudentIds = new Set(formattedStudents.map((s) => s.id.toString()));

          // 2. ดึงนัดหมายหลังจากได้ข้อมูลเด็กแล้ว
          this.http
            .get<any[]>(`${environment.apiUrl}/get_appointments.php?t=${Date.now()}`)
            .subscribe({
              next: (appData) => {
                const allApps = appData || [];

                // คำนวณสถิติ
                const allScheduled = new Set<string>();
                const consulted = new Set<string>();

                allApps.forEach((app) => {
                  app.students?.forEach((s: any) => {
                    if (validStudentIds.has(s.id.toString())) {
                      allScheduled.add(s.id.toString());
                      if (app.status === 'ดำเนินการแล้ว') consulted.add(s.id.toString());
                    }
                  });
                });

                this.dashboardStats[2].value = allScheduled.size;
                this.dashboardStats[3].value = consulted.size;

                // จัดการรายการนัดหมายล่าสุด
                this.appointments.set(
                  allApps
                    .filter((a) => a.status !== 'ดำเนินการแล้ว')
                    .map((app) => {
                      // 🟢 ดึงข้อมูลเด็กคนแรกออกมาเพื่อทำรูปโปรไฟล์
                      const mainStudent = app.students?.[0];
                      const studentName = mainStudent?.name || 'ไม่ระบุชื่อ';
                      // 🟢 เช็คว่ามีรูปไหม ถ้าไม่มีให้ใช้รูปตัวอักษรสีส้มแทน
                      const imgUrl = mainStudent?.img
                        ? `${environment.apiUrl}/${mainStudent.img}`
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}&background=fff7ed&color=ea580c`;

                      return {
                        id: app.appointment_id,
                        studentCode: mainStudent?.id || '-',
                        name: studentName + (app.students.length > 1 ? ' (และเพื่อน)' : ''),
                        topic: app.title,
                        type: app.type,
                        date: this.formatDate(app.appointment_date),
                        time: app.start_time?.substring(0, 5) + ' น.',
                        isGroup: app.students.length > 1,
                        img: imgUrl, // 🟢 เพิ่มตัวแปรนี้เข้าไป รูปก็จะมาแล้ว!
                      };
                    }),
                );
              }
            });
        },
      });
  }

  formatDate(d: string) {
    const m = [
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
    const date = new Date(d);
    return `${date.getDate()} ${m[date.getMonth()]} ${date.getFullYear() + 543}`;
  }

  goToPage(p: number) {
    this.currentPage.set(p);
  }
  nextPage() {
    if (this.currentPage() < this.totalPages()) this.currentPage.update((p) => p + 1);
  }
  prevPage() {
    if (this.currentPage() > 1) this.currentPage.update((p) => p - 1);
  }

  openStudentResult(student: any) {
    this.router.navigate(['/student-result', student.id], { state: { student } });
  }

  goToAppointment(app: any) {
    this.router.navigate([app.isGroup ? '/group' : '/individual'], { queryParams: { id: app.id } });
  }
}
