import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-group-record',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './group-record.html',
  styleUrl: './group-record.css',
})
export class GroupRecord implements OnInit {
  private http = inject(HttpClient);
  apiUrl = environment.apiUrl;

  // --- State ---
  appointments = signal<any[]>([]);
  searchQuery = signal('');
  selectedFilter = signal('ทั้งหมด');
  availableTypes = signal<string[]>(['วิชาการ', 'กิจกรรม', 'ส่วนตัว', 'อาชีพ/ฝึกงาน']);
  filterOptions = computed(() => ['ทั้งหมด', ...this.availableTypes()]);

  // --- Pagination ---
  currentPage = signal(1);
  itemsPerPage = 5;

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
          a.note.toLowerCase().includes(query) ||
          a.students.some((s: any) => s.name.toLowerCase().includes(query)),
      );
    }
    return list;
  });

  paginatedAppointments = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return this.filteredAppointments().slice(start, start + this.itemsPerPage);
  });

  totalItems = computed(() => this.filteredAppointments().length);
  totalPages = computed(() => Math.ceil(this.totalItems() / this.itemsPerPage));
  pageNumbers = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  // --- Modals State ---
  activeDropdownId = signal<string | null>(null);
  isFilterDropdownOpen = signal(false);
  isEditModalOpen = signal(false);
  isConfirmRevertModalOpen = signal(false);

  editingLog: any = null;
  revertingLogId: string | null = null;

  ngOnInit() {
    this.loadGroupRecords();
  }

  loadGroupRecords() {
    const advisorId = localStorage.getItem('user_id');
    const url = `${this.apiUrl}/get_appointments.php?advisor_id=${advisorId}&t=${new Date().getTime()}`;
    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        // กรองเอาเฉพาะ "แบบกลุ่ม" และ "ดำเนินการแล้ว"
        const groupRecords = (data || []).filter(
          (app: any) => app.students && app.students.length > 1 && app.status === 'ดำเนินการแล้ว',
        );

        const typesFromDb = [
          ...new Set(
            groupRecords.map((item: any) => item.type).filter((t: any) => t && t.trim() !== ''),
          ),
        ] as string[];
        const mergedTypes = [...new Set([...this.availableTypes(), ...typesFromDb])];
        this.availableTypes.set(mergedTypes);

        const formattedApps = groupRecords.map((app: any) => ({
          id: app.appointment_id.toString(),
          topic: app.title || 'ไม่มีหัวข้อ',
          type: app.type || '',
          status: app.status,
          note: app.note || '',
          details: app.description || '',
          date: this.formatThaiDate(app.appointment_date),
          time: app.start_time ? app.start_time.substring(0, 5) + ' น.' : '',
          rawDate: app.appointment_date,
          students: (app.students || []).map((s: any) => ({
            id: s.id,
            name: s.name,
            img: s.img
              ? `${this.apiUrl}/${s.img}`
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=f1f5f9&color=64748b`,
          })),
        }));

        // เรียงจากใหม่ไปเก่า
        formattedApps.sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime());
        this.appointments.set(formattedApps);
      },
      error: (err) => console.error('ดึงข้อมูลบันทึกแบบกลุ่มล้มเหลว:', err),
    });
  }

  // ==================== API Calls ====================
  submitEditLog() {
    if (!this.editingLog || !this.editingLog.note) return alert('กรุณากรอกรายละเอียดผลการปรึกษา');

    this.http
      .post(`${this.apiUrl}/update_appointment_log.php`, {
        appointment_id: this.editingLog.id,
        note: this.editingLog.note,
      })
      .subscribe({
        next: (res: any) => {
          if (res.status === 'success') {
            this.closeModals();
            this.loadGroupRecords();
          } else alert('เกิดข้อผิดพลาด: ' + res.message);
        },
        error: () => alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้'),
      });
  }

  confirmRevertLog() {
    if (!this.revertingLogId) return;

    this.http
      .post(`${this.apiUrl}/revert_appointment_log.php`, {
        appointment_id: this.revertingLogId,
      })
      .subscribe({
        next: (res: any) => {
          if (res.status === 'success') {
            this.closeModals();
            this.loadGroupRecords(); // ข้อมูลจะหายไปจากหน้านี้ กลับไปหน้านัดหมาย
          } else alert('เกิดข้อผิดพลาด: ' + res.message);
        },
        error: () => alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้'),
      });
  }

  // ==================== UI & Helpers ====================
  toggleDropdown(id: string, event: Event) {
    event.stopPropagation();
    this.isFilterDropdownOpen.set(false);
    this.activeDropdownId.set(this.activeDropdownId() === id ? null : id);
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
    this.currentPage.set(1);
  }

  openEditLogModal(app: any, event: Event) {
    event.stopPropagation();
    this.editingLog = { ...app };
    this.isEditModalOpen.set(true);
    this.activeDropdownId.set(null);
  }

  promptRevertLog(id: string, event: Event) {
    event.stopPropagation();
    this.revertingLogId = id;
    this.isConfirmRevertModalOpen.set(true);
    this.activeDropdownId.set(null);
  }

  closeModals() {
    this.isEditModalOpen.set(false);
    this.isConfirmRevertModalOpen.set(false);
    this.editingLog = null;
    this.revertingLogId = null;
  }

  closeAllDropdowns() {
    this.activeDropdownId.set(null);
    this.isFilterDropdownOpen.set(false);
  }

  clearSearch() {
    this.searchQuery.set('');
    this.currentPage.set(1);
  }

  onImgError(event: Event, name: string) {
    (event.target as HTMLImageElement).src =
      `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f1f5f9&color=64748b`;
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

  // Pagination
  nextPage() {
    if (this.currentPage() < this.totalPages()) this.currentPage.update((p) => p + 1);
  }
  prevPage() {
    if (this.currentPage() > 1) this.currentPage.update((p) => p - 1);
  }
  goToPage(page: number) {
    this.currentPage.set(page);
  }

  exportToExcel() {
    const data = this.filteredAppointments();
    if (!data.length) return alert('ไม่มีข้อมูลสำหรับ Export');
    const headers = [
      'หัวข้อ',
      'ประเภท',
      'วันที่',
      'เวลา',
      'สิ่งที่นักศึกษาปรึกษา',
      'บันทึกผลการปรึกษา',
      'จำนวนนักศึกษา(คน)',
    ];
    const csvRows = data.map((app) =>
      [
        `"${app.topic}"`,
        `"${app.type}"`,
        `"${app.date}"`,
        `"${app.time}"`,
        `"${app.details}"`,
        `"${app.note}"`,
        `"${app.students.length}"`,
      ].join(','),
    );
    const bom = '\uFEFF';
    const blob = new Blob([bom + [headers.join(','), ...csvRows].join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', 'ประวัติการให้คำปรึกษากลุ่ม.csv');
    link.click();
  }
}
