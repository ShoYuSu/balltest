import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'app-all-students',
  standalone: true,
  imports: [],
  templateUrl: './all-students.component.html',
  styleUrl: './all-students.component.css',
})
export class AllStudentsComponent {
  // --- 1. ตั้งค่าระบบ Pagination ---
  currentPage = signal(1);
  itemsPerPage = 7; // กำหนดให้แสดงหน้าละ 7 คน

  // --- 2. ข้อมูลนักศึกษา (เพิ่มเป็น 15 คน เพื่อให้เทสเปลี่ยนหน้าได้) ---
  studentsInCare = signal([
    { id: '6801234567', name: 'นายธนกฤต ศิริวัฒนากุล', email: 'somying@gmail.com', year: 'ปี 1', gpa: 3.78, credits: '9/127', ploStatus: 'ผ่าน', img: 'https://i.pravatar.cc/150?u=1' },
    { id: '6801234568', name: 'นางสาวแพรว รัตนโชติอนันต์', email: 'praewpan.r@university.ac.th', year: 'ปี 1', gpa: 3.78, credits: '18/127', ploStatus: 'ผ่าน', img: 'https://i.pravatar.cc/150?u=2' },
    { id: '6801234569', name: 'นางสาววุวาวิน วาวิวัา', email: 'jirapat.m@university.ac.th', year: 'ปี 1', gpa: 3.78, credits: '21/127', ploStatus: 'ผ่าน', img: 'https://i.pravatar.cc/150?u=3' },
    { id: '6801234570', name: 'นางสาววรินดา เตชะวนิช', email: 'warinda.t@university.ac.th', year: 'ปี 1', gpa: 3.78, credits: '9/127', ploStatus: 'ผ่าน', img: 'https://i.pravatar.cc/150?u=4' },
    { id: '6801234471', name: 'นายอัครพล สุวรรณเมธานนท์', email: 'akkarapol.s@university.ac.th', year: 'ปี 1', gpa: 3.78, credits: '24/127', ploStatus: 'ผ่าน', img: 'https://i.pravatar.cc/150?u=5' },
    { id: '6801234571', name: 'นางสาวชลดา พิพัฒน์ไพศาล', email: 'cholada.p@university.ac.th', year: 'ปี 1', gpa: 3.78, credits: '18/127', ploStatus: 'ผ่าน', img: 'https://i.pravatar.cc/150?u=6' },
    { id: '6801234573', name: 'นายปิยบุตร เลิศวรจักร', email: 'piyabut.l@university.ac.th', year: 'ปี 1', gpa: 3.78, credits: '9/127', ploStatus: 'ผ่าน', img: 'https://i.pravatar.cc/150?u=7' },
    { id: '6801234574', name: 'นางสาวกมลวรรณ ใจดี', email: 'kamonwan.j@university.ac.th', year: 'ปี 1', gpa: 3.50, credits: '21/127', ploStatus: 'รอประเมิน', img: 'https://i.pravatar.cc/150?u=8' },
    { id: '6801234575', name: 'นายสมปอง น้องสมชาย', email: 'sompong.n@university.ac.th', year: 'ปี 1', gpa: 2.80, credits: '18/127', ploStatus: 'ไม่ผ่าน', img: 'https://i.pravatar.cc/150?u=9' },
    { id: '6801234576', name: 'นางสาวสุดสวย รักเรียน', email: 'sudsauy.r@university.ac.th', year: 'ปี 1', gpa: 4.00, credits: '24/127', ploStatus: 'ผ่าน', img: 'https://i.pravatar.cc/150?u=10' },
    { id: '6801234577', name: 'นายมานะ อดทน', email: 'mana.a@university.ac.th', year: 'ปี 1', gpa: 3.10, credits: '15/127', ploStatus: 'รอประเมิน', img: 'https://i.pravatar.cc/150?u=11' },
    { id: '6801234578', name: 'นางสาวปิติ ยินดี', email: 'piti.y@university.ac.th', year: 'ปี 1', gpa: 3.90, credits: '21/127', ploStatus: 'ผ่าน', img: 'https://i.pravatar.cc/150?u=12' },
    { id: '6801234579', name: 'นายวีระ ชูชาติ', email: 'weera.c@university.ac.th', year: 'ปี 1', gpa: 2.50, credits: '9/127', ploStatus: 'ไม่ผ่าน', img: 'https://i.pravatar.cc/150?u=13' },
    { id: '6801234580', name: 'นางสาวดวงใจ บริสุทธิ์', email: 'duangjai.b@university.ac.th', year: 'ปี 1', gpa: 3.65, credits: '18/127', ploStatus: 'ผ่าน', img: 'https://i.pravatar.cc/150?u=14' },
    { id: '6801234581', name: 'นายสมชาย ใจงาม', email: 'somchai.j@university.ac.th', year: 'ปี 1', gpa: 3.25, credits: '15/127', ploStatus: 'รอประเมิน', img: 'https://i.pravatar.cc/150?u=15' }
  ]);

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
      this.currentPage.update(p => p + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }
}
