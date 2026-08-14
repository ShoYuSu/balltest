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

  apiUrl = environment.apiUrl;

  appointments = signal<any[]>([]);
  myStudents = signal<any[]>([]);

  searchQuery = signal('');
  selectedFilter = signal('ทั้งหมด');

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

  // 🌟 เพิ่ม academicYear และ semester ใน newApp
  newApp = {
    studentId: '',
    date: '',
    time: '',
    endTime: '',
    type: '',
    topic: '',
    details: '',
    location: '',
    academicYear: '',
    semester: '',
  };
  selectedApp: any = null;
  appointmentToCancelId: string | null = null;
  isCreateSemesterOpen = signal(false);
  isEditSemesterOpen = signal(false);
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
            .filter((a) => a.students?.length === 1 && a.status !== 'ดำเนินการแล้ว')
            .map((app) => ({
              id: app.appointment_id.toString(),
              topic: app.title,
              type: app.type ?? '',
              status: app.status ?? '',
              date: this.formatThaiDate(app.appointment_date),
              rawDate: app.appointment_date,
              time: this.formatTime(app.start_time, app.end_time),
              rawTime: app.start_time ? app.start_time.substring(0, 5) : '',
              rawEndTime: app.end_time ? app.end_time.substring(0, 5) : '',
              details: app.description ?? '',
              location: app.location ?? '',
              note: app.note ?? '',
              academicYear: app.academic_year ?? '', // 🌟 ดึงค่าปีการศึกษา
              semester: app.semester ?? '', // 🌟 ดึงค่าภาคเรียน
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

  onImgError(event: Event, name: string) {
    (event.target as HTMLImageElement).src =
      `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=fed7aa&color=c2410c`;
  }

  submitCreateAppointment() {
    const advisorId = localStorage.getItem('advisor_id');
    if (
      !this.newApp.studentId ||
      !this.newApp.topic ||
      !this.newApp.date ||
      !this.newApp.type ||
      !this.newApp.academicYear ||
      !this.newApp.semester
    ) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน รวมถึงปีการศึกษาและภาคเรียน');
      return;
    }
    const payload = {
      advisor_id: parseInt(advisorId || '0'),
      title: this.newApp.topic,
      description: this.newApp.details,
      date: this.newApp.date,
      time: this.newApp.time,
      end_time: this.newApp.endTime,
      type: this.newApp.type,
      location: this.newApp.location,
      academic_year: this.newApp.academicYear, // 🌟 ส่งไป PHP
      semester: this.newApp.semester, // 🌟 ส่งไป PHP
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
    if (
      !this.selectedApp?.topic ||
      !this.selectedApp?.rawDate ||
      !this.selectedApp?.type ||
      !this.selectedApp?.academicYear ||
      !this.selectedApp?.semester
    ) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน รวมถึงปีการศึกษาและภาคเรียน');
      return;
    }
    const payload = {
      appointment_id: this.selectedApp.id,
      title: this.selectedApp.topic,
      description: this.selectedApp.details,
      date: this.selectedApp.rawDate,
      time: this.selectedApp.rawTime,
      end_time: this.selectedApp.rawEndTime,
      type: this.selectedApp.type,
      location: this.selectedApp.location,
      academic_year: this.selectedApp.academicYear, // 🌟 ส่งไป PHP
      semester: this.selectedApp.semester, // 🌟 ส่งไป PHP
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

  submitConsultationLog() {
    if (!this.selectedApp) return;

    const payload = {
      appointment_id: this.selectedApp.id,
      note: this.selectedApp.note || '',
      status: 'ดำเนินการแล้ว',
    };

    this.http.post(`${environment.apiUrl}/save_appointment_log.php`, payload).subscribe({
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
    this.newApp = {
      studentId: '',
      date: '',
      time: '',
      endTime: '',
      type: '',
      topic: '',
      details: '',
      location: '',
      academicYear: '', // 🌟 รีเซ็ต
      semester: '', // 🌟 รีเซ็ต
    };
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
    this.newApp = {
      studentId: '',
      date: '',
      time: '',
      endTime: '',
      type: '',
      topic: '',
      details: '',
      location: '',
      academicYear: '',
      semester: '',
    };
    this.studentSearch.set('');
    this.isStudentDropdownOpen.set(false);
    this.isCreateTypeOpen.set(false);
    this.isEditTypeOpen.set(false);
    this.newTypeInput.set('');
  }

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

  formatTime(start: string, end?: string) {
    let str = start ? start.substring(0, 5) : '';
    if (end) {
      str += ' - ' + end.substring(0, 5);
    }
    return str ? str + ' น.' : '';
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