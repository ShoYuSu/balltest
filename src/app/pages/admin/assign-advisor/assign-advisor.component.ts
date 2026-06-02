import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 1. เพิ่ม ChangeDetectorRef ตัวนี้เข้ามาครับ
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  standalone: true,
  selector: 'app-assign-advisor',
  imports: [CommonModule, FormsModule],
  templateUrl: './assign-advisor.html',
})
export class AssignAdvisorComponent implements OnInit {
  
  // ตัวแปรเก็บข้อมูลจาก API (ระบบเดิมที่คุณน้าแก้มา ดีอยู่แล้วครับ)
  major: string[] = ['ทุกสาขา']; 
  advisors: any[] = [];
  students: any[] = [];

  // ตัวแปรควบคุมหน้าจอ (คงเดิม)
  selectedAdvisors: any[] = []; 
  selectedBranch: string = 'ทุกสาขา';
  searchStudentText: string = ''; 
  filteredStudents: any[] = [];
  selectedStudents: number[] = []; 
  isBranchDropdownOpen = false;
  showDeleteModal = false;
  targetToDelete: any = null;

  // 2. เรียกใช้งาน ChangeDetectorRef ผ่าน Constructor
  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadDataFromDatabase();
  }

  // ================= 1. โหลดข้อมูลจาก API =================
  loadDataFromDatabase() {
    this.http.get<any>(`${environment.apiUrl}/assign_advisor.php`).subscribe({
      next: (res) => {
        if (res.success) {
          // ส่วนของสาขา/หลักสูตรที่คุณน้าแก้มา ดีมากแล้วค้างไว้เหมือนเดิมเลยครับ
          this.major = ['ทุกสาขา', ...res.departments.filter((d: any) => d != null)];
          this.advisors = res.advisors;
          this.students = res.students;
          this.filterStudents();
          
          this.cdr.detectChanges(); // บังคับให้ Angular อัปเดต UI ทันทีหลังจากโหลดข้อมูลเสร็จ
        } else {
          console.error('API Error:', res.message);
        }
      },
      error: (err) => console.error('Connection Error:', err)
    });
  }
  toggleBranchDropdown() {
    this.isBranchDropdownOpen = !this.isBranchDropdownOpen;
  }
  selectBranch(branch: string) {
    this.selectedBranch = branch;
    this.isBranchDropdownOpen = false; // เลือกเสร็จให้ทำการปิดหน้าต่างลิสต์ลง
    this.filterStudents();             // คัดกรองนักศึกษาอัปเดตเรียลไทม์
  }

  // ================= 2. ระบบกรองนักศึกษา (คงเดิมตามที่คุณน้าเขียนมาเป๊ะๆ) =================
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
    this.cdr.detectChanges(); // บังคับให้อัปเดต UI เมื่อคุณน้าพิมพ์ค้นหาหรือเปลี่ยนสาขาใน Dropdown
  }

  // ================= 3. ระบบจัดการอาจารย์ (จำกัด 2 คน) =================
  toggleAdvisor(advisor: any) {
    const index = this.selectedAdvisors.findIndex(a => a.id === advisor.id);
    if (index !== -1) {
      this.selectedAdvisors.splice(index, 1);
    } else {
      if (this.selectedAdvisors.length >= 2) {
        alert('คุณสามารถเลือกอาจารย์ที่ปรึกษาได้สูงสุด 2 ท่านต่อกลุ่มนักศึกษาครับ');
        return;
      }
      this.selectedAdvisors.push(advisor);
    }
    this.cdr.detectChanges(); // สั่งให้อัปเดตกรอบสีและวงกลมรูปภาพอาจารย์ทันทีที่กดเลือก
  }

  isAdvisorSelected(advisorId: number): boolean {
    return this.selectedAdvisors.some(a => a.id === advisorId);
  }

  // ================= 4. ระบบจัดการนักศึกษา =================
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

  // ================= 5. บันทึกข้อมูล =================
  saveAssignments() {
    if (this.selectedAdvisors.length === 0 || this.selectedStudents.length === 0) {
      return;
    }

    const payload = {
      advisor_ids: this.selectedAdvisors.map(a => a.id),
      student_ids: this.selectedStudents
    };

    this.http.post<any>(`${environment.apiUrl}/assign_advisor.php`, payload).subscribe({
      next: (res) => {
        if (res.success) {
          alert(res.message || 'กำหนดที่ปรึกษาสำเร็จ');
          this.selectedAdvisors = [];
          this.selectedStudents = [];
          this.cdr.detectChanges();
        } else {
          alert(res.message);
        }
      },
      error: (err) => alert('ไม่สามารถบันทึกข้อมูลได้ ขัดข้องทางเครือข่าย')
    });
  }

  executeDelete() {
    this.showDeleteModal = false;
  }
}