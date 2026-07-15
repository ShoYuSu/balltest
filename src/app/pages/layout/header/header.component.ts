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
    // ดักจับ Token จาก URL
    this.captureUrlParams();

    // 🌟 1. ดึง Token ออกมาแกะกล่อง!
    const token = localStorage.getItem('token');

    if (token) {
      const payload = this.decodeToken(token);

      if (payload) {
        // 🌟 2. ดึงข้อมูลทุกอย่างจาก Token อย่างเดียวเลย
        this.userRole = payload.role?.toLowerCase().trim() || '';
        this.isAdvisor = payload.is_advisor === true;
        this.studentCode = payload.student_code || '';
        this.userName = payload.full_name || 'ผู้ใช้งาน';
      }
    }

    // ดึงรูปโปรไฟล์มาแสดง
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

  // 🛡️ ฟังก์ชันสำหรับแกะกล่อง Token หน้าบ้าน
  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Token ไม่ถูกต้อง หรือถูกปลอมแปลง:', error);
      return null;
    }
  }

  captureUrlParams() {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);

      if (params.has('token')) {
        // 🌟 รับมาแค่ Token อย่างเดียว โค้ดขยะบรรทัดอื่นลบทิ้งหมดแล้ว!
        localStorage.setItem('token', params.get('token') || '');

        // ลบ URL ทิ้งเพื่อความสวยงาม
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
