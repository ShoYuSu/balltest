import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DecimalPipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

interface StudentProfile {
  student_id: number;
  student_code: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  img_profile: string | null;
  faculty: string;
  major: string;
  year: number;
  advisor_name: string;
  activity_count: number;
  certificate_count: number;
  gpa: number;
  credits_earned: number;
  credits_total: number;
  plo_passed: number;
  plo_total: number;
}

@Component({
  selector: 'app-personal-data',
  standalone: true,
  imports: [DecimalPipe, FormsModule, CommonModule],
  templateUrl: './personal-data.component.html',
  styleUrl: './personal-data.component.css',
})
export class PersonalDataComponent implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  student: StudentProfile = {
    student_id: 0,
    student_code: '-',
    full_name: localStorage.getItem('full_name') || '-',
    email: null,
    phone: null,
    img_profile: localStorage.getItem('img_profile'),
    faculty: '-',
    major: '-',
    year: 0,
    advisor_name: '-',
    activity_count: 0,
    certificate_count: 0,
    gpa: 0,
    credits_earned: 0,
    credits_total: 0,
    plo_passed: 0,
    plo_total: 0,
  };

  showModal = false;
  saving = false;
  editForm = { full_name: '', email: '', phone: '' };

  upcomingAppointments: any[] = [];
  monthsTH = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];

  get profileImageUrl(): string {
    if (this.student.img_profile) {
      return `${environment.apiUrl}/${this.student.img_profile}`;
    }
    return 'https://i.pravatar.cc/150?img=5';
  }

  ngOnInit() {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;

    this.http
      .get<StudentProfile>(`${environment.apiUrl}/get_student_profile.php?user_id=${userId}`)
      .subscribe({
        next: (data) => {
          this.student = data;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Failed to load profile:', err),
      });

    this.http
      .get<any[]>(`${environment.apiUrl}/get_student_appointments.php?user_id=${userId}`)
      .subscribe({
        next: (data) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          this.upcomingAppointments = data
            .filter(a => new Date(a.appointment_date) >= today && !a.is_consulted)
            .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())
            .slice(0, 3);
          this.cdr.detectChanges();
        },
        error: () => {}
      });
  }

  goToRecord() { this.router.navigate(['/advisor-record']); }

  formatApptDate(d: string): string {
    const date = new Date(d);
    return `${date.getDate()} ${this.monthsTH[date.getMonth()]} ${date.getFullYear() + 543}`;
  }

  formatApptTime(t: string): string {
    return t ? t.substring(0, 5) : '';
  }

  getTypeColor(type: string): string {
    if (type === 'วิชาการ') return 'bg-blue-50 text-blue-600';
    if (type === 'ส่วนตัว') return 'bg-purple-50 text-purple-600';
    if (type === 'อาชีพ/ฝึกงาน') return 'bg-orange-50 text-orange-600';
    if (type === 'กิจกรรม') return 'bg-green-50 text-green-600';
    return 'bg-gray-50 text-gray-500';
  }

  formatThaiMonth(dateStr: string): string {
    if (!dateStr) return '';
    const months = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
    return months[new Date(dateStr).getMonth()] ?? '';
  }

  openModal() {
    this.editForm = {
      full_name: this.student.full_name || '',
      email: this.student.email || '',
      phone: this.student.phone || '',
    };
    this.showModal = true;
    this.cdr.detectChanges();
  }

  closeModal() {
    this.showModal = false;
    this.cdr.detectChanges();
  }

  saveProfile() {
    const userId = localStorage.getItem('user_id');
    if (!userId || this.saving) return;

    this.saving = true;
    this.cdr.detectChanges();

    this.http
      .post<{ success: boolean; message?: string }>(
        `${environment.apiUrl}/update_student_profile.php`,
        {
          user_id: parseInt(userId),
          full_name: this.editForm.full_name,
          email: this.editForm.email,
          phone: this.editForm.phone || null,
        }
      )
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.student = {
              ...this.student,
              full_name: this.editForm.full_name,
              email: this.editForm.email,
              phone: this.editForm.phone || null,
            };
            localStorage.setItem('full_name', this.editForm.full_name);
            this.showModal = false;
          }
          this.saving = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to save profile:', err);
          this.saving = false;
          this.cdr.detectChanges();
        },
      });
  }
}
