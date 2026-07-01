import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';

interface Appointment {
  appointment_id: number;
  title: string;
  description: string;
  appointment_date: string;
  academic_year: number;
  semester: number;
  start_time: string;
  end_time: string | null;
  type: string;
  status: string;
  is_consulted: number;
  note: string | null;
  advisor_name: string;
  advisor_email: string | null;
  advisor_phone: string | null;
  advisor_img: string | null;
  advisor_position: string | null;
  advisor_dept: string | null;
}

@Component({
  selector: 'app-advisor-record',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './advisor-record.html',
  styleUrl: './advisor-record.css',
})
export class AdvisorRecord implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  currentYear = new Date().getFullYear();
  activeMonth = new Date().getMonth(); // 0-11

  months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  monthsTH = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];

  allAppointments: Appointment[] = [];
  selectedAppointment: Appointment | null = null;
  isClosing = false;

  get filteredAppointments(): Appointment[] {
    return this.allAppointments.filter(a => {
      const d = new Date(a.appointment_date);
      return d.getFullYear() === this.currentYear && d.getMonth() === this.activeMonth;
    });
  }

  ngOnInit() {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;

    this.http
      .get<Appointment[]>(`${environment.apiUrl}/get_student_appointments.php?user_id=${userId}`)
      .subscribe({
        next: (data) => {
          this.allAppointments = data;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Failed to load appointments:', err),
      });
  }

  prevYear() { this.currentYear--; this.cdr.detectChanges(); }
  nextYear() { this.currentYear++; this.cdr.detectChanges(); }
  selectMonth(i: number) { this.activeMonth = i; this.cdr.detectChanges(); }

  openDetail(a: Appointment) {
    this.isClosing = false;
    this.selectedAppointment = a;
    this.cdr.detectChanges();
  }

  closeDetail() {
    this.isClosing = true;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.selectedAppointment = null;
      this.isClosing = false;
      this.cdr.detectChanges();
    }, 160);
  }

  advisorImgUrl(img: string | null): string {
    if (img) return `${environment.apiUrl}/${img}`;
    return 'https://i.pravatar.cc/150?img=12';
  }

  formatTime(t: string | null): string {
    if (!t) return '-';
    return t.substring(0, 5);
  }

  formatDate(d: string): string {
    const date = new Date(d);
    return `${date.getDate()} ${this.monthsTH[date.getMonth()]} ${date.getFullYear() + 543}`;
  }

  getCardAccent(type: string): string {
    if (type === 'วิชาการ')    return 'border-l-blue-400';
    if (type === 'ส่วนตัว')   return 'border-l-purple-400';
    if (type === 'อาชีพ/ฝึกงาน') return 'border-l-orange-400';
    if (type === 'กิจกรรม')   return 'border-l-green-400';
    return 'border-l-gray-300';
  }

  getTypeColor(type: string): string {
    if (type === 'วิชาการ') return 'type-academic';
    if (type === 'ส่วนตัว') return 'type-personal';
    if (type === 'อาชีพ/ฝึกงาน') return 'type-career';
    if (type === 'กิจกรรม') return 'type-activity';
    return 'type-default';
  }

  getStatusColor(status: string): string {
    if (status === 'ดำเนินการแล้ว') return 'status-done';
    if (status === 'นัดหมาย') return 'status-pending';
    if (status === 'ยกเลิก') return 'status-cancel';
    return 'status-default';
  }

  get consultedThisYear(): number {
    return this.allAppointments.filter(a => {
      const d = new Date(a.appointment_date);
      return d.getFullYear() === this.currentYear && a.is_consulted;
    }).length;
  }

  get totalThisYear(): number {
    return this.allAppointments.filter(a => {
      const d = new Date(a.appointment_date);
      return d.getFullYear() === this.currentYear;
    }).length;
  }

  hasDataInMonth(year: number, month: number): boolean {
    return this.allAppointments.some(a => {
      const d = new Date(a.appointment_date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  }
}
