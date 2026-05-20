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

  appointments = signal<any[]>([]);
  myStudents = signal<any[]>([]);

  searchQuery = signal('');
  selectedFilter = signal('สถานะทั้งหมด');
  filterOptions = signal<string[]>([
    'สถานะทั้งหมด',
    'วิชาการ',
    'อาชีพ/ฝึกงาน',
    'กิจกรรม',
    'ส่วนตัว',
  ]);

  filteredAppointments = computed(() => {
    let list = this.appointments();
    const query = this.searchQuery().toLowerCase();
    const filter = this.selectedFilter();

    if (filter !== 'สถานะทั้งหมด') {
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
  activeDropdownId = signal<string | null>(null);
  isFilterDropdownOpen = signal(false);

  availableTypes = signal<string[]>(['วิชาการ', 'อาชีพ/ฝึกงาน', 'กิจกรรม', 'ส่วนตัว']);
  isCreateTypeOpen = signal(false);
  isEditTypeOpen = signal(false);

  newApp = { studentId: '', date: '', time: '', type: '', topic: '', details: '' };
  selectedApp: any = null;
  appointmentToCancelId: string | null = null;

  isStudentDropdownOpen = signal(false);
  studentSearch = signal('');

  selectStudent(std: any) {
    this.newApp.studentId = std.student_id;
    this.studentSearch.set(`${std.full_name} (${std.student_code})`);
    this.isStudentDropdownOpen.set(false);
  }

  filteredStudents = computed(() => {
    const query = this.studentSearch().toLowerCase();
    return this.myStudents().filter(
      (s) => s.full_name.toLowerCase().includes(query) || s.student_code.includes(query),
    );
  });

  ngOnInit() {
    this.loadAppointments();
    this.loadMyStudents();
  }

  // ✅ แก้ตรงนี้: pre-process imgUrl ให้พร้อมใช้งานเลย
  loadMyStudents() {
    this.http
      .get<any[]>(`${environment.apiUrl}/get_advisor_students.php?advisor_id=14`)
      .subscribe((data) => {
        const processed = (data || []).map((s) => ({
          ...s,

          imgUrl:
            s.image && s.image.trim() !== ''
              ? `${environment.apiUrl}/${s.image}`
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(s.full_name)}&background=fed7aa&color=c2410c`,
        }));
        this.myStudents.set(processed);
      });
  }

  loadAppointments() {
    this.http.get<any[]>(`${environment.apiUrl}/get_appointments.php?advisor_id=14`).subscribe({
      next: (data) => {
        const types = [...new Set(data.map((item) => item.type))];
        this.filterOptions.set(['สถานะทั้งหมด', ...types]);

        const formattedApps = data
          .filter((a) => a.students?.length === 1)
          .map((app) => ({
            id: app.appointment_id.toString(),
            topic: app.title,
            type: app.type,
            status: app.status,
            date: this.formatThaiDate(app.appointment_date),
            rawDate: app.appointment_date,
            time: this.formatTime(app.start_time),
            rawTime: app.start_time.substring(0, 5),
            details: app.description,
            studentName: app.students[0].name,
            studentId: app.students[0].id,
            img: app.students[0].img
              ? `${environment.apiUrl}/${app.students[0].img}`
              : `https://i.pravatar.cc/150?u=${app.students[0].id}`,
          }));
        this.appointments.set(formattedApps);
      },
    });
  }

  apiUrl = environment.apiUrl;

  onImgError(event: Event, name: string) {
    const element = event.target as HTMLImageElement;
    element.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`;
  }

  submitCreateAppointment() {
    if (!this.newApp.studentId || !this.newApp.topic || !this.newApp.date || !this.newApp.type) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    const payload = {
      advisor_id: 14,
      title: this.newApp.topic,
      description: this.newApp.details,
      date: this.newApp.date,
      time: this.newApp.time,
      type: this.newApp.type,
      student_ids: [this.newApp.studentId],
    };
    this.http
      .post(`${environment.apiUrl}/create_appointment.php`, payload)
      .subscribe((res: any) => {
        if (res.status === 'success') {
          this.closeModals();
          this.loadAppointments();
          this.newApp = { studentId: '', date: '', time: '', type: '', topic: '', details: '' };
          this.studentSearch.set('');
        } else alert('เกิดข้อผิดพลาด: ' + res.message);
      });
  }

  submitEditAppointment() {
    const payload = {
      appointment_id: this.selectedApp.id,
      title: this.selectedApp.topic,
      description: this.selectedApp.details,
      date: this.selectedApp.rawDate,
      time: this.selectedApp.rawTime,
      type: this.selectedApp.type,
    };
    this.http
      .post(`${environment.apiUrl}/update_appointment.php`, payload)
      .subscribe((res: any) => {
        if (res.status === 'success') {
          this.closeModals();
          this.loadAppointments();
        } else alert('เกิดข้อผิดพลาด: ' + res.message);
      });
  }

  confirmCancel() {
    if (this.appointmentToCancelId) {
      this.http
        .post(`${environment.apiUrl}/delete_appointment.php`, {
          appointment_id: this.appointmentToCancelId,
        })
        .subscribe((res: any) => {
          if (res.status === 'success') {
            this.loadAppointments();
          } else alert('เกิดข้อผิดพลาด: ' + res.message);
        });
    }
    this.closeModals();
  }

  get filteredCreateTypes() {
    return this.availableTypes().filter((t) =>
      t.toLowerCase().includes((this.newApp.type || '').toLowerCase()),
    );
  }
  get filteredEditTypes() {
    return this.availableTypes().filter((t) =>
      t.toLowerCase().includes((this.selectedApp?.type || '').toLowerCase()),
    );
  }

  selectCreateType(type: string) {
    this.newApp.type = type;
    this.isCreateTypeOpen.set(false);
  }
  addCreateType() {
    if (!this.availableTypes().includes(this.newApp.type)) {
      this.availableTypes.update((t) => [...t, this.newApp.type]);
    }
    this.isCreateTypeOpen.set(false);
  }

  selectEditType(type: string) {
    this.selectedApp.type = type;
    this.isEditTypeOpen.set(false);
  }
  addEditType() {
    if (!this.availableTypes().includes(this.selectedApp.type)) {
      this.availableTypes.update((t) => [...t, this.selectedApp.type]);
    }
    this.isEditTypeOpen.set(false);
  }

  closeDropdowns() {
    this.activeDropdownId.set(null);
    this.isFilterDropdownOpen.set(false);
    this.isCreateTypeOpen.set(false);
    this.isEditTypeOpen.set(false);
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
  formatTime(tStr: string) {
    return tStr ? tStr.substring(0, 5) + ' น.' : '';
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

  openLogModal(app: any) {
    this.selectedApp = { ...app };
    this.isLogModalOpen.set(true);
    this.activeDropdownId.set(null);
  }
  openEditModal(app: any, e: Event) {
    e.stopPropagation();
    this.selectedApp = { ...app };
    this.isEditModalOpen.set(true);
    this.activeDropdownId.set(null);
  }
  promptCancelAppointment(id: string, e: Event) {
    e.stopPropagation();
    this.activeDropdownId.set(null);
    this.appointmentToCancelId = id;
    this.isConfirmCancelModalOpen.set(true);
  }

  closeModals() {
    this.isCreateModalOpen.set(false);
    this.isEditModalOpen.set(false);
    this.isLogModalOpen.set(false);
    this.isConfirmCancelModalOpen.set(false);
    this.appointmentToCancelId = null;
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
