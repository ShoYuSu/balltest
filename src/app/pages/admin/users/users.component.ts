import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 1. เพิ่ม ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { environment } from '../../../../environments/environment';
import { TableColumnModel } from '../../../shared/components/stat-cards/models/table-option';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './users.html',
})
export class UsersComponent implements OnInit {
  userForm!: FormGroup;
  isModalOpen = false;
  submitted = false;
  isStudentDropdownOpen = false;
  selectedStudentName = '';
  
  studentsNoUser: any[] = []; 
  users: any[] = []; 

  public columns: TableColumnModel[] = [
    { columnDef: "full_name", header: "ชื่อ-นามสกุล", tag: "text", display: true, width: "large", cell: (el: any) => el.full_name || '-' },
    { columnDef: "email", header: "ชื่อผู้ใช้ (อีเมล)", tag: "text", display: true, width: "large", cell: (el: any) => el.email || '-' },
    { columnDef: "role", header: "บทบาท", tag: "badge", display: true, width: "medium", cell: (el: any) => 'นักศึกษา' },
    { columnDef: "manage", header: "จัดการ", tag: "manage", display: true, width: "large", cell: (el: any) => el }
  ];

  constructor(
    private fb: FormBuilder, 
    private http: HttpClient,
    private cdr: ChangeDetectorRef // 2. Inject ChangeDetectorRef เข้ามา
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadAllUsers(); 
    this.loadStudentsNoUser();
  }

  initForm(): void {
    this.userForm = this.fb.group({
      person_id: ['', Validators.required],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  loadAllUsers() {
    this.http.get(`${environment.apiUrl}/get_all_users.php`).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          // 3. ใช้ Spread Operator [...] เพื่อสร้าง Array ใหม่ (กระตุ้น Change Detection)
          this.users = [...res.data]; 
          console.log('Users loaded:', this.users);
          
          // 4. สั่งให้ Angular ตรวจสอบและวาดหน้าจอใหม่ทันที
          this.cdr.detectChanges(); 
        }
      },
      error: (err) => {
        console.error('ไม่สามารถโหลดข้อมูลผู้ใช้ได้:', err);
      }
    });
  }

  loadStudentsNoUser(): void {
    this.http.get(`${environment.apiUrl}/get_students_no_user.php`).subscribe({
      next: (res: any) => { 
        if (res.success) {
          this.studentsNoUser = [...res.data];
          this.cdr.detectChanges(); // สั่งวาด Dropdown ใหม่ด้วย
        }
      }
    });
  }

  selectStudent(student: any) {
    this.selectedStudentName = `${student.student_code} - ${student.full_name}`;
    this.userForm.patchValue({ 
      person_id: student.person_id,
      email: student.email 
    });
    this.isStudentDropdownOpen = false;
  }

  saveUser(): void {
    this.submitted = true;
    if (this.userForm.valid) {
      const payload = this.userForm.getRawValue(); 

      this.http.post(`${environment.apiUrl}/add_user_student.php`, payload).subscribe({
        next: (res: any) => {
          if (res.success) {
            alert('สร้างบัญชีสำเร็จ!');
            this.closeModal();
            this.loadAllUsers(); 
            this.loadStudentsNoUser(); 
          } else {
            alert('ผิดพลาด: ' + res.message);
          }
        },
        error: () => alert('เซิร์ฟเวอร์ขัดข้อง')
      });
    }
  }

  toggleStudentDropdown() { this.isStudentDropdownOpen = !this.isStudentDropdownOpen; }
  
  openAddModal() { 
    this.submitted = false; 
    this.userForm.reset(); 
    this.selectedStudentName = ''; 
    this.isModalOpen = true; 
  }
  
  closeModal() { 
    this.isModalOpen = false; 
  }
}