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

  isManageTypesModalOpen = signal(false);
  isCreateTypeOpen = signal(false);
  isEditTypeOpen = signal(false);

  isCreateSemesterOpen = signal(false);
  isEditSemesterOpen = signal(false);

  newTypeInput = signal('');

  activeDropdownId = signal<string | null>(null);
  isFilterDropdownOpen = signal(false);

  newApp = {
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
  editingApp: any = null;
  appointmentToCancelId = signal<string | null>(null);

  selectionMode = signal<'group' | 'all'>('group');
  selectedStudentIds = signal<string[]>([]);

  ngOnInit() {
    this.loadTypes();
    this.loadAppointments();
    this.loadMyStudents();
  }

  loadTypes() {
    this.http.get<any>(`${environment.apiUrl}/get_appointment_types.php`).subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.availableTypes.set(res.data);
        }
      },
      error: () => console.error('ไม่สามารถโหลดประเภทการนัดหมายได้')
    });
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
          academicYear: app.academic_year || '',
          semester: app.semester || '',
          date: this.formatThaiDate(app.appointment_date),
          rawDate: app.appointment_date,
          time: this.formatTime(app.start_time, app.end_time),
          rawTime: app.start_time ? app.start_time.substring(0, 5) : '',
          rawEndTime: app.end_time ? app.end_time.substring(0, 5) : '',
          details: app.description || '',
          location: app.location || '',
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
      this.http.post(`${environment.apiUrl}/add_appointment_type.php`, { type_name: val }).subscribe({
        next: (res: any) => {
          if (res.status === 'success') this.availableTypes.update(t => [...t, val]);
        }
      });
    }
    this.isCreateTypeOpen.set(false);
  }

  addEditType() {
    const val = this.editingApp?.type?.trim();
    if (val && !this.availableTypes().includes(val)) {
      this.http.post(`${environment.apiUrl}/add_appointment_type.php`, { type_name: val }).subscribe({
        next: (res: any) => {
          if (res.status === 'success') this.availableTypes.update(t => [...t, val]);
        }
      });
    }
    this.isEditTypeOpen.set(false);
  }

  deleteType(type: string, e: Event) {
    e.stopPropagation();
    const inUseCount = this.appointments().filter((a) => a.type === type).length;
    if (inUseCount > 0) {
      if (!confirm(`ประเภท "${type}" ยังถูกใช้งานอยู่ใน ${inUseCount} นัดหมาย\nต้องการลบออกจากรายการประเภทหรือไม่?`)) return;
    }
    
    this.http.post(`${environment.apiUrl}/delete_appointment_type.php`, { type_name: type }).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.availableTypes.update((t) => t.filter((x) => x !== type));
          if (this.newApp.type === type) this.newApp.type = '';
          if (this.editingApp?.type === type) this.editingApp.type = '';
          if (this.selectedFilter() === type) this.selectedFilter.set('ทั้งหมด');
        } else alert('เกิดข้อผิดพลาด: ' + res.message);
      }
    });
  }

  addNewTypeFromModal() {
    const val = this.newTypeInput().trim();
    if (!val) return;
    if (this.availableTypes().includes(val)) {
      alert(`ประเภท "${val}" มีอยู่แล้ว`);
      return;
    }
    this.http.post(`${environment.apiUrl}/add_appointment_type.php`, { type_name: val }).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.availableTypes.update(t => [...t, val]);
          this.newTypeInput.set('');
        } else alert('เกิดข้อผิดพลาด: ' + res.message);
      }
    });
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
    if (
      this.selectedStudentIds().length < 2 ||
      !this.newApp.topic ||
      !this.newApp.date ||
      !this.newApp.academicYear ||
      !this.newApp.semester
    ) {
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
      location: this.newApp.location,
      academic_year: this.newApp.academicYear,
      semester: this.newApp.semester,
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
    if (
      !this.editingApp.topic ||
      !this.editingApp.rawDate ||
      !this.editingApp.academicYear ||
      !this.editingApp.semester
    ) {
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
      location: this.editingApp.location,
      academic_year: this.editingApp.academicYear,
      semester: this.editingApp.semester,
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

  // 🌟 ฟังก์ชันเปิด Modal แก้ไขรายละเอียด (แยกตัวแปรรายละเอียดให้ชัดเจน)
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
    this.isCreateSemesterOpen.set(false);
    this.isEditSemesterOpen.set(false);
  }

  closeModals() {
    this.isCreateModalOpen.set(false);
    this.isEditModalOpen.set(false);
    this.isLogModalOpen.set(false);
    this.isConfirmCancelModalOpen.set(false);
    this.isManageTypesModalOpen.set(false);
    this.isCreateTypeOpen.set(false);
    this.isEditTypeOpen.set(false);
    this.isCreateSemesterOpen.set(false);
    this.isEditSemesterOpen.set(false);

    this.editingApp = null;
    this.appointmentToCancelId.set(null);
    this.newTypeInput.set('');
    this.newApp = {
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

  openCreateModal() {
    this.newApp = {
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
    this.selectedStudentIds.set([]);
    this.selectionMode.set('group');

    this.isCreateTypeOpen.set(false);
    this.isManageTypesModalOpen.set(false);
    this.isCreateSemesterOpen.set(false);
    this.newTypeInput.set('');

    this.isCreateModalOpen.set(true);
  }

  // 🌟 ฟังก์ชัน Export ให้ครอบคลุมทุก Field และกัน CSV พัง
  exportToExcel() {
    const data = this.filteredAppointments();
    if (data.length === 0) return alert('ไม่มีข้อมูลสำหรับ Export');

    // 1. เพิ่มคอลัมน์ให้ครบใน Headers
    const headers = [
      'หัวข้อ',
      'ประเภท',
      'สถานะ',
      'วันที่',
      'เวลาเริ่ม-สิ้นสุด',
      'ปีการศึกษา',
      'ภาคเรียน',
      'สถานที่',
      'รายละเอียดเพิ่มเติม',
      'บันทึกผลการปรึกษา',
      'จำนวนนักศึกษา(คน)',
    ];

    const csvRows = data.map((app) => {
      // 2. ดึงข้อมูลใหม่มาใส่ตัวแปร
      const timeDisplay = app.rawEndTime ? `${app.rawTime} - ${app.rawEndTime}` : app.rawTime;
      const acaYear = app.academicYear || '-';
      const term = app.semester || '-';
      const loc = app.location || '-';

      // 3. ป้องกันไฟล์ CSV พังด้วยการแทนที่ " ด้วย ""
      const safeTopic = app.topic ? app.topic.replace(/"/g, '""') : '';
      const safeDetails = app.details ? app.details.replace(/"/g, '""') : '';
      const safeNote = app.note ? app.note.replace(/"/g, '""') : '';

      // 4. เรียงข้อมูลลง CSV ให้ตรงกับ Headers
      return [
        `"${safeTopic}"`,
        `"${app.type}"`,
        `"${app.status}"`,
        `"=""${app.date}"""`,
        `"${timeDisplay}"`,
        `"${acaYear}"`,
        `"${term}"`,
        `"${loc}"`,
        `"${safeDetails}"`,
        `"${safeNote}"`,
        `"${app.students.length}"`,
      ].join(',');
    });

    const bom = '\uFEFF';
    const blob = new Blob([bom + [headers.join(','), ...csvRows].join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });

    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', 'ข้อมูลนัดหมายกลุ่ม.csv');
    link.click();
  }
}