import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { StatCardsComponent } from '../../../shared/components/stat-cards/stat-cards.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { TableColumnModel } from '../../../shared/components/stat-cards/models/table-option';
import { ConfirmModalComponent } from '../../../shared/components/stat-cards/models/comfirm-modal/confirm-modal.component';
import { environment } from '../../../../environments/environment';
import { CurriculumManagementComponent } from '../../curriculum-management/curriculum-management.component';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    FormsModule, 
    HttpClientModule,
    StatCardsComponent, 
    ButtonComponent, 
    ConfirmModalComponent,
    CurriculumManagementComponent
  ],
  templateUrl: './students.html',
  styleUrl: './students.css',
})
export class StudentsComponent implements OnInit {
  // 1. ปรับการ Map Column ให้แม่นยำตาม Database
  public columns: TableColumnModel[] = [
    { columnDef: "profile", header: "โปรไฟล์", tag: "image", display: true, width: "small", cell: (el) => el.image ? `http://localhost:8080/api/${el.image}` : null },
    { columnDef: "student_code", header: "รหัสนักศึกษา", tag: "text", display: true, width: "medium", cell: (el) => el.student_code },
    { columnDef: "name", header: "ชื่อ-นามสกุล", tag: "text", display: true, width: "large", cell: (el) => el.full_name || '-' },
    { columnDef: "email", header: "อีเมล", tag: "text", display: true, width: "large", cell: (el) => el.email || '-' },
    { columnDef: "faculty_major", header: "คณะ/สาขา", tag: "text", display: true, width: "large", cell: (el) => `${el.faculty} / ${el.major}` },
    { columnDef: "year", header: "ชั้นปี", tag: "text", display: true, width: "small", cell: (el) => `ปี ${el.year}` },
    { columnDef: "edit", header: "", tag: "edit", display: true, width: "small", cell: (el) => el },
    { columnDef: "delete", header: "", tag: "delete", display: true, width: "small", cell: (el) => el },
  ];

  studentStats = [
    { label: 'นักศึกษาทั้งหมด', value: 0, icon: 'school', bgColor: 'bg-green-200', textColor: 'text-green-600', cardBg: 'bg-[#F5FFFA]' },
    { label: 'มีที่ปรึกษาแล้ว', value: 0, icon: 'person', bgColor: 'bg-yellow-100', textColor: 'text-yellow-600', cardBg: 'bg-[#FFF9E5]' },
    { label: 'ยังไม่มีที่ปรึกษา', value: 0, icon: 'person_off', bgColor: 'bg-red-200', textColor: 'text-red-600', cardBg: 'bg-[#FFE5E5]' },
  ];

  isModalOpen = false;
  isDeleteModalOpen = false;
  studentToDelete: any = null;
  submitted = false;
  searchText = '';
  imagePreview: string | ArrayBuffer | null = null;
  studentForm!: FormGroup;
  students: any[] = []; 
  isSaving = false;
  isEditMode = false;
  
  majors: string[] = ['วิทยาการคอมพิวเตอร์', 'เทคโนโลยีการอาหาร']; 
  isYearDropdownOpen = false;
  isMajorDropdownOpen = false;
  newMajorName: string = '';
  isCurriculumModalOpen = false;

  constructor(
    private fb: FormBuilder, 
    private http: HttpClient,
    private cdr: ChangeDetectorRef // เพิ่มเพื่อบังคับ Refresh หน้าจอ
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadStudents();
    this.loadMajors();
  }

  initForm() {
    this.studentForm = this.fb.group({
      student_code: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      full_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      faculty: ['วิทยาศาสตร์', Validators.required],
      major: ['', Validators.required],
      year: ['1', Validators.required]
    });
  }

  // 2. ปรับการดึงข้อมูลให้นิ่งและรองรับ Change Detection
  loadStudents() {
    this.http.get<any[]>(`${environment.apiUrl}/get_students.php`).subscribe({
      next: (res) => {
        // ใช้ Spread Operator เพื่อสร้าง Array ใหม่ ป้องกันปัญหา UI ไม่ยอม Refresh
        this.students = [...res]; 
        this.updateStats();
        this.cdr.detectChanges(); // สั่งให้ Angular วาดหน้าจอทันที
      },
      error: (err) => console.error('Fetch error:', err)
    });
  }
   addNewMajor() {
  const trimmedMajor = this.newMajorName.trim();
  if (trimmedMajor) {
    this.http.post(`${environment.apiUrl}/add_major.php`, { major_name: trimmedMajor }).subscribe({
      next: (res: any) => {
        if (res.success || res.message === 'มีสาขานี้อยู่แล้ว') {
          if (!this.majors.includes(trimmedMajor)) {
            this.majors.push(trimmedMajor);
          }
          // เลือกสาขานี้ให้ฟอร์มทันทีเพื่อให้ Valid และกดบันทึกได้
          this.selectMajor(trimmedMajor); 
          this.newMajorName = '';
        } else {
          alert(res.message);
        }
      }
    });
  }
}

  loadMajors() {
    this.http.get<any[]>(`${environment.apiUrl}/get_majors.php`).subscribe({
      next: (res) => {
        if (Array.isArray(res)) {
          const dbMajors = res.map((m: any) => m.major_name);
          this.majors = [...new Set([...['วิทยาการคอมพิวเตอร์', 'เทคโนโลยีการอาหาร'], ...dbMajors])];
        }
      }
    });
  }

  saveStudent() {
    this.submitted = true;
    if (this.studentForm.invalid || this.isSaving) return;

    this.isSaving = true;
    const studentData = {
      ...this.studentForm.value,
      image: this.imagePreview // ส่งรูป Base64 ไปยัง PHP
    };

    this.http.post(`${environment.apiUrl}/add_student.php`, studentData).subscribe({
      next: (response: any) => {
        // รองรับทั้ง status success และ success: true
        if (response && (response.status === 'success' || response.success)) {
          alert('บันทึกข้อมูลสำเร็จ!');
          this.loadStudents();
          this.closeModal();
        } else {
          alert('ผิดพลาด: ' + (response?.message || 'ข้อมูลไม่ถูกต้อง'));
        }
        this.isSaving = false;
      },
      error: (err) => {
        console.error('HTTP Error:', err);
        alert('ติดต่อเซิร์ฟเวอร์ไม่ได้');
        this.isSaving = false;
      }
    });
  }

  // --- UI Helpers ---
  updateStats() {
    this.studentStats[0].value = this.students.length;
    // ตัวอย่างการนับคนที่ไม่มีที่ปรึกษา (ถ้ามีฟิลด์ advisor_id ใน DB)
    this.studentStats[2].value = this.students.filter(s => !s.advisor_name).length;
  }

  get filteredStudents() {
    const search = this.searchText.toLowerCase();
    return this.students.filter(s => 
      (s.full_name || '').toLowerCase().includes(search) ||
      (s.student_code || '').includes(search)
    );
  }

  openModal() {
    this.isEditMode = false;
    this.isModalOpen = true;
    this.imagePreview = null;
    this.studentForm.reset({ faculty: 'วิทยาศาสตร์', year: '1' });
  }

  closeModal() {
  this.isModalOpen = false;
  this.studentForm.reset();
  this.submitted = false;
}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
        this.cdr.detectChanges(); // บังคับให้พรีวิวรูปขึ้นทันที
      };
      reader.readAsDataURL(file);
    }
  }

  editStudent(student: any) {
  this.isEditMode = true;
  this.isModalOpen = true;
  this.imagePreview = student.image ? `http://localhost:8080/api/${student.image}` : null;

  // Patch ข้อมูลเดิมเข้าสู่ Form
  this.studentForm.patchValue({
    student_code: student.student_code,
    full_name: student.full_name,
    email: student.email,
    faculty: student.faculty,
    major: student.major,
    year: student.year,
    student_image: student.image // เก็บชื่อไฟล์ภาพเดิมไว้
  });
}

  deleteStudent(student: any) {
    this.studentToDelete = student;
    this.isDeleteModalOpen = true;
  }

  confirmDelete() {
    if (this.studentToDelete) {
      this.http.post(`${environment.apiUrl}/delete_student.php`, { 
        student_id: this.studentToDelete.student_id 
      }).subscribe({
        next: (res: any) => {
          this.loadStudents();
          this.isDeleteModalOpen = false;
        },
        error: () => alert('ลบไม่สำเร็จ')
      });
    }
  }

  cancelDelete() { this.isDeleteModalOpen = false; }
  
  toggleYearDropdown() { 
    this.isYearDropdownOpen = !this.isYearDropdownOpen; 
    if (this.isYearDropdownOpen) this.isMajorDropdownOpen = false;
  }

  toggleMajorDropdown() {
    this.isMajorDropdownOpen = !this.isMajorDropdownOpen;
    if (this.isMajorDropdownOpen) this.isYearDropdownOpen = false;
  }

  selectYear(year: number) {
    this.studentForm.patchValue({ year: year.toString() });
    this.isYearDropdownOpen = false;
  }

  selectMajor(major: string) {
    this.studentForm.patchValue({ major: major });
    this.isMajorDropdownOpen = false;
  }
}