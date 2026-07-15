import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

interface UpcomingAppointment {
  appointment_id: number;
  title: string;
  appointment_date: string;
  start_time: string;
  type: string;
  status: string;
  is_consulted: number;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  userName: string = 'ผู้ใช้งาน';
  userRole: string = '';
  studentCode: string = '';
  isAdvisor: boolean = false;
  isDropdownOpen: boolean = false;
  isBellOpen: boolean = false;
  userImageUrl: string | null = null;

  upcomingAppointments: UpcomingAppointment[] = [];
  private pollInterval: any;

  get upcomingCount(): number {
    return this.upcomingAppointments.length;
  }

  monthsTH = [
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

  ngOnInit() {
    // 🌟 1. ดักจับข้อมูลจาก URL (ที่ส่งมาจากหน้า Login 4200) มาเก็บลงตู้เซฟของ 4201
    this.captureUrlParams();

    // 🌟 2. พอดักจับเสร็จแล้ว ค่อยดึงข้อมูลมาใช้งาน ตัวแปรจะได้ไม่ว่างเปล่าแล้ว!
    this.userName = localStorage.getItem('full_name') || 'ผู้ใช้งาน';
    this.userRole = localStorage.getItem('role')?.toLowerCase().trim() || '';
    this.isAdvisor = localStorage.getItem('is_advisor') === 'true';
    this.studentCode =
      localStorage.getItem('student_code') || localStorage.getItem('username') || '';

    const savedImagePath = localStorage.getItem('img_profile');
    if (savedImagePath && savedImagePath !== 'null' && savedImagePath !== '') {
      const cleanPath = savedImagePath.startsWith('/')
        ? savedImagePath.substring(1)
        : savedImagePath;
      this.userImageUrl = `http://localhost:8080/api/${cleanPath}`;
    } else {
      this.userImageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(this.userName)}&background=fff7ed&color=ea580c`;
    }

    if (this.userRole === 'student') {
      this.loadUpcoming();
      this.pollInterval = setInterval(() => this.loadUpcoming(), 45000);
    }
  }

  // 🛠️ ฟังก์ชันดักจับ URL ที่เพิ่มเข้ามาใหม่
  captureUrlParams() {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      // ถ้าเจอคำว่า token ใน URL แสดงว่าเพิ่งย้ายมาจากหน้า Login
      if (params.has('token')) {
        localStorage.setItem('token', params.get('token') || '');
        localStorage.setItem('role', params.get('role') || '');
        localStorage.setItem('full_name', params.get('user') || '');
        localStorage.setItem('permissions', decodeURIComponent(params.get('perms') || ''));
        localStorage.setItem('student_code', params.get('student_code') || '');
        localStorage.setItem('is_advisor', params.get('is_advisor') || 'false');

        // กวาดข้อมูลเสร็จ ก็ลบรกๆ ใน URL ทิ้งไปเลย ผู้ใช้จะได้ไม่เห็น
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }

  ngOnDestroy() {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  loadUpcoming() {
    this.http.get<any[]>(`${environment.apiUrl}/get_student_appointments.php`).subscribe({
      next: (data) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        this.upcomingAppointments = data
          .filter((a) => new Date(a.appointment_date) >= today && !a.is_consulted)
          .sort(
            (a, b) =>
              new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime(),
          )
          .slice(0, 5);
        this.cdr.detectChanges();
      },
      error: () => {},
    });
  }

  formatShortDate(d: string): string {
    const date = new Date(d);
    return `${date.getDate()} ${this.monthsTH[date.getMonth()]}`;
  }

  formatTime(t: string): string {
    return t ? t.substring(0, 5) : '';
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    if (this.isDropdownOpen) this.isBellOpen = false;
  }

  toggleBell() {
    this.isBellOpen = !this.isBellOpen;
    if (this.isBellOpen) this.isDropdownOpen = false;
  }

  goToRecord() {
    this.isBellOpen = false;
    this.router.navigate(['/advisor-record']);
  }

  closeAll() {
    this.isDropdownOpen = false;
    this.isBellOpen = false;
  }

  onLogout() {
    localStorage.clear();
    window.location.href = 'http://localhost:4200/login';
  }
}
