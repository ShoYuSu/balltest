import { Component, signal, computed, OnInit, inject } from '@angular/core';
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

  apiUrl = environment.apiUrl; // ดึงมาจาก environment

  appointments = signal<any[]>([]);
  myStudents = signal<any[]>([]);

  // Search & Filter
  searchQuery = signal('');
  selectedFilter = signal('ทั้งหมด');

  // Types โหลดจาก DB
  availableTypes = signal<string[]>([]);
  filterOptions = computed(() => ['ทั้งหมด', ...this.availableTypes()]);

  filteredAppointments = computed(() => {
    let list = this.appointments();
    const query = this.searchQuery().toLowerCase();
    const filter = this.selectedFilter();
    if (filter !== 'ทั้งหมด') {
      list = list.filter((a) => a.type === filter);
    }
    if (query) {
      list = list.filter(
        (a) =>
          a.studentName.toLowerCase().includes(query) ||
          a.studentId.includes(query) ||
          a.topic.toLowerCase().includes(query),
      );
    }
    return list;
  });

  // Modal states
  isCreateModalOpen = signal(false);
  isEditModalOpen = signal(false);
  isLogModalOpen = signal(false);
  isConfirmCancelModalOpen = signal(false);
  isManageTypesModalOpen = signal(false);

  activeDropdownId = signal<string | null>(null);
  isFilterDropdownOpen = signal(false);
  isCreateTypeOpen = signal(false);
  isEditTypeOpen = signal(false);
  isStudentDropdownOpen = signal(false);

  newTypeInput = signal('');

  // Form models
  newApp = { studentId: '', date: '', time: '', type: '', topic: '', details: '' };
  selectedApp: any = null;
  appointmentToCancelId: string | null = null;

  // Student search
  studentSearch = signal('');

  selectStudent(std: any) {
    this.newApp.studentId = std.student_id;
    this.studentSearch.set(`${std.full_name} (${std.student_code})`);
    this.isStudentDropdownOpen.set(false);
  }

  filteredStudents = computed(() => {
    const query = this.studentSearch().toLowerCase();
    if (!query) return this.myStudents();
    return this.myStudents().filter(
      (s) => s.full_name.toLowerCase().includes(query) || s.student_code.includes(query),
    );
  });

  ngOnInit() {
    this.loadAppointments();
    this.loadMyStudents();
  }

  loadMyStudents() {
    const advisorId = localStorage.getItem('advisor_id');
    this.http
      .get<any[]>(`${environment.apiUrl}/get_advisor_students.php?advisor_id=${advisorId}`)
      .subscribe({
        next: (data) => {
          const processed = (data || []).map((s) => ({
            ...s,
            imgUrl:
              s.image && s.image.trim() !== ''
                ? `${environment.apiUrl}/${s.image}`
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(s.full_name)}&background=fed7aa&color=c2410c`,
          }));
          this.myStudents.set(processed);
        },
        error: () => this.myStudents.set([]),
      });
  }

  loadAppointments() {
    const advisorId = localStorage.getItem('advisor_id');
    this.http
      .get<any[]>(`${environment.apiUrl}/get_appointments.php?advisor_id=${advisorId}`)
      .subscribe({
        next: (data) => {
          const typesFromDb = [
            ...new Set(data.map((item) => item.type).filter((t) => t && t.trim() !== '')),
          ] as string[];

          const existing = this.availableTypes();
          const merged = [...new Set([...typesFromDb, ...existing])];
          this.availableTypes.set(merged);

          const formattedApps = data
            // 👉 ตรงนี้แหละครับที่เพิ่มเข้ามา: && a.status !== 'ดำเนินการแล้ว'
            .filter((a) => a.students?.length === 1 && a.status !== 'ดำเนินการแล้ว')
            .map((app) => ({
              id: app.appointment_id.toString(),
              topic: app.title,
              type: app.type ?? '',
              status: app.status ?? '',
              date: this.formatThaiDate(app.appointment_date),
              rawDate: app.appointment_date,
              time: this.formatTime(app.start_time),
              rawTime: app.start_time ? app.start_time.substring(0, 5) : '',
              details: app.description ?? '',
              note: app.note ?? '', // ดึง note มาจาก DB ด้วย
              studentName: app.students[0].name,
              studentId: app.students[0].id,
              img: app.students[0].img
                ? `${environment.apiUrl}/${app.students[0].img}`
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(app.students[0].name)}&background=fed7aa&color=c2410c`,
            }));
          this.appointments.set(formattedApps);
        },
        error: () => this.appointments.set([]),
      });
  }

  // ตัวกันตายถ้ารูปโหลดไม่ขึ้น
  onImgError(event: Event, name: string) {
    (event.target as HTMLImageElement).src =
      `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=fed7aa&color=c2410c`;
  }

  // =============================================
  // CRUD
  // =============================================

  submitCreateAppointment() {
    const advisorId = localStorage.getItem('advisor_id');
    if (!this.newApp.studentId || !this.newApp.topic || !this.newApp.date || !this.newApp.type) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    const payload = {
      advisor_id: parseInt(advisorId || '0'),
      title: this.newApp.topic,
      description: this.newApp.details,
      date: this.newApp.date,
      time: this.newApp.time,
      type: this.newApp.type,
      student_ids: [this.newApp.studentId],
    };
    this.http.post(`${environment.apiUrl}/create_appointment.php`, payload).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.closeModals();
          this.loadAppointments();
        } else {
          alert('เกิดข้อผิดพลาด: ' + res.message);
        }
      },
      error: () => alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้'),
    });
  }

  submitEditAppointment() {
    if (!this.selectedApp?.topic || !this.selectedApp?.rawDate || !this.selectedApp?.type) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    const payload = {
      appointment_id: this.selectedApp.id,
      title: this.selectedApp.topic,
      description: this.selectedApp.details,
      date: this.selectedApp.rawDate,
      time: this.selectedApp.rawTime,
      type: this.selectedApp.type,
    };
    this.http.post(`${environment.apiUrl}/update_appointment.php`, payload).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.closeModals();
          this.loadAppointments();
        } else {
          alert('เกิดข้อผิดพลาด: ' + res.message);
        }
      },
      error: () => alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้'),
    });
  }

  // ฟังก์ชันใหม่: บันทึกผลการให้คำปรึกษา
  submitConsultationLog() {
    if (!this.selectedApp) return;

    const payload = {
      appointment_id: this.selectedApp.id,
      note: this.selectedApp.note || '',
      status: 'ดำเนินการแล้ว', // อัปเดตสถานะให้รู้ว่าปรึกษาเสร็จแล้ว
    };

    this.http.post(`${environment.apiUrl}/save_appointment_log.php`, payload).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.closeModals();
          // พอโหลดใหม่ ตัวที่ 'ดำเนินการแล้ว' จะหายวับไปเข้าหน้าประวัติ
          this.loadAppointments();
        } else {
          alert('เกิดข้อผิดพลาด: ' + res.message);
        }
      },
      error: () => alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้'),
    });
  }

  confirmCancel() {
    if (!this.appointmentToCancelId) {
      this.closeModals();
      return;
    }
    this.http
      .post(`${environment.apiUrl}/delete_appointment.php`, {
        appointment_id: this.appointmentToCancelId,
      })
      .subscribe({
        next: (res: any) => {
          if (res.status === 'success') {
            this.loadAppointments();
          } else {
            alert('เกิดข้อผิดพลาด: ' + res.message);
          }
          this.closeModals();
        },
        error: () => {
          alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
          this.closeModals();
        },
      });
  }

  // =============================================
  // Type Management
  // =============================================

  get filteredCreateTypes() {
    const q = (this.newApp.type || '').toLowerCase();
    return this.availableTypes().filter((t) => t.toLowerCase().includes(q));
  }

  get filteredEditTypes() {
    const q = (this.selectedApp?.type || '').toLowerCase();
    return this.availableTypes().filter((t) => t.toLowerCase().includes(q));
  }

  selectCreateType(type: string) {
    this.newApp.type = type;
    this.isCreateTypeOpen.set(false);
  }

  selectEditType(type: string) {
    if (this.selectedApp) this.selectedApp.type = type;
    this.isEditTypeOpen.set(false);
  }

  addCreateType() {
    const val = this.newApp.type.trim();
    if (val && !this.availableTypes().includes(val)) {
      this.availableTypes.update((t) => [...t, val]);
    }
    this.isCreateTypeOpen.set(false);
  }

  addEditType() {
    const val = this.selectedApp?.type?.trim();
    if (val && !this.availableTypes().includes(val)) {
      this.availableTypes.update((t) => [...t, val]);
    }
    this.isEditTypeOpen.set(false);
  }

  deleteType(type: string, e: Event) {
    e.stopPropagation();
    const inUseCount = this.appointments().filter((a) => a.type === type).length;
    if (inUseCount > 0) {
      if (
        !confirm(
          `ประเภท "${type}" ยังถูกใช้งานอยู่ใน ${inUseCount} นัดหมาย\nต้องการลบออกจากรายการประเภทหรือไม่?`,
        )
      )
        return;
    }
    this.availableTypes.update((t) => t.filter((x) => x !== type));
    if (this.newApp.type === type) this.newApp.type = '';
    if (this.selectedApp?.type === type) this.selectedApp.type = '';
    if (this.selectedFilter() === type) this.selectedFilter.set('ทั้งหมด');
  }

  addNewTypeFromModal() {
    const val = this.newTypeInput().trim();
    if (!val) return;
    if (this.availableTypes().includes(val)) {
      alert(`ประเภท "${val}" มีอยู่แล้ว`);
      return;
    }
    this.availableTypes.update((t) => [...t, val]);
    this.newTypeInput.set('');
  }

  typeUsageCount(type: string): number {
    return this.appointments().filter((a) => a.type === type).length;
  }

  // =============================================
  // Modal & Dropdown helpers
  // =============================================

  closeDropdowns() {
    this.activeDropdownId.set(null);
    this.isFilterDropdownOpen.set(false);
    this.isCreateTypeOpen.set(false);
    this.isEditTypeOpen.set(false);
    this.isStudentDropdownOpen.set(false);
  }

  toggleFilterDropdown(e: Event) {
    e.stopPropagation();
    this.isFilterDropdownOpen.update((v) => !v);
    this.activeDropdownId.set(null);
  }

  selectFilter(opt: string, e: Event) {
    e.stopPropagation();
    this.selectedFilter.set(opt);
    this.isFilterDropdownOpen.set(false);
  }

  toggleDropdown(id: string, e: Event) {
    e.stopPropagation();
    this.isFilterDropdownOpen.set(false);
    this.activeDropdownId.set(this.activeDropdownId() === id ? null : id);
  }

  openCreateModal() {
    this.newApp = { studentId: '', date: '', time: '', type: '', topic: '', details: '' };
    this.studentSearch.set('');
    this.isStudentDropdownOpen.set(false);
    this.isCreateTypeOpen.set(false);
    this.isCreateModalOpen.set(true);
  }

  openEditModal(app: any, e: Event) {
    e.stopPropagation();
    this.selectedApp = { ...app };
    this.isEditTypeOpen.set(false);
    this.isEditModalOpen.set(true);
    this.activeDropdownId.set(null);
  }

  openLogModal(app: any) {
    this.selectedApp = { ...app };
    this.isLogModalOpen.set(true);
    this.activeDropdownId.set(null);
  }

  promptCancelAppointment(id: string, e: Event) {
    e.stopPropagation();
    this.activeDropdownId.set(null);
    this.appointmentToCancelId = id;
    this.isConfirmCancelModalOpen.set(true);
  }

  openManageTypesModal(e: Event) {
    e.stopPropagation();
    this.newTypeInput.set('');
    this.isManageTypesModalOpen.set(true);
    this.isCreateTypeOpen.set(false);
    this.isEditTypeOpen.set(false);
  }

  closeModals() {
    this.isCreateModalOpen.set(false);
    this.isEditModalOpen.set(false);
    this.isLogModalOpen.set(false);
    this.isConfirmCancelModalOpen.set(false);
    this.isManageTypesModalOpen.set(false);
    this.appointmentToCancelId = null;
    this.newApp = { studentId: '', date: '', time: '', type: '', topic: '', details: '' };
    this.studentSearch.set('');
    this.isStudentDropdownOpen.set(false);
    this.isCreateTypeOpen.set(false);
    this.isEditTypeOpen.set(false);
    this.newTypeInput.set('');
  }

  // =============================================
  // Formatting
  // =============================================

  formatThaiDate(dStr: string) {
    if (!dStr) return '';
    const m = [
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
    const d = new Date(dStr);
    return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear() + 543}`;
  }

  formatTime(tStr: string) {
    return tStr ? tStr.substring(0, 5) + ' น.' : '';
  }

  exportToExcel() {
    const data = this.filteredAppointments();
    if (data.length === 0) return alert('ไม่มีข้อมูลสำหรับ Export');
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
    const bom = '\uFEFF';
    const blob = new Blob([bom + [headers.join(','), ...csvRows].join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', 'ข้อมูลนัดหมายรายบุคคล.csv');
    link.click();
  }
}
