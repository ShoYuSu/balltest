import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-individual-consultation-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './individual-consultation-appointments.html',
  styleUrl: './individual-consultation-appointments.css',
})
export class IndividualConsultationAppointments implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute); // รับ ID จากหน้า Home

  appointments = signal<any[]>([]);

  isCreateModalOpen = signal(false);
  isEditModalOpen = signal(false);
  isLogModalOpen = signal(false);
  isConfirmCancelModalOpen = signal(false);

  selectedAppointment = signal<any>(null);
  appointmentToCancelId = signal<string | null>(null);

  activeDropdownId = signal<string | null>(null);

  isFilterDropdownOpen = signal(false);
  selectedFilter = signal('สถานะทั้งหมด');
  filterOptions = ['สถานะทั้งหมด', 'วิชาการ', 'อาชีพ/ฝึกงาน', 'ส่วนตัว'];

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments() {
    this.http.get<any[]>(`${environment.apiUrl}/get_appointments.php?advisor_id=14`).subscribe({
      next: (data) => {
        const individualApps = data.filter((app: any) => app.students && app.students.length === 1);

        const formattedApps = individualApps.map((app: any) => ({
          id: app.appointment_id.toString(), // ใช้ appointment_id เป็นหลัก
          topic: app.title,
          type: app.type,
          status: app.status,
          date: this.formatThaiDate(app.appointment_date),
          time: this.formatTime(app.start_time),
          details: app.description,
          studentName: app.students[0].name,
          studentId: app.students[0].id,
          img: app.students[0].img
            ? `${environment.apiUrl}/${app.students[0].img}`
            : `https://i.pravatar.cc/150?u=${app.students[0].id}`,
        }));

        this.appointments.set(formattedApps);

        // 👉 ระบบเลื่อนหน้าจออัตโนมัติมาหาการ์ดที่ถูกคลิก
        this.route.queryParams.subscribe((params) => {
          const targetId = params['id'];
          if (targetId) {
            setTimeout(() => {
              const element = document.getElementById('appointment-' + targetId);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.classList.add(
                  'ring-2',
                  'ring-orange-500',
                  'transition-all',
                  'duration-500',
                );
                setTimeout(() => element.classList.remove('ring-2', 'ring-orange-500'), 3000);
              }
            }, 300);
          }
        });
      },
      error: (err) => {
        console.error('ดึงข้อมูลนัดหมายรายบุคคลล้มเหลว:', err);
      },
    });
  }

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

  formatTime(timeString: string): string {
    if (!timeString) return '';
    return timeString.substring(0, 5) + ' น.';
  }

  toggleFilterDropdown(event: Event) {
    event.stopPropagation();
    this.isFilterDropdownOpen.update((v) => !v);
    this.activeDropdownId.set(null);
  }

  selectFilter(option: string, event: Event) {
    event.stopPropagation();
    this.selectedFilter.set(option);
    this.isFilterDropdownOpen.set(false);
  }

  toggleDropdown(id: string, event: Event) {
    event.stopPropagation();
    this.isFilterDropdownOpen.set(false);
    if (this.activeDropdownId() === id) {
      this.activeDropdownId.set(null);
    } else {
      this.activeDropdownId.set(id);
    }
  }

  openLogModal(app: any) {
    this.selectedAppointment.set(app);
    this.isLogModalOpen.set(true);
    this.activeDropdownId.set(null);
  }

  openEditModal(app: any, event: Event) {
    event.stopPropagation();
    this.selectedAppointment.set(app);
    this.isEditModalOpen.set(true);
    this.activeDropdownId.set(null);
  }

  promptCancelAppointment(id: string, event: Event) {
    event.stopPropagation();
    this.activeDropdownId.set(null);
    this.appointmentToCancelId.set(id);
    this.isConfirmCancelModalOpen.set(true);
  }

  confirmCancel() {
    const id = this.appointmentToCancelId();
    if (id) {
      this.appointments.update((apps) => apps.filter((app) => app.id !== id));
    }
    this.isConfirmCancelModalOpen.set(false);
    this.appointmentToCancelId.set(null);
  }

  closeModals() {
    this.isCreateModalOpen.set(false);
    this.isEditModalOpen.set(false);
    this.isLogModalOpen.set(false);
    this.isConfirmCancelModalOpen.set(false);
  }

  exportToExcel() {
    const data = this.appointments();
    if (data.length === 0) {
      alert('ไม่มีข้อมูลสำหรับ Export');
      return;
    }

    const headers = ['ชื่อนักศึกษา', 'รหัสนักศึกษา', 'ประเภท', 'สถานะ', 'หัวข้อ', 'วันที่', 'เวลา'];
    const csvRows = data.map((app) =>
      [
        `"${app.studentName}"`,
        `"${app.studentId}"`,
        `"${app.type}"`,
        `"${app.status}"`,
        `"${app.topic}"`,
        `"${app.date}"`,
        `"${app.time}"`,
      ].join(','),
    );

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'ข้อมูลนัดหมายรายบุคคล.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
