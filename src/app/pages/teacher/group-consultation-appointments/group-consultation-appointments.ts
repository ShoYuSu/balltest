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

  // --- Search & Filter ---
  searchQuery = signal('');
  selectedFilter = signal('ทั้งหมด');
  availableTypes = signal<string[]>(['วิชาการ', 'กิจกรรม', 'ส่วนตัว', 'อาชีพ/ฝึกงาน']);
  filterOptions = computed(() => ['ทั้งหมด', ...this.availableTypes()]);

  // Computed สำหรับกรองข้อมูลแบบ Real-time
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

  // --- Modals State ---
  isCreateModalOpen = signal(false);
  isEditModalOpen = signal(false);
  isLogModalOpen = signal(false);
  isConfirmCancelModalOpen = signal(false);

  activeDropdownId = signal<string | null>(null);
  isFilterDropdownOpen = signal(false);

  // --- Form Models ---
  newApp = { date: '', time: '', type: 'วิชาการ', topic: '', details: '' };
  editingApp: any = null;
  appointmentToCancelId = signal<string | null>(null);

  // --- Student Selection ---
  selectionMode = signal<'group' | 'all'>('group');
  selectedStudentIds = signal<string[]>([]);

  ngOnInit() {
    this.loadAppointments();
    this.loadMyStudents();
  }

  loadMyStudents() {
    const advisorId = localStorage.getItem('user_id');
    this.http
      .get<any[]>(`${environment.apiUrl}/get_advisor_students.php?advisor_id=${advisorId}`)
      .subscribe({
        next: (data) => {
          const processed = (data || []).map((s) => ({
            ...s,
            student_id: String(s.student_id), // บังคับให้ ID เป็น String ชัวร์ๆ
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
    const advisorId = localStorage.getItem('user_id');
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
          time: this.formatTime(app.start_time),
          rawTime: app.start_time ? app.start_time.substring(0, 5) : '',
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

  // ==========================================
  // CRUD API Calls
  // ==========================================

  submitCreateAppointment() {
    const advisorId = localStorage.getItem('user_id');
    if (this.selectedStudentIds().length < 2 || !this.newApp.topic || !this.newApp.date) {
      alert('กรุณากรอกข้อมูลให้ครบและเลือกนักศึกษาอย่างน้อย 2 คน (สำหรับการนัดกลุ่ม)');
      return;
    }
    const payload = {
      advisor_id: parseInt(advisorId || '0'),
      title: this.newApp.topic,
      description: this.newApp.details,
      date: this.newApp.date,
      time: this.newApp.time,
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

  // ==========================================
  // UI & Helpers
  // ==========================================

  setSelectionMode(mode: 'group' | 'all') {
    this.selectionMode.set(mode);
    if (mode === 'all') {
      this.selectedStudentIds.set(this.myStudents().map((s) => s.student_id));
    } else {
      this.selectedStudentIds.set([]);
    }
  }

  toggleStudentSelection(studentId: string) {
    studentId = String(studentId); // กันพลาด เผื่อมาเป็นตัวเลข
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

    // 👉 ไฮไลท์การแก้บั๊กอยู่ตรงนี้ครับ!
    // ค้นหา student_id ฐานข้อมูลจริงๆ มาติ๊กถูก ไม่ว่า API จะส่งรหัสอะไรมา
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

  closeModals() {
    this.isCreateModalOpen.set(false);
    this.isEditModalOpen.set(false);
    this.isLogModalOpen.set(false);
    this.isConfirmCancelModalOpen.set(false);
    this.editingApp = null;
    this.appointmentToCancelId.set(null);
    this.newApp = { date: '', time: '', type: 'วิชาการ', topic: '', details: '' };
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

  formatTime(timeString: string): string {
    return timeString ? timeString.substring(0, 5) + ' น.' : '';
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
}
