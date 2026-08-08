import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { FontSizeService, FontSize } from '../../../shared/components/font-size.service';

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
  fontSizeService = inject(FontSizeService);

  userName: string = 'ผู้ใช้งาน';
  userRole: string = '';
  studentCode: string = '';
  isAdvisor: boolean = false;
  isDropdownOpen: boolean = false;
  isBellOpen: boolean = false;
  isProfileSettingsOpen: boolean = false;
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
    this.captureUrlParams();

    const token = localStorage.getItem('token');

    if (token) {
      const payload = this.decodeToken(token);

      if (payload) {
        this.userRole = payload.role?.toLowerCase().trim() || '';
        this.isAdvisor = payload.is_advisor === true;
        this.studentCode = payload.student_code || '';
        this.userName = payload.full_name || 'ผู้ใช้งาน';

        // 🌟 แก้ไข: ดึง URL รูปภาพจาก Token แทน Local Storage
        const imgProfile = payload.img_profile || '';
        if (imgProfile && imgProfile !== 'null') {
          // ดักกรณีรูปเป็นลิงก์ http อยู่แล้ว
          if (imgProfile.startsWith('http')) {
            this.userImageUrl = imgProfile;
          } else {
            // ดักกรณีเป็น path ธรรมดา
            const cleanPath = imgProfile.startsWith('/') ? imgProfile.substring(1) : imgProfile;
            this.userImageUrl = `http://localhost:8080/api/${cleanPath}`;
          }
        } else {
          // ถ้าไม่มีรูป ให้ใช้รูปตัวอักษรจาก ui-avatars ตามเดิม
          this.userImageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(this.userName)}&background=fff7ed&color=ea580c`;
        }
      }
    } else {
      // กรณีไม่มี Token กันพัง
      this.userImageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(this.userName)}&background=fff7ed&color=ea580c`;
    }

    if (this.userRole === 'student') {
      this.loadUpcoming();
      this.pollInterval = setInterval(() => this.loadUpcoming(), 45000);
    }
  }

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
        localStorage.setItem('token', params.get('token') || '');
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

 goToProfileSettings() {
    this.isDropdownOpen = false;
    // ใช้ Router นำทางไปยัง Path ที่ตั้งไว้ใน app.routes.ts
    this.router.navigate(['/profile-settings']); 
  }

  closeProfileSettings() {
    this.isProfileSettingsOpen = false;
  }

  closeAll() {
    this.isDropdownOpen = false;
    this.isBellOpen = false;
  }

  onLogout() {
    // 1. ดึงรหัสผ่านที่จำไว้ออกมาพักไว้
    const savedEmail = localStorage.getItem('savedEmail');
    const savedPassword = localStorage.getItem('savedPassword');

    // 2. ล้างบางทุกอย่างทิ้ง (Token หาย 100%)
    localStorage.clear();
    sessionStorage.clear(); // กันเหนียวเผื่อมีขยะค้าง

    // 3. ยัดรหัสผ่านกลับเข้าไปใหม่
    if (savedEmail && savedPassword) {
      localStorage.setItem('savedEmail', savedEmail);
      localStorage.setItem('savedPassword', savedPassword);
    }

    // 4. ใช้ Angular Router พาไปหน้า Login แล้ว "บังคับรีเฟรชล้าง Memory" 1 รอบ!
    this.router.navigate(['/login']).then(() => {
      window.location.reload();
    });
  }
}