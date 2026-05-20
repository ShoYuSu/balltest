import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
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

  // 🔴 ข้อมูลรับจาก Database 100% (ไม่มี Mock)
  appointments = signal<any[]>([]);
  myStudents = signal<any[]>([]); // ดึงรายชื่อนักศึกษาในความดูแลของอาจารย์

  // 🔴 สถานะเปิด/ปิดหน้าต่าง Modal ต่างๆ
  isCreateModalOpen = signal(false);
  isEditModalOpen = signal(false);
  isLogModalOpen = signal(false);
  isConfirmCancelModalOpen = signal(false);

  selectedAppointment = signal<any>(null);
  appointmentToCancelId = signal<string | null>(null);
  activeDropdownId = signal<string | null>(null);

  // 🔴 ตัวแปรควบคุม Custom Dropdown สถานะแถวบน
  isFilterDropdownOpen = signal(false);
  selectedFilter = signal('สถานะทั้งหมด');
  filterOptions = ['สถานะทั้งหมด', 'วิชาการ', 'กิจกรรม'];

  // 🔴 ตัวแปรสำหรับฟอร์มสร้าง/แก้ไข
  selectionMode = signal<'group' | 'all'>('group'); // โหมด 'กลุ่ม' หรือ 'ทั้งหมด'
  selectedStudentIds = signal<string[]>([]); // เก็บ ID เด็กที่ถูกติ๊กเลือก

  ngOnInit() {
    this.loadAppointments();
    this.loadMyStudents();
  }

  // 👉 1. ดึงรายชื่อเด็กในการดูแล (เพื่อเอามาโชว์ให้ติ๊กเลือกใน Modal)
  loadMyStudents() {
    this.http.get<any[]>(`${environment.apiUrl}/get_advisor_students.php?advisor_id=14`).subscribe({
      next: (data) => {
        this.myStudents.set(data || []);
      },
      error: (err) => console.error('ดึงรายชื่อนักศึกษาล้มเหลว:', err),
    });
  }

  // 👉 2. ดึงข้อมูลนัดหมาย
  loadAppointments() {
    const url = `${environment.apiUrl}/get_appointments.php?advisor_id=14&t=${new Date().getTime()}`;
    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        const groupApps = (data || []).filter(
          (app: any) => app.students && app.students.length > 1,
        );
        const formattedApps = groupApps.map((app: any) => ({
          id: (app.appointment_id || Math.random()).toString(),
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
      },
      error: (err) => console.error('ดึงข้อมูลนัดหมายล้มเหลว:', err),
    });
  }

  // 👉 สลับโหมดการเลือกนักศึกษา (กลุ่ม / ทั้งหมด)
  setSelectionMode(mode: 'group' | 'all') {
    this.selectionMode.set(mode);
    if (mode === 'all') {
      // ติ๊กทุกคน
      this.selectedStudentIds.set(this.myStudents().map((s) => s.student_code));
    } else {
      // ล้างค่าที่ติ๊กไว้
      this.selectedStudentIds.set([]);
    }
  }

  // 👉 กดติ๊กเลือก/เอาออก นักศึกษาทีละคน
  toggleStudentSelection(studentCode: string) {
    const current = this.selectedStudentIds();
    if (current.includes(studentCode)) {
      this.selectedStudentIds.set(current.filter((id) => id !== studentCode));
    } else {
      this.selectedStudentIds.set([...current, studentCode]);
    }
  }

  // แปลงรูปแบบวันที่
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

  // แปลงเวลา (ตัดวินาที)
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
    // ดึงเด็กที่มีอยู่ในกลุ่มนี้มาติ๊กไว้ให้เลย
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
    this.selectedStudentIds.set([]); // ล้างค่าที่เลือกไว้
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
