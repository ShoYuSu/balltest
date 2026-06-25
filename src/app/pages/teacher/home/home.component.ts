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
  totalPages = computed(() => Math.ceil(this.totalItems() / this.itemsPerPage));
  paginatedStudents = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return this.studentsInCare().slice(start, start + this.itemsPerPage);
  });
  pageNumbers = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  openStudentResult(student: any) {
    this.router.navigate(['/student-result', student.id], {
      state: { student },
    });
  }

  ngOnInit() {
    // 1. ดึงข้อมูลนักศึกษาและสถานะ PLO ก่อน
    const advisorId = localStorage.getItem('advisor_id');
    if (!advisorId) return;
    this.http
      .get<
        any[]
      >(`${environment.apiUrl}/get_advisor_students.php?advisor_id=${advisorId}&t=${Date.now()}`)
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
          this.dashboardStats[1].value = formattedStudents.filter(
            (s) => s.ploStatus === 'ผ่าน' || s.ploStatus === 'PLO ผ่าน',
          ).length;

          // 🌟 สร้าง List รหัสนักศึกษา "เฉพาะเด็กในการดูแล 16 คนนี้" เอาไว้กรอง
          const validStudentIds = new Set(formattedStudents.map((s) => s.id.toString()));

          // 2. ดึงข้อมูลนัดหมายมาคำนวณ (ทำต่อเมื่อมีข้อมูลเด็ก 16 คนแล้ว)
          this.http
            .get<
              any[]
            >(`${environment.apiUrl}/get_appointments.php?advisor_id=${advisorId}&t=${Date.now()}`)
            .subscribe({
              next: (appData) => {
                const allApps = appData || [];

                // 🎯 นัดหมายทั้งหมด (นับเฉพาะนักศึกษาที่ไม่ซ้ำคน และต้องเป็นเด็กของเรา)
                const allScheduledStudents = new Set<string>();
                allApps.forEach((app: any) => {
                  if (app.students && Array.isArray(app.students)) {
                    app.students.forEach((student: any) => {
                      // 👉 เช็คว่ารหัสเด็กคนนี้ อยู่ในแก๊ง 16 คนของเราไหม?
                      if (student.id && validStudentIds.has(student.id.toString())) {
                        allScheduledStudents.add(student.id.toString());
                      }
                    });
                  }
                });
                this.dashboardStats[2].value = allScheduledStudents.size;

                // 🎯 บันทึกการปรึกษา (นับเฉพาะคิวที่ทำเสร็จแล้ว และต้องเป็นเด็กของเรา)
                const completedApps = allApps.filter((app: any) => app.status === 'ดำเนินการแล้ว');
                const consultedStudents = new Set<string>();

                completedApps.forEach((app: any) => {
                  if (app.students && Array.isArray(app.students)) {
                    app.students.forEach((student: any) => {
                      if (student.id && validStudentIds.has(student.id.toString())) {
                        consultedStudents.add(student.id.toString());
                      }
                    });
                  }
                });
                this.dashboardStats[3].value = consultedStudents.size;

                // 🎯 จัดการข้อมูลสำหรับโชว์ใน "การนัดหมายล่าสุด"
                const formatted = allApps
                  .filter((app: any) => app.status !== 'ดำเนินการแล้ว')
                  .map((app: any) => {
                    const first = app.students?.[0];
                    return {
                      id: app.appointment_id,
                      studentCode: first?.id || '-',
                      name: first
                        ? first.name + (app.students.length > 1 ? ' (และเพื่อน)' : '')
                        : 'ไม่ระบุ',
                      topic: app.title,
                      type: app.type,
                      note: app.note,
                      date: this.formatDate(app.appointment_date),
                      time: app.start_time?.substring(0, 5) + ' น.',
                      img: first?.img
                        ? `${environment.apiUrl}/${first.img}`
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(first?.name || '')}&background=fed7aa&color=c2410c`,
                      isGroup: app.students.length > 1,
                      memberCount: app.students.length,
                    };
                  });

                this.appointments.set(formatted);
              },
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

  goToAppointment(app: any) {
    const targetPath = app.isGroup ? '/group' : '/individual';
    this.router.navigate([targetPath], { queryParams: { id: app.id } });
  }
}
