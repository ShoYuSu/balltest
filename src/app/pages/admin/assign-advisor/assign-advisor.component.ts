import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import Swal from 'sweetalert2';

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
  showDeleteModal = false;
  targetToDelete: any = null;
  selectedSemester: number = 1;
  isSemesterDropdownOpen = false;

  // 💡 เพิ่มตัวแปรสำหรับควบคุม "ตารางดูประวัติ" และ "Modal เปลี่ยนอาจารย์"
  assignedList: any[] = [];             // รายชื่อนักศึกษาที่จัดสรรอาจารย์แล้วทั้งหมด
  filteredAssignedList: any[] = [];     // รายชื่อนักศึกษาที่จัดสรรแล้วหลังจากผ่านตัวกรองค้นหา
  searchAssignedText: string = '';      // ข้อความค้นหาในตารางจัดสรรแล้ว
  showChangeModal: boolean = false;     // ควบคุมการเปิด/ปิด Modal เปลี่ยนอาจารย์รายบุคคล
  targetStudentToChange: any = null;    // เก็บข้อมูลนักศึกษาแถวที่เลือกมาเปลี่ยนอาจารย์
  newSelectedAdvisorIds: number[] = []; // เก็บ ID อาจารย์ชุดใหม่ที่เลือกใน Modal

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

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
        this.students = (res.students || []).map((s: any) => ({ ...s, image: null })); // ถ้า นศ. ไม่มีรูป
        this.assignedList = (res.assigned_data || []).map((row: any) => ({
          ...row,
          advisors: row.advisors.map((a: any) => this.processImageData(a))
        }));
        
        this.departments = res.staff_departments || [];
        this.major = ['ทุกสาขา', ...(res.student_majors || []).filter((d: any) => d != null)];
        
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
    if (this.isDeptDropdownOpen) this.isBranchDropdownOpen = false;
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
    if (this.isBranchDropdownOpen) this.isDeptDropdownOpen = false;
  }

  selectBranch(branch: string) {
    this.selectedBranch = branch;
    this.isBranchDropdownOpen = false; 
    this.filterStudents();             
  }

  filterStudents() {
    let result = this.students;
    if (this.selectedBranch !== 'ทุกสาขา') {
      result = result.filter(s => s.major === this.selectedBranch);
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
  toggleSemesterDropdown() {
    this.isSemesterDropdownOpen = !this.isSemesterDropdownOpen;
    if (this.isSemesterDropdownOpen) {
      this.isDeptDropdownOpen = false;
      this.isBranchDropdownOpen = false;
    }
  }

  selectSemester(sem: number) {
    this.selectedSemester = sem;
    this.isSemesterDropdownOpen = false;
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
      semester: this.selectedSemester
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