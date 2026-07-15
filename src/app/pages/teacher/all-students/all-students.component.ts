import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-all-students',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './all-students.component.html',
  styleUrl: './all-students.component.css',
})
export class AllStudentsComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  currentPage = signal(1);
  itemsPerPage = 7;

  studentsInCare = signal<any[]>([]);
  searchQuery = signal('');

  filteredStudents = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const students = this.studentsInCare();

    if (!query) return students;

    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.id.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query),
    );
  });

  totalItems = computed(() => this.filteredStudents().length);
  totalPages = computed(() => Math.ceil(this.totalItems() / this.itemsPerPage) || 1);

  paginatedStudents = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return this.filteredStudents().slice(start, start + this.itemsPerPage);
  });

  pageNumbers = computed(() => {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  });

  goToPage(page: number) {
    this.currentPage.set(page);
  }
  nextPage() {
    if (this.currentPage() < this.totalPages()) this.currentPage.update((p) => p + 1);
  }
  prevPage() {
    if (this.currentPage() > 1) this.currentPage.update((p) => p - 1);
  }

  goToStudentResult(student: any) {
    this.router.navigate(['/student-result', student.id], {
      state: { student: student },
    });
  }

  ngOnInit() {
    // ✅ ลบการเช็ค localStorage และลบ ?advisor_id=... ออกจาก URL แล้วยิง API ตรงๆ ได้เลย!
    this.http.get<any[]>(`${environment.apiUrl}/get_advisor_students.php`).subscribe({
      next: (data) => {
        const formattedStudents = data.map((student: any) => ({
          id: student.student_code,
          name: student.full_name,
          email: student.email ? student.email : 'ไม่มีอีเมล',
          year: student.year,
          gpa: student.gpa,
          credits: `${student.total_credits}/127`,
          ploStatus: student.ploStatus.replace('PLO ', ''),
          img: student.image
            ? `${environment.apiUrl}/${student.image}`
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(student.full_name)}&background=fff7ed&color=ea580c`,
        }));

        this.studentsInCare.set(formattedStudents);
      },
      error: (error) => {
        console.error('ไม่สามารถดึงข้อมูลนักศึกษาได้:', error.message);
      },
    });
  }
}
