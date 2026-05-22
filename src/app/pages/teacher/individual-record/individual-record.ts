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

  // --- State สำหรับหน้าหลัก (รายชื่อนักศึกษา) ---
  students = signal<any[]>([]);
  searchQuery = signal('');

  // Pagination State
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

  // ตัดข้อมูลสำหรับ Pagination
  paginatedStudents = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredStudents().slice(start, start + this.pageSize());
  });

  totalPages = computed(() => Math.ceil(this.filteredStudents().length / this.pageSize()));

  // --- State สำหรับหน้าประวัติ (รายบุคคล) ---
  selectedStudent = signal<any>(null); // ถ้ามีค่า = อยู่หน้าประวัติรายบุคคล
  studentLogs = signal<any[]>([]);
  sortOrder = signal<'desc' | 'asc'>('desc');

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

  // 1. ดึงข้อมูลสรุปของนักศึกษาทุกคน
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
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(s.full_name)}&background=f1f5f9&color=64748b`,
            formattedLatestDate: s.latest_date ? this.formatThaiDate(s.latest_date) : '-',
          }));
          this.students.set(processed);
        },
        error: () => console.error('Failed to load students summary'),
      });
  }

  // 2. กดปุ่ม "ดูบันทึก" -> สลับหน้าและดึงประวัติ
  viewStudentLogs(student: any) {
    this.selectedStudent.set(student);
    this.http
      .get<
        any[]
      >(`${this.apiUrl}/get_student_consultation_logs.php?advisor_id=14&student_id=${student.student_id}`)
      .subscribe({
        next: (data) => {
          this.studentLogs.set(data || []);
        },
        error: () => this.studentLogs.set([]),
      });
  }

  // 3. กดปุ่ม "ย้อนกลับ"
  goBack() {
    this.selectedStudent.set(null);
    this.studentLogs.set([]);
    this.loadStudentsSummary(); // รีเฟรชข้อมูลเผื่อมีการอัปเดต
  }

  // Helpers
  onImgError(event: Event, name: string) {
    (event.target as HTMLImageElement).src =
      `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f1f5f9&color=64748b`;
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

  // Pagination Controls
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

  // Export Excel
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
    const headers = ['วันที่', 'เวลา', 'ประเภท', 'หัวข้อ', 'รายละเอียดการปรึกษา'];
    const csvRows = data.map(
      (l) => `"${this.formatThaiDate(l.date)}","${l.time}","${l.type}","${l.title}","${l.note}"`,
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
