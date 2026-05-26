import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { FormsModule } from '@angular/forms'; // 👉 1. นำเข้า FormsModule สำหรับระบบค้นหา

@Component({
  selector: 'app-all-students',
  standalone: true,
  imports: [FormsModule], // 👉 2. ใส่ใน imports
  templateUrl: './all-students.component.html',
  styleUrl: './all-students.component.css',
})
export class AllStudentsComponent implements OnInit {
  private http = inject(HttpClient);

  // --- 1. ตั้งค่าระบบ Pagination ---
  currentPage = signal(1);
  itemsPerPage = 7;

  // --- 2. รอรับข้อมูลนักศึกษาจากฐานข้อมูล ---
  studentsInCare = signal<any[]>([]);

  // 👉 3. ตัวแปรเก็บคำค้นหา
  searchQuery = signal('');

  // 👉 4. ระบบกรองข้อมูล (จะทำงานอัตโนมัติเมื่อ searchQuery เปลี่ยน)
  filteredStudents = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const students = this.studentsInCare();

    if (!query) return students; // ถ้าไม่ได้พิมพ์อะไร ให้แสดงทั้งหมด

    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.id.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query),
    );
  });

  // --- 5. คำนวณข้อมูลสำหรับ Pagination (เปลี่ยนมาอ้างอิงจาก filteredStudents แทน) ---
  totalItems = computed(() => this.filteredStudents().length);
  totalPages = computed(() => Math.ceil(this.totalItems() / this.itemsPerPage));

  paginatedStudents = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return this.filteredStudents().slice(start, start + this.itemsPerPage);
  });

  pageNumbers = computed(() => {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  });

  // --- 6. ฟังก์ชันสำหรับกดปุ่มเปลี่ยนหน้า ---
  goToPage(page: number) {
    this.currentPage.set(page);
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((p) => p + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update((p) => p - 1);
    }
  }

  // --- 7. ดึงข้อมูลจริงจาก Database ---
  ngOnInit() {
    this.http.get<any[]>(`${environment.apiUrl}/get_advisor_students.php?advisor_id=14`).subscribe({
      next: (data) => {
        const formattedStudents = data.map((student: any) => ({
          id: student.student_code,
          name: student.full_name,
          email: student.email ? student.email : 'ไม่มีอีเมล',
          year: `ปี ${student.year}`,
          gpa: student.gpa,
          credits: `${student.total_credits}/127`,
          ploStatus: student.ploStatus.replace('PLO ', ''),
          img: student.image
            ? `${environment.apiUrl}/${student.image}`
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(student.full_name)}&background=f8fafc&color=ea580c`,
        }));

        this.studentsInCare.set(formattedStudents);
      },
      error: (error) => {
        console.error('ไม่สามารถดึงข้อมูลนักศึกษาได้:', error.message);
      },
    });
  }
}
