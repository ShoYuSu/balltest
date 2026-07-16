import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import Swal from 'sweetalert2';
import { TableColumnModel } from '../../../shared/components/stat-cards/models/table-option';

@Component({
  standalone: true,
  selector: 'app-assign-advisor',
  imports: [CommonModule, FormsModule],
  templateUrl: './assign-advisor.html',
})
export class AssignAdvisorComponent implements OnInit {
  
  // ข้อมูลหลักจาก API
  major: string[] = ['ทุกสาขา']; 
  advisors: any[] = [];
  students: any[] = [];

  // ตัวแปรควบคุมฝั่งกรองข้อมูลอาจารย์
  departments: string[] = [];          // เก็บรายชื่อภาควิชาของอาจารย์
  filteredAdvisors: any[] = [];       // รายชื่ออาจารย์ที่ผ่านการกรองแล้วเพื่อนำไปลูปแสดงผลบน UI
  selectedDept: string = 'ทุกภาควิชา'; // สเตตัสภาควิชาที่เลือก
  searchAdvisorText: string = '';     // ข้อความค้นหาฝั่งอาจารย์
  isDeptDropdownOpen = false;         // สเตตัส เปิด/ปิด Dropdown ภาควิชาอาจารย์

  // ตัวแปรควบคุมหน้าจอฝั่งนักศึกษาและ Modal (คงเดิม)
  selectedAdvisors: any[] = [];
  selectedBranch: string = 'ทุกสาขา';
  searchStudentText: string = '';
  filteredStudents: any[] = [];
  selectedStudents: number[] = [];
  isBranchDropdownOpen = false;

  // ตัวแปรควบคุม Dropdown filter ชั้นปี (ฝั่งเลือกกลุ่มนักศึกษา)
  years: (number | string)[] = ['ทุกชั้นปี'];
  selectedYear: number | string = 'ทุกชั้นปี';
  isYearDropdownOpen = false;
  showDeleteModal = false;
  targetToDelete: any = null;

  // ตัวแปรควบคุม Dropdown ปีการศึกษา (แทนที่ dropdown ภาคเรียนเดิม)
  readonly currentAcademicYear = new Date().getFullYear() + 543;
  selectedAcademicYear: number = this.currentAcademicYear;
  isAcademicYearDropdownOpen = false;

  // ปีการศึกษาที่เลือกได้ = ปีที่มีข้อมูลจริงจากประวัติการจัดสรร รวมกับปีปัจจุบัน/ปีถัดไปเสมอ
  // (กันเคสปีเก่าที่เคยมอบหมายไว้แล้วไม่เคยเปลี่ยนอาจารย์เลย ให้ยังโผล่ในตัวเลือกได้)
  get academicYears(): number[] {
    const fromHistory = this.assignedList
      .map(r => Number(r.academic_year))
      .filter(y => Number.isFinite(y) && y > 0);
    const years = new Set<number>([...fromHistory, this.currentAcademicYear, this.currentAcademicYear + 1]);
    return [...years].sort((a, b) => b - a);
  }

  // 💡 เพิ่มตัวแปรสำหรับควบคุม "ตารางดูประวัติ" และ "Modal เปลี่ยนอาจารย์"
  assignedList: any[] = [];             // รายชื่อนักศึกษาที่จัดสรรอาจารย์แล้วทั้งหมด
  filteredAssignedList: any[] = [];     // รายชื่อนักศึกษาที่จัดสรรแล้วหลังจากผ่านตัวกรองค้นหา
  searchAssignedText: string = '';      // ข้อความค้นหาในตารางจัดสรรแล้ว
  showChangeModal: boolean = false;     // ควบคุมการเปิด/ปิด Modal เปลี่ยนอาจารย์รายบุคคล
  targetStudentToChange: any = null;    // เก็บข้อมูลนักศึกษาแถวที่เลือกมาเปลี่ยนอาจารย์
  newSelectedAdvisorIds: number[] = []; // เก็บ ID อาจารย์ชุดใหม่ที่เลือกใน Modal

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}
  public columns: TableColumnModel[] = [
  {
    columnDef: 'student_code',
    header: 'รหัสนักศึกษา',
    tag: 'text',
    display: true,
    cell: (el) => el.student_code,
  },
  {
    columnDef: 'student_name',
    header: 'ชื่อ-นามสกุล',
    tag: 'text',
    display: true,
    cell: (el) => el.student_name,
  },
  {
    columnDef: 'major',
    header: 'สาขาวิชา',
    tag: 'text',
    display: true,
    cell: (el) => el.major,
  },
  {
    columnDef: 'term',
    header: 'เทอม/ปีการศึกษา',
    tag: 'badge',
    display: true,
    cell: (el) => `${el.semester}/${el.academic_year}`,
  },
  {
    columnDef: 'advisors',
    header: 'อาจารย์ที่ปรึกษาปัจจุบัน',
    tag: 'advisors',
    display: true,
    cell: (el) => el.advisors,
  },
  {
    columnDef: 'actions',
    header: 'การจัดการ',
    tag: 'action',
    display: true,
    align: 'center',
    cell: (el) => el,
  },
];

  ngOnInit() {
    this.loadDataFromDatabase();
  }
  private processImageData(item: any, isAdvisor: boolean = true): any {
  // สร้างฟังก์ชันช่วยจัดการ URL
  const getUrl = (path: string | null) => {
    if (!path || path === 'null' || path === '') return null;
    if (path.startsWith('http')) return path;
    return `http://localhost:8080/api/${path.startsWith('/') ? path.substring(1) : path}`;
  };

  return {
    ...item,
    image: getUrl(item.image) // แปลงรูปให้เป็น URL ที่ถูกต้อง
  };
}

  // ================= 1. โหลดข้อมูลจาก API =================
 loadDataFromDatabase() {
  this.http.get<any>(`${environment.apiUrl}/assign_advisor.php`).subscribe({
    next: (res) => {
      if (res.success) {
        // Map ข้อมูลผ่าน processImageData
        this.advisors = (res.advisors || []).map((a: any) => this.processImageData(a));
        this.students = (res.students || []).map((s: any) => this.processImageData(s)); // ถ้า นศ. ไม่มีรูป
        this.assignedList = (res.assigned_data || []).map((row: any) => ({
          ...row,
          advisors: row.advisors.map((a: any) => this.processImageData(a))
        }));
        
        this.departments = res.staff_departments || [];
        this.major = ['ทุกสาขา', ...(res.student_majors || []).filter((d: any) => d != null)];

        // สร้างรายการชั้นปีจากข้อมูลนักศึกษาจริง (ไม่ hardcode)
        const uniqueYears = [...new Set(this.students.map((s: any) => s.year).filter((y: any) => y != null))]
          .sort((a: any, b: any) => a - b);
        this.years = ['ทุกชั้นปี', ...uniqueYears];

        this.filterAdvisors();
        this.filterStudents();
        this.filterAssignedList();
        this.cdr.detectChanges();
      }
    }
  });
}

  // ================= 2. ระบบจัดการ/กรองข้อมูลฝั่งอาจารย์ =================
  toggleDeptDropdown() {
    this.isDeptDropdownOpen = !this.isDeptDropdownOpen;
    if (this.isDeptDropdownOpen) {
      this.isBranchDropdownOpen = false;
      this.isYearDropdownOpen = false;
      this.isAcademicYearDropdownOpen = false;
    }
  }

  selectDept(dept: string) {
    this.selectedDept = dept;
    this.isDeptDropdownOpen = false;
    this.filterAdvisors();
  }

  filterAdvisors() {
    let result = this.advisors;

    if (this.selectedDept !== 'ทุกภาควิชา') {
      result = result.filter(a => a.dept === this.selectedDept);
    }

    if (this.searchAdvisorText.trim() !== '') {
      const txt = this.searchAdvisorText.toLowerCase().trim();
      result = result.filter(a => 
        (a.name && a.name.toLowerCase().includes(txt)) || 
        (a.code && a.code.toLowerCase().includes(txt))
      );
    }

    this.filteredAdvisors = result;
    this.cdr.detectChanges();
  }

  // ================= 3. ระบบกรองนักศึกษา =================
  toggleBranchDropdown() {
    this.isBranchDropdownOpen = !this.isBranchDropdownOpen;
    if (this.isBranchDropdownOpen) {
      this.isDeptDropdownOpen = false;
      this.isYearDropdownOpen = false;
      this.isAcademicYearDropdownOpen = false;
    }
  }

  selectBranch(branch: string) {
    this.selectedBranch = branch;
    this.isBranchDropdownOpen = false;
    this.filterStudents();
  }

  // ================= 3.1 ระบบกรองชั้นปี (ฝั่งเลือกกลุ่มนักศึกษา) =================
  toggleYearDropdown() {
    this.isYearDropdownOpen = !this.isYearDropdownOpen;
    if (this.isYearDropdownOpen) {
      this.isBranchDropdownOpen = false;
      this.isDeptDropdownOpen = false;
      this.isAcademicYearDropdownOpen = false;
    }
  }

  selectYear(year: number | string) {
    this.selectedYear = year;
    this.isYearDropdownOpen = false;
    this.filterStudents();
  }

  filterStudents() {
    let result = this.students;
    if (this.selectedBranch !== 'ทุกสาขา') {
      result = result.filter(s => s.major === this.selectedBranch);
    }
    if (this.selectedYear !== 'ทุกชั้นปี') {
      result = result.filter(s => Number(s.year) === Number(this.selectedYear));
    }
    if (this.searchStudentText.trim() !== '') {
      const txt = this.searchStudentText.toLowerCase();
      result = result.filter(s =>
        (s.name && s.name.toLowerCase().includes(txt)) ||
        (s.code && s.code.includes(txt))
      );
    }
    this.filteredStudents = result;
    this.cdr.detectChanges();
  }

  // ================= 3.5 ระบบจัดการเทอม =================
  toggleAcademicYearDropdown() {
    this.isAcademicYearDropdownOpen = !this.isAcademicYearDropdownOpen;
    if (this.isAcademicYearDropdownOpen) {
      this.isDeptDropdownOpen = false;
      this.isBranchDropdownOpen = false;
      this.isYearDropdownOpen = false;
    }
  }

  selectAcademicYear(year: number) {
    this.selectedAcademicYear = year;
    this.isAcademicYearDropdownOpen = false;
    this.cdr.detectChanges();
  }

  // ================= 4. ระบบจัดการอาจารย์ =================
  toggleAdvisor(advisor: any) {
    const targetId = Number(advisor.id);
    const index = this.selectedAdvisors.findIndex(a => Number(a.id) === targetId);
    
    if (index !== -1) {
      this.selectedAdvisors.splice(index, 1);
    } else {
      if (this.selectedAdvisors.length >= 2) {
        Swal.fire({
          icon: 'warning',
          title: 'เลือกอาจารย์เกินกำหนด',
          text: 'คุณสามารถเลือกอาจารย์ที่ปรึกษาได้สูงสุด 2 ท่านต่อกลุ่มนักศึกษาเท่านั้นครับ',
          confirmButtonColor: '#6366f1',
          confirmButtonText: 'รับทราบ',
          customClass: { popup: 'rounded-3xl' }
        });
        return;
      }
      
      const isDuplicate = this.selectedAdvisors.some(a => Number(a.id) === targetId);
      if (isDuplicate) {
        Swal.fire({
          icon: 'error',
          title: 'อาจารย์ท่านนี้ถูกเลือกแล้ว',
          text: 'ไม่สามารถเลือกอาจารย์ท่านเดิมซ้ำในกลุ่มเดียวกันได้ครับ',
          confirmButtonColor: '#ef4444',
          confirmButtonText: 'ตกลง',
          customClass: { popup: 'rounded-3xl' }
        });
        return;
      }

      this.selectedAdvisors.push(advisor);
    }
    this.cdr.detectChanges(); 
  }

  isAdvisorSelected(advisorId: number): boolean {
    return this.selectedAdvisors.some(a => a.id === advisorId);
  }

  // ================= 5. ระบบจัดการนักศึกษา =================
  toggleStudent(studentId: number) {
    const index = this.selectedStudents.indexOf(studentId);
    if (index !== -1) {
      this.selectedStudents.splice(index, 1);
    } else {
      this.selectedStudents.push(studentId);
    }
    this.cdr.detectChanges();
  }

  toggleAllStudents(event: any) {
    const isChecked = event.target.checked;
    if (isChecked) {
      const allIds = this.filteredStudents.map(s => s.id);
      this.selectedStudents = [...new Set([...this.selectedStudents, ...allIds])];
    } else {
      const currentIds = this.filteredStudents.map(s => s.id);
      this.selectedStudents = this.selectedStudents.filter(id => !currentIds.includes(id));
    }
    this.cdr.detectChanges();
  }

  isAllStudentsSelected(): boolean {
    if (this.filteredStudents.length === 0) return false;
    return this.filteredStudents.every(s => this.selectedStudents.includes(s.id));
  }

  // ================= 6. บันทึกข้อมูลแบบกลุ่ม (เดิม) =================
  saveAssignments() {
    if (this.selectedAdvisors.length === 0 || this.selectedStudents.length === 0) {
      return;
    }

    const payload = {
      advisor_ids: this.selectedAdvisors.map(a => a.id),
      student_ids: this.selectedStudents,
      year: this.selectedAcademicYear
    };

    this.http.post<any>(`${environment.apiUrl}/assign_advisor.php`, payload).subscribe({
      next: (res) => {
        if (res.success) {
          Swal.fire({
            icon: 'success',
            title: 'กำหนดที่ปรึกษาสำเร็จ!',
            text: res.message || 'ระบบได้บันทึกรายชื่ออาจารย์ที่ปรึกษาเข้าสู่ระบบเรียบร้อย',
            confirmButtonColor: '#6366f1',
            confirmButtonText: 'ตกลง',
            timer: 2000,
            timerProgressBar: true,
            customClass: { popup: 'rounded-3xl' }
          });
          
          this.selectedAdvisors = [];
          this.selectedStudents = [];
          this.loadDataFromDatabase(); 
          this.cdr.detectChanges();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: res.message,
            confirmButtonColor: '#ef4444',
            customClass: { popup: 'rounded-3xl' }
          });
        }
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'เครือข่ายขัดข้อง',
          text: 'ไม่สามารถบันทึกข้อมูลได้ เนื่องจากระบบตรวจพบปัญหาเครือข่าย',
          confirmButtonColor: '#ef4444',
          customClass: { popup: 'rounded-3xl' }
        });
      }
    });
  }
  // เพิ่มในคลาส AssignAdvisorComponent
deleteAssignment(row: any) {
  Swal.fire({
    title: 'ยืนยันการลบ?',
    text: `คุณต้องการลบข้อมูลการจัดสรรอาจารย์ของ ${row.student_name} ใช่หรือไม่?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#94a3b8',
    confirmButtonText: 'ลบข้อมูล',
    cancelButtonText: 'ยกเลิก',
    customClass: { popup: 'rounded-3xl' }
  }).then((result) => {
    if (result.isConfirmed) {
      // ส่ง Action 'delete_assignment' ไปที่ PHP
      this.http.post<any>(`${environment.apiUrl}/assign_advisor.php`, {
        action: 'delete_assignment',
        student_id: row.student_id
      }).subscribe({
        next: (res) => {
          if (res.success) {
            Swal.fire({ icon: 'success', title: 'ลบสำเร็จ', text: 'ข้อมูลถูกลบเรียบร้อยแล้ว', timer: 1500, confirmButtonColor: '#6366f1' });
            this.loadDataFromDatabase(); // โหลดข้อมูลใหม่
          }
        }
      });
    }
  });
}

  executeDelete() {
    this.showDeleteModal = false;
  }

  // ================= 💡 7. ระบบจัดการตารางดูและเปลี่ยนอาจารย์ที่ปรึกษา (เพิ่มเติม) =================
  
  // ระบบกรองและค้นหาข้อมูลในตารางผู้ที่จัดสรรที่ปรึกษาแล้ว
  filterAssignedList() {
    if (this.searchAssignedText.trim() === '') {
      this.filteredAssignedList = this.assignedList;
    } else {
      const txt = this.searchAssignedText.toLowerCase().trim();
      this.filteredAssignedList = this.assignedList.filter(row => {
        const matchStudent = (row.student_name && row.student_name.toLowerCase().includes(txt)) || 
                             (row.student_code && row.student_code.includes(txt)) ||
                             (row.major && row.major.toLowerCase().includes(txt));
        const matchAdvisor = row.advisors && row.advisors.some((a: any) => a.name.toLowerCase().includes(txt));
        return matchStudent || matchAdvisor;
      });
    }
    this.cdr.detectChanges();
  }

  // ฟังก์ชันคลิกปุ่มเพื่อเปิด Modal เปลี่ยนแปลงข้อมูลอาจารย์รายบุคคล
  openChangeAdvisorModal(row: any) {
    this.targetStudentToChange = row;
    // เอา ID อาจารย์ชุดเดิมในปัจจุบันของนศ.คนนี้มาติ๊กถูกเลือกใน Modal ไว้รอ
    this.newSelectedAdvisorIds = row.advisors ? row.advisors.map((a: any) => Number(a.id)) : [];
    this.showChangeModal = true;
    this.cdr.detectChanges();
  }

  // จัดการติ๊กเลือกเข้า/ออก ของรายชื่ออาจารย์ชุดใหม่ในหน้าต่าง Modal
  toggleNewAdvisorSelection(advisorId: number) {
    const idx = this.newSelectedAdvisorIds.indexOf(advisorId);
    if (idx !== -1) {
      this.newSelectedAdvisorIds.splice(idx, 1);
    } else {
      if (this.newSelectedAdvisorIds.length >= 2) {
        Swal.fire({
          icon: 'warning',
          title: 'เกินกำหนดตัวเลือก',
          text: 'คุณสามารถเลือกอาจารย์ที่ปรึกษาใหม่ได้สูงสุด 2 ท่านเท่านั้นครับ',
          confirmButtonColor: '#6366f1',
          customClass: { popup: 'rounded-3xl' }
        });
        return;
      }
      this.newSelectedAdvisorIds.push(advisorId);
    }
    this.cdr.detectChanges();
  }

  // ส่งข้อมูล Payload ไปที่ PHP เพื่อทำการอัปเดตเปลี่ยนแปลงอาจารย์ที่ปรึกษาใหม่
  submitChangeAdvisor() {
    if (!this.targetStudentToChange || this.newSelectedAdvisorIds.length === 0) return;

    const payload = {
      action: 'change_advisor', // คีย์สำหรับส่งไปบอกหลังบ้านแยกแยะงาน
      student_id: this.targetStudentToChange.student_id,
      academic_year: this.targetStudentToChange.academic_year,
      semester: this.targetStudentToChange.semester,
      new_advisor_ids: this.newSelectedAdvisorIds
    };

    this.http.post<any>(`${environment.apiUrl}/assign_advisor.php`, payload).subscribe({
      next: (res) => {
        if (res.success) {
          Swal.fire({
            icon: 'success',
            title: 'เปลี่ยนอาจารย์สำเร็จ!',
            text: res.message || 'ระบบได้บันทึกการเปลี่ยนอาจารย์ที่ปรึกษาท่านใหม่เรียบร้อย',
            confirmButtonColor: '#6366f1',
            timer: 2000,
            customClass: { popup: 'rounded-3xl' }
          });
          this.showChangeModal = false;
          this.loadDataFromDatabase(); // สั่งรีโหลดอัปเดตข้อมูลขึ้นหน้าจอใหม่ทั้งหมด
        } else {
          Swal.fire({ 
            icon: 'error', 
            title: 'เกิดข้อผิดพลาด', 
            text: res.message, 
            confirmButtonColor: '#ef4444',
            customClass: { popup: 'rounded-3xl' }
          });
        }
      },
      error: (err) => {
        Swal.fire({ 
          icon: 'error', 
          title: 'เครือข่ายขัดข้อง', 
          text: 'ไม่สามารถปรับปรุงข้อมูลได้', 
          confirmButtonColor: '#ef4444',
          customClass: { popup: 'rounded-3xl' }
        });
      }
    });
  }
}