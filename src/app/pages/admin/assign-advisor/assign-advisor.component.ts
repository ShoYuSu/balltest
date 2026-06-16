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

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadDataFromDatabase();
  }

  // ================= 1. โหลดข้อมูลจาก API (💡 จุดที่แก้ไขการรับค่าใหม่) =================
  loadDataFromDatabase() {
    this.http.get<any>(`${environment.apiUrl}/assign_advisor.php`).subscribe({
      next: (res) => {
        if (res.success) {
          // 💡 1. ดึงข้อมูลรายชื่อภาควิชาของฝั่งอาจารย์ไปใส่ในช่องตัวกรองอาจารย์
          this.departments = res.staff_departments || [];
          
          // 💡 2. ดึงข้อมูลรายชื่อสาขาวิชาของนักศึกษาไปใส่ในช่องตัวกรองนักศึกษา
          this.major = ['ทุกสาขา', ...(res.student_majors || []).filter((d: any) => d != null)];
          
          this.advisors = res.advisors || [];
          this.students = res.students || [];
          
          // ทำการกรองสเตตัสเริ่มต้นให้กับทั้งสองฝั่งหลังจากได้ข้อมูลครบแล้ว
          this.filterAdvisors();
          this.filterStudents();
          
          this.cdr.detectChanges();
        } else {
          console.error('API Error:', res.message);
        }
      },
      error: (err) => console.error('Connection Error:', err)
    });
  }

  // ================= 2. ระบบจัดการ/กรองข้อมูลฝั่งอาจารย์ =================
  toggleDeptDropdown() {
    this.isDeptDropdownOpen = !this.isDeptDropdownOpen;
    if (this.isDeptDropdownOpen) this.isBranchDropdownOpen = false; // ปิด dropdown ฝั่งนศ. ถ้าฝั่งอาจารย์เปิด
  }

  selectDept(dept: string) {
    this.selectedDept = dept;
    this.isDeptDropdownOpen = false;
    this.filterAdvisors(); // สั่งกรองข้อมูลอาจารย์ใหม่ทันทีเมื่อมีการเปลี่ยนภาควิชา
  }

  filterAdvisors() {
    let result = this.advisors;

    // 1. กรองตามภาควิชาที่เลือก
    if (this.selectedDept !== 'ทุกภาควิชา') {
      result = result.filter(a => a.dept === this.selectedDept);
    }

    // 2. กรองตามข้อความที่ใช้ค้นหา (ชื่อ หรือ รหัสอาจารย์)
    if (this.searchAdvisorText.trim() !== '') {
      const txt = this.searchAdvisorText.toLowerCase().trim();
      result = result.filter(a => 
        (a.name && a.name.toLowerCase().includes(txt)) || 
        (a.code && a.code.toLowerCase().includes(txt))
      );
    }

    this.filteredAdvisors = result;
    this.cdr.detectChanges(); // บังคับให้หน้าจออัปเดตรายชื่ออาจารย์ชุดใหม่ตามฟิลเตอร์
  }

  // ================= 3. ระบบกรองนักศึกษา (คงเดิม) =================
  toggleBranchDropdown() {
    this.isBranchDropdownOpen = !this.isBranchDropdownOpen;
    if (this.isBranchDropdownOpen) this.isDeptDropdownOpen = false; // ปิด dropdown ฝั่งอาจารย์ ถ้าฝั่งนศ.เปิด
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

  // ================= 5. ระบบจัดการนักศึกษา (คงเดิม) =================
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

  // ================= 6. บันทึกข้อมูล =================
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
}