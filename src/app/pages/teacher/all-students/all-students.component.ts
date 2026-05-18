import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-all-students',
  standalone: true,
  imports: [],
  templateUrl: './all-students.component.html',
  styleUrl: './all-students.component.css',
})
export class AllStudentsComponent implements OnInit {
  private http = inject(HttpClient); // Inject HTTP สำหรับยิง API ไป XAMPP

  // --- 1. ตั้งค่าระบบ Pagination ---
  currentPage = signal(1);
  itemsPerPage = 7; // กำหนดให้แสดงหน้าละ 7 คน

  // --- 2. รอรับข้อมูลนักศึกษาจากฐานข้อมูล (ลบ Mock ออกแล้ว) ---
  studentsInCare = signal<any[]>([]);

  // --- 3. คำนวณข้อมูลสำหรับ Pagination ---
  totalItems = computed(() => this.studentsInCare().length);
  totalPages = computed(() => Math.ceil(this.totalItems() / this.itemsPerPage));

  // ดึงข้อมูลมาแสดงเฉพาะหน้าที่เลือก
  paginatedStudents = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return this.studentsInCare().slice(start, start + this.itemsPerPage);
  });

  // สร้าง Array ของเลขหน้า เช่น [1, 2, 3]
  pageNumbers = computed(() => {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  });

  // --- 4. ฟังก์ชันสำหรับกดปุ่มเปลี่ยนหน้า ---
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

  // --- 5. ดึงข้อมูลจริงจาก Database ตอนเปิดหน้าเว็บ ---
  ngOnInit() {
    // ยิง API ไปดึงข้อมูลเด็กในการดูแลของอาจารย์ (ส่ง advisor_id = 14)
    this.http.get<any[]>(`${environment.apiUrl}/get_advisor_students.php?advisor_id=14`).subscribe({
      next: (data) => {
        // จับคู่ข้อมูลจากฐานข้อมูล ให้ตรงกับตัวแปรที่ HTML ต้องการ
        const formattedStudents = data.map((student: any) => ({
          id: student.student_code,
          name: student.full_name,
          email: student.email ? student.email : 'ไม่มีอีเมล',
          year: `ปี ${student.year}`,
          gpa: student.gpa,

          // 👉 ดึงของจริงมาใช้แล้ว! เอาผลรวมที่ได้มาต่อด้วย /127
          credits: `${student.total_credits}/127`,

          ploStatus: student.ploStatus.replace('PLO ', ''),
          img: student.image
            ? `${environment.apiUrl}/${student.image}`
            : `https://i.pravatar.cc/150?u=${student.student_code}`,
        }));

        // อัปเดตข้อมูลนักศึกษาทั้งหมดลงใน Signal ซึ่งจะทำให้ตารางและ Pagination ทำงานอัตโนมัติ
        this.studentsInCare.set(formattedStudents);
      },
      error: (error) => {
        console.error('ไม่สามารถดึงข้อมูลนักศึกษาได้:', error.message);
      },
    });
  }
}
