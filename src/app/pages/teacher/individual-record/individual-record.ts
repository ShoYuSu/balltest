import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-individual-record',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './individual-record.html',
  styleUrl: './individual-record.css',
})
export class IndividualRecord implements OnInit {
  private http = inject(HttpClient);
  apiUrl = environment.apiUrl;

  students = signal<any[]>([]);
  searchQuery = signal('');

  currentPage = signal(1);
  pageSize = signal(5);

  filteredStudents = computed(() => {
    const query = this.searchQuery().toLowerCase();
    let list = this.students();
    if (query) {
      list = list.filter(
        (s) => s.full_name.toLowerCase().includes(query) || s.student_code.includes(query),
      );
    }
    return list;
  });

  paginatedStudents = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredStudents().slice(start, start + this.pageSize());
  });

  totalPages = computed(() => Math.ceil(this.filteredStudents().length / this.pageSize()));

  selectedStudent = signal<any>(null);
  studentLogs = signal<any[]>([]);
  sortOrder = signal<'desc' | 'asc'>('desc');

  activeDropdownId = signal<string | null>(null);
  isEditModalOpen = signal(false);
  isConfirmRevertModalOpen = signal(false);
  editingLog: any = null;
  revertingLogId: string | null = null;

  // 🎯 เพิ่ม State สำหรับคุมการเปิด/ปิด Dropdown เรียงลำดับ
  isSortDropdownOpen = signal(false);

  sortedLogs = computed(() => {
    let logs = [...this.studentLogs()];
    logs.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return this.sortOrder() === 'desc' ? dateB - dateA : dateA - dateB;
    });
    return logs;
  });

  ngOnInit() {
    this.loadStudentsSummary();
  }

  loadStudentsSummary() {
    this.http
      .get<any[]>(`${this.apiUrl}/get_student_consultation_summary.php?advisor_id=14`)
      .subscribe({
        next: (data) => {
          const processed = data.map((s) => ({
            ...s,
            imgUrl:
              s.image && s.image.trim() !== ''
                ? `${this.apiUrl}/${s.image}`
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(s.full_name)}&background=fff7ed&color=ea580c`,
            formattedLatestDate: s.latest_date ? this.formatThaiDate(s.latest_date) : '-',
          }));
          this.students.set(processed);
        },
        error: () => console.error('Failed to load students summary'),
      });
  }

  viewStudentLogs(student: any) {
    this.selectedStudent.set(student);
    this.http
      .get<
        any[]
      >(`${this.apiUrl}/get_student_consultation_logs.php?advisor_id=14&student_id=${student.student_id}`)
      .subscribe({
        next: (data) => this.studentLogs.set(data || []),
        error: () => this.studentLogs.set([]),
      });
  }

  goBack() {
    this.selectedStudent.set(null);
    this.studentLogs.set([]);
    this.loadStudentsSummary();
  }

  // 🎯 ปรับปรุงการกดปิด Dropdown นอกพื้นที่
  closeDropdowns() {
    this.activeDropdownId.set(null);
    this.isSortDropdownOpen.set(false);
  }

  toggleDropdown(id: string, e: Event) {
    e.stopPropagation();
    this.isSortDropdownOpen.set(false); // ปิดอันอื่น
    this.activeDropdownId.set(this.activeDropdownId() === id ? null : id);
  }

  // 🎯 ฟังก์ชันสำหรับ Dropdown เรียงลำดับ (Custom)
  toggleSortDropdown(e: Event) {
    e.stopPropagation();
    this.activeDropdownId.set(null); // ปิดอันอื่น
    this.isSortDropdownOpen.set(!this.isSortDropdownOpen());
  }

  setSortOrder(order: 'desc' | 'asc') {
    this.sortOrder.set(order);
    this.isSortDropdownOpen.set(false);
  }

  openEditLogModal(log: any, e: Event) {
    e.stopPropagation();
    this.editingLog = { ...log };
    this.isEditModalOpen.set(true);
    this.closeDropdowns();
  }

  promptRevertLog(id: string, e: Event) {
    e.stopPropagation();
    this.revertingLogId = id;
    this.isConfirmRevertModalOpen.set(true);
    this.closeDropdowns();
  }

  closeModals() {
    this.isEditModalOpen.set(false);
    this.isConfirmRevertModalOpen.set(false);
    this.editingLog = null;
    this.revertingLogId = null;
  }

  submitEditLog() {
    if (!this.editingLog || !this.editingLog.note) return alert('กรุณากรอกรายละเอียด');
    this.http
      .post(`${this.apiUrl}/update_appointment_log.php`, {
        appointment_id: this.editingLog.appointment_id,
        note: this.editingLog.note,
      })
      .subscribe({
        next: (res: any) => {
          if (res.status === 'success') {
            this.closeModals();
            this.viewStudentLogs(this.selectedStudent());
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
            this.viewStudentLogs(this.selectedStudent());
            this.loadStudentsSummary();
          } else alert('เกิดข้อผิดพลาด: ' + res.message);
        },
        error: () => alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้'),
      });
  }

  clearSearch() {
    this.searchQuery.set('');
    this.currentPage.set(1);
  }

  onImgError(event: Event, name: string) {
    (event.target as HTMLImageElement).src =
      `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=fff7ed&color=ea580c`;
  }

  formatThaiDate(dStr: string) {
    if (!dStr) return '';
    const m = [
      'มกราคม',
      'กุมภาพันธ์',
      'มีนาคม',
      'เมษายน',
      'พฤษภาคม',
      'มิถุนายน',
      'กรกฎาคม',
      'สิงหาคม',
      'กันยายน',
      'ตุลาคม',
      'พฤศจิกายน',
      'ธันวาคม',
    ];
    const d = new Date(dStr);
    return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear() + 543}`;
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) this.currentPage.update((p) => p + 1);
  }
  prevPage() {
    if (this.currentPage() > 1) this.currentPage.update((p) => p - 1);
  }
  goToPage(page: number) {
    this.currentPage.set(page);
  }
  getPagesArray() {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  }

  exportMainToExcel() {
    const data = this.filteredStudents();
    if (!data.length) return alert('ไม่มีข้อมูล');
    const headers = ['รหัสนักศึกษา', 'ชื่อ-สกุล', 'จำนวนรายการที่ปรึกษา', 'ปรึกษาล่าสุด'];
    const csvRows = data.map(
      (s) => `"${s.student_code}","${s.full_name}","${s.total_records}","${s.formattedLatestDate}"`,
    );
    this.downloadCSV(headers, csvRows, 'สรุปประวัติการปรึกษารวม.csv');
  }

  exportDetailToExcel() {
    const data = this.sortedLogs();
    const student = this.selectedStudent();
    if (!data.length) return alert('ไม่มีข้อมูล');
    const headers = ['วันที่', 'เวลา', 'ประเภท', 'รูปแบบ', 'หัวข้อ', 'รายละเอียดการปรึกษา'];
    const csvRows = data.map(
      (l) =>
        `"${this.formatThaiDate(l.date)}","${l.time}","${l.type}","${l.isGroup ? 'กลุ่ม' : 'เดี่ยว'}","${l.title}","${l.note}"`,
    );
    this.downloadCSV(headers, csvRows, `ประวัติการปรึกษา_${student.student_code}.csv`);
  }

  private downloadCSV(headers: string[], rows: string[], filename: string) {
    const bom = '\uFEFF';
    const blob = new Blob([bom + [headers.join(','), ...rows].join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', filename);
    link.click();
  }
}
