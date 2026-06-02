import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
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
export class HeaderComponent implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  userName: string = 'ผู้ใช้งาน';
  userRole: string = '';
  studentCode: string = '';
  isDropdownOpen: boolean = false;
  isBellOpen: boolean = false;
  userImageUrl: string | null = null;

  upcomingAppointments: UpcomingAppointment[] = [];

  get upcomingCount(): number {
    return this.upcomingAppointments.length;
  }

  monthsTH = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];

  ngOnInit() {
    this.userName = localStorage.getItem('full_name') || 'ผู้ใช้งาน';
    this.userRole = localStorage.getItem('role')?.toLowerCase().trim() || '';
    this.studentCode = localStorage.getItem('student_code') || localStorage.getItem('username') || '6504800006';

    const savedImagePath = localStorage.getItem('img_profile');
    if (savedImagePath && savedImagePath !== 'null' && savedImagePath !== '') {
      const cleanPath = savedImagePath.startsWith('/') ? savedImagePath.substring(1) : savedImagePath;
      this.userImageUrl = `http://localhost:8080/api/${cleanPath}`;
    } else {
      this.userImageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(this.userName)}&background=fff7ed&color=ea580c`;
    }

    if (this.userRole === 'student') {
      this.loadUpcoming();
    }
  }

  loadUpcoming() {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;

    this.http
      .get<any[]>(`${environment.apiUrl}/get_student_appointments.php?user_id=${userId}`)
      .subscribe({
        next: (data) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          this.upcomingAppointments = data
            .filter(a => new Date(a.appointment_date) >= today && !a.is_consulted)
            .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())
            .slice(0, 5);
          this.cdr.detectChanges();
        },
        error: () => {}
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
