import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { StatCardsComponent } from '../../../shared/components/stat-cards/stat-cards.component';
import { TableColumnModel } from '../../../shared/components/stat-cards/models/table-option';

@Component({
  selector: 'app-advisor-history',
  standalone: true,
  imports: [StatCardsComponent, CommonModule, HttpClientModule, FormsModule],
  templateUrl: './advisor-history.html',
  styleUrl: './advisor-history.css',
})
export class AdvisorHistoryComponent implements OnInit {
  isModalOpen = false;
  selectedStudent: any = null;

  public students: any[] = [];
  public filteredStudents: any[] = [];

  // 1. ตัวแปรสำหรับการค้นหาและคัดกรองข้อมูล
  public searchText: string = '';
  public selectedMajor: string = ''; // เก็บค่าชื่อหลักสูตรที่เลือก (ถ้าว่างแปลว่าทั้งหมด)
  public selectedYear: number | string = ''; // เก็บชั้นปีที่เลือก 1, 2, 3, 4 (ถ้าว่างแปลว่าทุกชั้นปี)

  // 2. ตัวแปรสำหรับควบคุมการแสดงผลของ Custom Dropdown
  public isMajorDropdownOpen: boolean = false;
  public isYearDropdownOpen: boolean = false;
  public uniqueMajors: string[] = []; // เก็บรายชื่อวิชาเอก/ภาควิชาที่ไม่ซ้ำกันที่ดึงจากหลังบ้าน

  public currentPage: number = 1;
  public pageSize: number = 5;

  public myStats: any[] = [
    {
      label: 'นักศึกษาทั้งหมด',
      value: 0,
      icon: 'group',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      cardBg: 'bg-[#F3FBFF]',
    },
  ];

  private statColorPresets = [
    { bgColor: 'bg-green-100', textColor: 'text-green-600', cardBg: 'bg-[#F5FFFA]' },
    { bgColor: 'bg-yellow-100', textColor: 'text-yellow-600', cardBg: 'bg-[#FFF9E5]' },
    { bgColor: 'bg-purple-100', textColor: 'text-purple-600', cardBg: 'bg-[#FAF5FF]' },
    { bgColor: 'bg-pink-100', textColor: 'text-pink-600', cardBg: 'bg-[#FFF5F8]' },
    { bgColor: 'bg-orange-100', textColor: 'text-orange-600', cardBg: 'bg-[#FFF6EE]' },
  ];

  public columns: TableColumnModel[] = [
    {
      columnDef: 'profile',
      header: 'โปรไฟล์',
      tag: 'image',
      align: 'center',
      display: true,
      width: 'small',
      cell: (el) => (el.image ? `http://localhost:8080/api/${el.image}` : null),
    },
    {
      columnDef: 'student_code',
      header: 'รหัสนักศึกษา',
      tag: 'text',
      align: 'center',
      display: true,
      width: 'medium',
      cell: (el) => el.student_code,
    },
    {
      columnDef: 'name',
      header: 'ชื่อ-นามสกุล',
      tag: 'text',
      display: true,
      width: 'large',
      cell: (el) => el.full_name || '-',
    },
    {
      columnDef: 'department',
      header: 'สาขา',
      tag: 'text',
      align: 'center',
      display: true,
      width: 'medium',
      cell: (el) => el.department || el.major || '-',
    },
    {
      columnDef: 'advisor',
      header: 'ที่ปรึกษาปัจจุบัน',
      tag: 'text',
      align: 'center',
      display: true,
      width: 'large',
      cell: (el) => el.advisor_name || 'ยังไม่มีที่ปรึกษา',
    },
    {
      columnDef: 'view',
      header: 'ดูประวัติ',
      tag: 'icon',
      align: 'center',
      display: true,
      width: 'small',
      cell: (el) => 'visibility',
    },
  ];

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadAllStudents();
  }

  loadAllStudents() {
    this.http.get<any[]>('http://localhost:8080/api/get_all_students.php').subscribe({
      next: (data) => {
        this.students = data;

        // 3. ดึงรายชื่อภาควิชา/หลักสูตรที่มีในฐานข้อมูลแบบไม่ซ้ำกันมาใส่ในเมนูอัตโนมัติ
        const rawMajors = data.map((s) => s.department || s.major);
        this.uniqueMajors = [...new Set(rawMajors)].filter((m) => m != null && m !== '');

        this.buildStatCards();
        this.currentPage = 1;
        this.calculateStats();
        this.filterStudents();
      },
      error: (err) => {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลนักศึกษา:', err);
      },
    });
  }

  // 4. ฟังก์ชันสำหรับควบคุม เปิด-ปิด กล่องเลือกเงื่อนไข คัดกรอง
  toggleMajorDropdown() {
    this.isMajorDropdownOpen = !this.isMajorDropdownOpen;
    this.isYearDropdownOpen = false; // ปิดอีกอันไว้เพื่อไม่ให้ทับกัน
  }

  toggleYearDropdown() {
    this.isYearDropdownOpen = !this.isYearDropdownOpen;
    this.isMajorDropdownOpen = false; // ปิดอีกอันไว้เพื่อไม่ให้ทับกัน
  }

  // 5. ฟังก์ชันทำงานเมื่อมีการคลิกเลือกไอเทมย่อย
  selectMajor(major: string) {
    this.selectedMajor = major;
    this.isMajorDropdownOpen = false; // เลือกเสร็จให้หุบเมนูขึ้นไป
    this.currentPage = 1; // รีเซ็ตกลับไปหน้า 1 เสมอเมื่อมีการเปลี่ยนเงื่อนไขการกรอง
    this.filterStudents(); // สั่งรีเฟรชข้อมูลตารางตามเงื่อนไขใหม่
  }

  selectYear(year: number | string) {
    this.selectedYear = year;
    this.currentPage = 1; // รีเซ็ตกลับไปหน้า 1 เสมอเมื่อมีการเปลี่ยนเงื่อนไขการกรอง
    this.isYearDropdownOpen = false; // เลือกเสร็จให้หุบเมนูขึ้นไป
    this.filterStudents(); // สั่งรีเฟรชข้อมูลตารางตามเงื่อนไขใหม่
  }

  // 6. แกนกลางการประมวลผล Multi-Filter (ค้นหา + หลักสูตร + ชั้นปี)
  filterStudents() {
    let result = [...this.students];

    // เงื่อนไขที่ 1: กรองคำค้นหา
    if (this.searchText.trim()) {
      const txt = this.searchText.toLowerCase();
      result = result.filter(
        (s) =>
          (s.full_name && s.full_name.toLowerCase().includes(txt)) ||
          (s.student_code && s.student_code.includes(txt)) ||
          (s.department && s.department.toLowerCase().includes(txt)) ||
          (s.major && s.major.toLowerCase().includes(txt)),
      );
    }

    // เงื่อนไขที่ 2: กรอง Custom Dropdown หลักสูตร
    if (this.selectedMajor) {
      result = result.filter(
        (s) => s.department === this.selectedMajor || s.major === this.selectedMajor,
      );
    }

    // เงื่อนไขที่ 3: กรอง Custom Dropdown ชั้นปี
    if (this.selectedYear) {
      result = result.filter((s) => {
        const targetYearStr = String(this.selectedYear); // แปลงเลข 1, 2, 3, 4 เป็นสตริงไว้เทียบเคียง
        return (
          (s.displayYear && s.displayYear.includes(targetYearStr)) ||
          (s.student_code && s.student_code.startsWith(targetYearStr)) ||
          (s.year && String(s.year).includes(targetYearStr))
        );
      });
    }

    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.filteredStudents = result.slice(startIndex, startIndex + this.pageSize);
    this.cdr.detectChanges(); // สั่งวาด UI ตารางอัปเดตข้อมูลใหม่แบบทันที
  }
  get totalPages(): number {
    let result = [...this.students];

    if (this.searchText.trim()) {
      const txt = this.searchText.toLowerCase();
      result = result.filter(
        (s) =>
          (s.full_name && s.full_name.toLowerCase().includes(txt)) ||
          (s.student_code && s.student_code.includes(txt)),
      );
    }
    if (this.selectedMajor) {
      result = result.filter(
        (s) => s.department === this.selectedMajor || s.major === this.selectedMajor,
      );
    }
    if (this.selectedYear) {
      result = result.filter((s) => {
        const targetYearStr = String(this.selectedYear);
        return (
          (s.displayYear && s.displayYear.includes(targetYearStr)) ||
          (s.student_code && s.student_code.startsWith(targetYearStr)) ||
          (s.year && String(s.year).includes(targetYearStr))
        );
      });
    }

    return Math.ceil(result.length / this.pageSize) || 1;
  }

  // 💡 [เพิ่มใหม่] ฟังก์ชันสำหรับจังหวะกดเปลี่ยนหน้า
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.filterStudents(); // สั่งตัดข้อมูลชุดใหม่ตามหน้าปัจจุบัน
    }
  }

  buildStatCards() {
    const totalCard = this.myStats[0];

    const majorCards = this.uniqueMajors.map((major, index) => {
      const preset = this.statColorPresets[index % this.statColorPresets.length];
      return {
        label: major,
        value: 0,
        icon: 'school',
        ...preset,
      };
    });

    this.myStats = [totalCard, ...majorCards];
  }

  calculateStats() {
    const total = this.students.length;
    this.myStats[0].value = total;

    for (let i = 1; i < this.myStats.length; i++) {
      const majorLabel = this.myStats[i].label;
      this.myStats[i].value = this.students.filter(
        (s) => (s.department || s.major) === majorLabel,
      ).length;
    }
  }

  openHistory(student: any) {
    // 1. ล้างประวัติเก่าออกก่อนป้องกันข้อมูลปนกัน และเปิด Modal มารอทันที
    this.selectedStudent = { ...student, history: [] };
    this.isModalOpen = true;
    this.cdr.detectChanges(); // สั่งให้รีเรนเดอร์เปิดหน้าต่าง Modal มารอ (อาจจะขึ้น Loading สวยๆ ไว้)

    this.http
      .get<
        any[]
      >(`http://localhost:8080/api/get_advisor_history.php?student_id=${student.student_id}`)
      .subscribe({
        next: (historyData) => {
          const colorPresets = [
            { bg: 'bg-[#E8F5E9]', text: 'text-[#4CAF50]' },
            { bg: 'bg-[#E3F2FD]', text: 'text-[#2196F3]' },
            { bg: 'bg-[#F3E5F5]', text: 'text-[#9C27B0]' },
          ];

          // 2. เมื่อข้อมูลมาถึง ค่อยยัด history ใส่เข้าไป
          this.selectedStudent.history = historyData.map((item, index) => ({
            ...item,
            color: colorPresets[index % colorPresets.length].bg,
            textColor: colorPresets[index % colorPresets.length].text,
          }));

          this.cdr.detectChanges(); // อัปเดตข้อมูลประวัติลงใน Modal ทันที
        },
        error: (err) => {
          console.error('เกิดข้อผิดพลาดในการดึงประวัติอาจารย์ที่ปรึกษา:', err);
          this.selectedStudent.history = [];
          this.cdr.detectChanges();
        },
      });
  }

  // 🌟 แยกรายชื่ออาจารย์ (advisor_name เป็น string คั่นด้วย ", " จาก GROUP_CONCAT) ให้เป็น array แสดงคนละบรรทัด
  advisorNames(h: any): string[] {
    const raw = (h?.advisor_name || '').trim();
    if (!raw) return ['-'];
    return raw
      .split(',')
      .map((n: string) => n.trim())
      .filter((n: string) => n);
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedStudent = null;
    this.cdr.detectChanges();
  }
}
