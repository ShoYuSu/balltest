import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-group-consultation-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './group-consultation-appointments.html',
  styleUrl: './group-consultation-appointments.css',
})
export class GroupConsultationAppointments implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute); // รับค่า ID จาก URL

  appointments = signal<any[]>([]);
  myStudents = signal<any[]>([]);

  isCreateModalOpen = signal(false);
  isEditModalOpen = signal(false);
  isLogModalOpen = signal(false);
  isConfirmCancelModalOpen = signal(false);

  selectedAppointment = signal<any>(null);
  appointmentToCancelId = signal<string | null>(null);
  activeDropdownId = signal<string | null>(null);

  isFilterDropdownOpen = signal(false);
  selectedFilter = signal('ทั้งหมด');
  filterOptions = ['ทั้งหมด', 'วิชาการ', 'กิจกรรม'];

  selectionMode = signal<'group' | 'all'>('group');
  selectedStudentIds = signal<string[]>([]);

  ngOnInit() {
    this.loadAppointments();
    this.loadMyStudents();
  }

  loadMyStudents() {
    this.http.get<any[]>(`${environment.apiUrl}/get_advisor_students.php?advisor_id=14`).subscribe({
      next: (data) => {
        this.myStudents.set(data || []);
      },
      error: (err) => console.error('ดึงรายชื่อนักศึกษาล้มเหลว:', err),
    });
  }

  loadAppointments() {
    const url = `${environment.apiUrl}/get_appointments.php?advisor_id=14&t=${new Date().getTime()}`;
    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        const groupApps = (data || []).filter(
          (app: any) => app.students && app.students.length > 1,
        );
        const formattedApps = groupApps.map((app: any) => ({
          id: (app.appointment_id || Math.random()).toString(), // ใช้ appointment_id ที่ตรงกับ DB
          topic: app.title || 'ไม่มีหัวข้อ',
          type: app.type || 'วิชาการ',
          status: app.status || 'นัดหมาย',
          date: this.formatThaiDate(app.appointment_date),
          time: this.formatTime(app.start_time),
          details: app.description || '',
          students: (app.students || []).map((s: any) => ({
            id: s.id,
            name: s.name,
            img: s.img ? `${environment.apiUrl}/${s.img}` : `https://i.pravatar.cc/150?u=${s.id}`,
          })),
        }));
        this.appointments.set(formattedApps);

        // 👉 ระบบเลื่อนหน้าจออัตโนมัติมาหาการ์ดที่ถูกคลิกมาจาก Home
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
            }, 300); // รอ DOM เรนเดอร์เสร็จค่อยเลื่อน
          }
        });
      },
      error: (err) => console.error('ดึงข้อมูลนัดหมายล้มเหลว:', err),
    });
  }

  setSelectionMode(mode: 'group' | 'all') {
    this.selectionMode.set(mode);
    if (mode === 'all') {
      this.selectedStudentIds.set(this.myStudents().map((s) => s.student_code));
    } else {
      this.selectedStudentIds.set([]);
    }
  }

  toggleStudentSelection(studentCode: string) {
    const current = this.selectedStudentIds();
    if (current.includes(studentCode)) {
      this.selectedStudentIds.set(current.filter((id) => id !== studentCode));
    } else {
      this.selectedStudentIds.set([...current, studentCode]);
    }
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
    this.selectedStudentIds.set(app.students.map((s: any) => s.id));
    this.selectionMode.set('group');
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
    this.selectedStudentIds.set([]);
  }

  exportToExcel() {
    const data = this.appointments();
    if (data.length === 0) return alert('ไม่มีข้อมูลสำหรับ Export');
    const headers = [
      'หัวข้อ',
      'ประเภท',
      'สถานะ',
      'วันที่',
      'เวลา',
      'รายละเอียด',
      'จำนวนนักศึกษา(คน)',
    ];
    const csvRows = data.map((app) =>
      [
        `"${app.topic}"`,
        `"${app.type}"`,
        `"${app.status}"`,
        `"${app.date}"`,
        `"${app.time}"`,
        `"${app.details}"`,
        `"${app.students.length}"`,
      ].join(','),
    );
    const bom = '\uFEFF';
    const blob = new Blob([bom + [headers.join(','), ...csvRows].join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', 'ข้อมูลนัดหมายกลุ่ม.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
