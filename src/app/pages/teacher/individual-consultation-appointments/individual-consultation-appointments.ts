import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
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

  // ข้อมูลนัดหมายรอรับจากฐานข้อมูลจริง
  appointments = signal<any[]>([]);

  // สถานะเปิด/ปิดหน้าต่าง Modal
  isCreateModalOpen = signal(false);
  isEditModalOpen = signal(false);
  isLogModalOpen = signal(false);
  isConfirmCancelModalOpen = signal(false); // Pop-up ยืนยันยกเลิก

  selectedAppointment = signal<any>(null);
  appointmentToCancelId = signal<string | null>(null);

  // ตัวแปรควบคุมเมนูจัดการ (Dropdown ในตาราง)
  activeDropdownId = signal<string | null>(null);

  // ตัวแปรควบคุม Custom Dropdown สถานะ (แถวบน)
  isFilterDropdownOpen = signal(false);
  selectedFilter = signal('สถานะทั้งหมด');
  filterOptions = ['สถานะทั้งหมด', 'วิชาการ', 'อาชีพ/ฝึกงาน', 'ส่วนตัว'];

  ngOnInit() {
    this.loadAppointments();
  }

  // ดึงข้อมูลการนัดหมายจริงจากหลังบ้าน
  loadAppointments() {
    this.http.get<any[]>(`${environment.apiUrl}/get_appointments.php?advisor_id=14`).subscribe({
      next: (data) => {
        // กรองเอาเฉพาะการนัดหมายที่มีนักศึกษาคนเดียว (รายบุคคล)
        const individualApps = data.filter((app: any) => app.students && app.students.length === 1);

        // จัด Format ข้อมูลแปลงเข้าตัวแปรที่หน้า HTML รอรับ
        const formattedApps = individualApps.map((app: any) => ({
          id: app.appointment_id.toString(),
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
      },
      error: (err) => {
        console.error('ดึงข้อมูลนัดหมายรายบุคคลล้มเหลว:', err);
      },
    });
  }

  // แปลงรูปแบบวันที่พุทธศักราช (เช่น 2026-01-20 -> 20 ม.ค. 2569)
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

  // แปลงรูปแบบเวลา (เช่น 14:00:00 -> 14:00 น.)
  formatTime(timeString: string): string {
    if (!timeString) return '';
    return timeString.substring(0, 5) + ' น.';
  }

  // เปิด/ปิด Custom Dropdown กรองสถานะแถวบน
  toggleFilterDropdown(event: Event) {
    event.stopPropagation();
    this.isFilterDropdownOpen.update((v) => !v);
    this.activeDropdownId.set(null);
  }

  // คลืกเลือกสถานะจาก Custom Dropdown
  selectFilter(option: string, event: Event) {
    event.stopPropagation();
    this.selectedFilter.set(option);
    this.isFilterDropdownOpen.set(false);
  }

  // เปิด/ปิด เมนูจัดการในแถวข้อมูล
  toggleDropdown(id: string, event: Event) {
    event.stopPropagation();
    this.isFilterDropdownOpen.set(false);
    if (this.activeDropdownId() === id) {
      this.activeDropdownId.set(null);
    } else {
      this.activeDropdownId.set(id);
    }
  }

  // เปิดบันทึกผลคำปรึกษา
  openLogModal(app: any) {
    this.selectedAppointment.set(app);
    this.isLogModalOpen.set(true);
    this.activeDropdownId.set(null);
  }

  // เปิดหน้าต่างแก้ไข
  openEditModal(app: any, event: Event) {
    event.stopPropagation();
    this.selectedAppointment.set(app);
    this.isEditModalOpen.set(true);
    this.activeDropdownId.set(null);
  }

  // กดปุ่มยกเลิกจากใน Dropdown (เปิด Pop-up ยืนยัน)
  promptCancelAppointment(id: string, event: Event) {
    event.stopPropagation();
    this.activeDropdownId.set(null);
    this.appointmentToCancelId.set(id);
    this.isConfirmCancelModalOpen.set(true);
  }

  // กดยืนยันจากหน้า Pop-up ลบข้อมูลจริงออกจากลิสต์
  confirmCancel() {
    const id = this.appointmentToCancelId();
    if (id) {
      this.appointments.update((apps) => apps.filter((app) => app.id !== id));
    }
    this.isConfirmCancelModalOpen.set(false);
    this.appointmentToCancelId.set(null);
  }

  // สั่งปิดหน้าต่าง Modal ทั้งหมด
  closeModals() {
    this.isCreateModalOpen.set(false);
    this.isEditModalOpen.set(false);
    this.isLogModalOpen.set(false);
    this.isConfirmCancelModalOpen.set(false);
  }

  // ส่งออกข้อมูลรายบุคคลเป็น Excel (CSV)
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
    const bom = '\uFEFF'; // ป้องกันภาษาไทยเพี้ยนใน Excel
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
