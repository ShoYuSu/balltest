import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { TableColumnModel } from '../../../shared/components/stat-cards/models/table-option';
import { ConfirmModalComponent } from '../../../shared/components/stat-cards/models/comfirm-modal/confirm-modal.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, ConfirmModalComponent],
  templateUrl: './users.html',
})
export class UsersComponent implements OnInit {
  // สถานะการเปิด/ปิด Modal
  isResetModalOpen = false;
  isDeleteModalOpen = false;

  // ข้อมูลที่เลือกไว้จัดการ
  userToReset: any = null;
  userToDeleteId: any = null;

  searchText = '';
  users: any[] = []; // ข้อมูลต้นฉบับจากฐานข้อมูล

  // กำหนดโครงสร้างคอลัมน์ของตาราง
  public columns: TableColumnModel[] = [
    {
      columnDef: 'full_name',
      header: 'ชื่อ-นามสกุล',
      tag: 'text',
      display: true,
      width: 'large',
      cell: (el: any) => el.full_name || '-',
    },
    {
      columnDef: 'email',
      header: 'ชื่อผู้ใช้ (อีเมล)',
      tag: 'text',
      display: true,
      width: 'large',
      cell: (el: any) => el.email || '-',
    },
    {
      columnDef: 'role',
      header: 'บทบาท',
      tag: 'badge',
      display: true,
      width: 'medium',
      cell: (el: any) => 'นักศึกษา',
    },
    {
      columnDef: 'reset',
      header: 'รีเซ็ตรหัส',
      tag: 'reset',
      display: true,
      width: 'small',
      cell: (el: any) => el,
    },
    {
      columnDef: 'delete',
      header: 'ลบ',
      tag: 'delete',
      display: true,
      width: 'small',
      cell: (el: any) => el,
    },
  ];

  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  isSuccessModalOpen = false;
  isSuccess = false; // ตัวแปรเช็คว่ารีเซ็ตสำเร็จแล้วหรือยัง

  ngOnInit(): void {
    this.loadAllUsers();
  }

  // ⭐️ ฟังก์ชัน Search กรองข้อมูลตาม ชื่อ, อีเมล หรือรหัสนักศึกษา
  get filteredStudents() {
    const search = this.searchText.toLowerCase();
    return this.users.filter(
      (s) =>
        (s.full_name || '').toLowerCase().includes(search) ||
        (s.email || '').toLowerCase().includes(search) ||
        (s.student_code || '').includes(search),
    );
  }

  // โหลดข้อมูลผู้ใช้งานทั้งหมดจาก API
  loadAllUsers() {
    this.http.get(`${environment.apiUrl}/get_all_users.php`).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.users = [...res.data];
          this.cdr.detectChanges();
        }
      },
    });
  }

  // --- Logic การรีเซ็ตรหัสผ่าน ---
  openResetModal(user: any) {
    this.userToReset = user;
    this.isResetModalOpen = true;
    this.isSuccess = false;
  }

  closeResetModal() {
    this.isResetModalOpen = false;
    this.userToReset = null;
    this.isSuccess = false;
  }

  confirmResetPassword() {
    const userId = this.userToReset?.user_id;
    const studentCode = this.userToReset?.student_code;

    if (!userId || !studentCode) {
      alert('ข้อมูลนักศึกษาไม่สมบูรณ์ ไม่สามารถรีเซ็ตได้');
      return;
    }

    this.http
      .post(`${environment.apiUrl}/update_user_student_password.php`, {
        id: userId,
        password: studentCode,
      })
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            //  ให้แสดงหน้าสำเร็จทันที
            this.isSuccess = true;

            //  บังคับ Angular render ใหม่ทันที
            this.cdr.detectChanges();

            setTimeout(() => {
              this.closeResetModal();
            }, 1000);
          } else {
            alert('เกิดข้อผิดพลาด: ' + res.message);
          }
        },
        error: () => {
          alert('เซิร์ฟเวอร์ขัดข้อง ไม่สามารถรีเซ็ตรหัสได้');
        },
      });
  }

  // --- Logic การลบข้อมูล ---
  deleteUser(userId: any) {
    this.userToDeleteId = userId;
    this.isDeleteModalOpen = true;
  }

  confirmDelete() {
    this.http
      .post(`${environment.apiUrl}/delete_user_student.php`, { id: this.userToDeleteId })
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            this.loadAllUsers(); // โหลดข้อมูลใหม่หลังลบสำเร็จ
            this.isDeleteModalOpen = false;
            this.userToDeleteId = null;
          }
        },
      });
  }

  cancelDelete() {
    this.isDeleteModalOpen = false;
    this.userToDeleteId = null;
  }
}
