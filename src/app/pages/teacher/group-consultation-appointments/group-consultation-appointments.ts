import { Component, signal, computed, OnInit, inject } from '@angular/core';
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
  private route = inject(ActivatedRoute);

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
          a.topic.toLowerCase().includes(query) ||
          a.students.some((s: any) => s.name.toLowerCase().includes(query)),
      );
    }
    return list;
  });

  isCreateModalOpen = signal(false);
  isEditModalOpen = signal(false);
  isLogModalOpen = signal(false);
  isConfirmCancelModalOpen = signal(false);

  // 🌟 เพิ่ม Signal สำหรับระบบจัดการประเภท
  isManageTypesModalOpen = signal(false);
  isCreateTypeOpen = signal(false);
  isEditTypeOpen = signal(false);
  newTypeInput = signal('');

  activeDropdownId = signal<string | null>(null);
  isFilterDropdownOpen = signal(false);

  newApp = { date: '', time: '', endTime: '', type: 'วิชาการ', topic: '', details: '' };
  editingApp: any = null;
  appointmentToCancelId = signal<string | null>(null);

  selectionMode = signal<'group' | 'all'>('group');
  selectedStudentIds = signal<string[]>([]);

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
            student_id: String(s.student_id),
            imgUrl:
              s.image && s.image.trim() !== ''
                ? `${environment.apiUrl}/${s.image}`
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(s.full_name)}&background=fed7aa&color=c2410c`,
          }));
          this.myStudents.set(processed);
        },
        error: (err) => console.error('ดึงรายชื่อนักศึกษาล้มเหลว:', err),
      });
  }

  loadAppointments() {
    const advisorId = localStorage.getItem('advisor_id');
    const url = `${environment.apiUrl}/get_appointments.php?advisor_id=${advisorId}&t=${new Date().getTime()}`;
    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        const groupApps = (data || []).filter(
          (app: any) => app.students && app.students.length > 1 && app.status !== 'ดำเนินการแล้ว',
        );

        const typesFromDb = [
          ...new Set(
            groupApps.map((item: any) => item.type).filter((t: any) => t && t.trim() !== ''),
          ),
        ] as string[];
        const mergedTypes = [...new Set([...this.availableTypes(), ...typesFromDb])];
        this.availableTypes.set(mergedTypes);

        const formattedApps = groupApps.map((app: any) => ({
          id: app.appointment_id.toString(),
          topic: app.title || 'ไม่มีหัวข้อ',
          type: app.type || '',
          status: app.status || 'นัดหมาย',
          note: app.note || '',
          date: this.formatThaiDate(app.appointment_date),
          rawDate: app.appointment_date,
          time: this.formatTime(app.start_time, app.end_time),
          rawTime: app.start_time ? app.start_time.substring(0, 5) : '',
          rawEndTime: app.end_time ? app.end_time.substring(0, 5) : '',
          details: app.description || '',
          students: (app.students || []).map((s: any) => ({
            id: s.id,
            name: s.name,
            img: s.img
              ? `${environment.apiUrl}/${s.img}`
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=fed7aa&color=c2410c`,
          })),
        }));
        this.appointments.set(formattedApps);

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
      error: (err) => console.error('ดึงข้อมูลนัดหมายล้มเหลว:', err),
    });
  }

  onImgError(event: Event, name: string) {
    (event.target as HTMLImageElement).src =
      `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=fed7aa&color=c2410c`;
  }

  // =====================================
  // ระบบจัดการประเภท (Type Management)
  // =====================================
  get filteredCreateTypes() {
    const q = (this.newApp.type || '').toLowerCase();
    return this.availableTypes().filter((t) => t.toLowerCase().includes(q));
  }

  get filteredEditTypes() {
    const q = (this.editingApp?.type || '').toLowerCase();
    return this.availableTypes().filter((t) => t.toLowerCase().includes(q));
  }

  selectCreateType(type: string) {
    this.newApp.type = type;
    this.isCreateTypeOpen.set(false);
  }

  selectEditType(type: string) {
    if (this.editingApp) this.editingApp.type = type;
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
    const val = this.editingApp?.type?.trim();
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
    if (this.editingApp?.type === type) this.editingApp.type = '';
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

  openManageTypesModal(e: Event) {
    e.stopPropagation();
    this.newTypeInput.set('');
    this.isManageTypesModalOpen.set(true);
    this.isCreateTypeOpen.set(false);
    this.isEditTypeOpen.set(false);
  }

  // =====================================
  // สร้าง/แก้ไข/ลบ นัดหมาย
  // =====================================
  submitCreateAppointment() {
    const advisorId = localStorage.getItem('advisor_id');
    if (this.selectedStudentIds().length < 2 || !this.newApp.topic || !this.newApp.date) {
      alert('กรุณากรอกข้อมูลให้ครบและเลือกนักศึกษาอย่างน้อย 2 คน');
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
      student_ids: this.selectedStudentIds(),
    };
    this.http.post(`${environment.apiUrl}/create_appointment.php`, payload).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.closeModals();
          this.loadAppointments();
        } else alert('เกิดข้อผิดพลาด: ' + res.message);
      },
      error: () => alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้'),
    });
  }

  submitEditAppointment() {
    if (!this.editingApp.topic || !this.editingApp.rawDate) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    const payload = {
      appointment_id: this.editingApp.id,
      title: this.editingApp.topic,
      description: this.editingApp.details,
      date: this.editingApp.rawDate,
      time: this.editingApp.rawTime,
      end_time: this.editingApp.rawEndTime,
      type: this.editingApp.type,
      student_ids: this.selectedStudentIds(),
    };
    this.http.post(`${environment.apiUrl}/update_appointment.php`, payload).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.closeModals();
          this.loadAppointments();
        } else alert('เกิดข้อผิดพลาด: ' + res.message);
      },
      error: () => alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้'),
    });
  }

  submitConsultationLog() {
    if (!this.editingApp.note) {
      alert('กรุณากรอกผลการให้คำปรึกษา');
      return;
    }
    const payload = {
      appointment_id: this.editingApp.id,
      note: this.editingApp.note,
      status: 'ดำเนินการแล้ว',
    };
    this.http.post(`${environment.apiUrl}/save_appointment_log.php`, payload).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.closeModals();
          this.loadAppointments();
        } else alert('เกิดข้อผิดพลาด: ' + res.message);
      },
      error: () => alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้'),
    });
  }

  confirmCancel() {
    const id = this.appointmentToCancelId();
    if (id) {
      this.http
        .post(`${environment.apiUrl}/delete_appointment.php`, { appointment_id: id })
        .subscribe({
          next: (res: any) => {
            if (res.status === 'success') {
              this.loadAppointments();
            } else alert('เกิดข้อผิดพลาด: ' + res.message);
          },
          error: () => alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้'),
        });
    }
    this.closeModals();
  }

  setSelectionMode(mode: 'group' | 'all') {
    this.selectionMode.set(mode);
    if (mode === 'all') {
      this.selectedStudentIds.set(this.myStudents().map((s) => s.student_id));
    } else {
      this.selectedStudentIds.set([]);
    }
  }

  toggleStudentSelection(studentId: string) {
    studentId = String(studentId);
    const current = this.selectedStudentIds();
    if (current.includes(studentId)) {
      this.selectedStudentIds.set(current.filter((id) => id !== studentId));
    } else {
      this.selectedStudentIds.set([...current, studentId]);
    }
  }

  openLogModal(app: any) {
    this.editingApp = { ...app, note: app.note || '' };
    this.isLogModalOpen.set(true);
    this.activeDropdownId.set(null);
  }

  openEditModal(app: any, event: Event) {
    event.stopPropagation();
    this.editingApp = { ...app };

    const mappedIds = app.students.map((s: any) => {
      const match = this.myStudents().find(
        (std) =>
          String(std.student_code) === String(s.id) || String(std.student_id) === String(s.id),
      );
      return match ? String(match.student_id) : String(s.id);
    });

    this.selectedStudentIds.set(mappedIds);
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

  closeDropdowns() {
    this.activeDropdownId.set(null);
    this.isFilterDropdownOpen.set(false);
    this.isCreateTypeOpen.set(false);
    this.isEditTypeOpen.set(false);
  }

  closeModals() {
    this.isCreateModalOpen.set(false);
    this.isEditModalOpen.set(false);
    this.isLogModalOpen.set(false);
    this.isConfirmCancelModalOpen.set(false);
    this.isManageTypesModalOpen.set(false);
    this.isCreateTypeOpen.set(false);
    this.isEditTypeOpen.set(false);
    this.editingApp = null;
    this.appointmentToCancelId.set(null);
    this.newTypeInput.set('');
    this.newApp = { date: '', time: '', endTime: '', type: 'วิชาการ', topic: '', details: '' };
    this.selectedStudentIds.set([]);
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

  formatTime(start: string, end?: string): string {
    let str = start ? start.substring(0, 5) : '';
    if (end) {
      str += ' - ' + end.substring(0, 5);
    }
    return str ? str + ' น.' : '';
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
    this.activeDropdownId.set(this.activeDropdownId() === id ? null : id);
  }

  exportToExcel() {
    const data = this.filteredAppointments();
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
    link.click();
  }
  openCreateModal() {
    // รีเซ็ตค่าฟอร์มให้ว่าง
    this.newApp = { date: '', time: '', endTime: '', type: 'วิชาการ', topic: '', details: '' };
    this.selectedStudentIds.set([]);
    this.selectionMode.set('group');

    // ปิด dropdown อื่นๆ ก่อนเปิด
    this.isCreateTypeOpen.set(false);
    this.isManageTypesModalOpen.set(false);
    this.newTypeInput.set('');

    // เปิดหน้าต่าง Modal สร้างนัดหมาย
    this.isCreateModalOpen.set(true);
  }
}
