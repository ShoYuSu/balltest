import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

// 🌟 ตรวจว่ารหัสผ่านใหม่กับยืนยันรหัสผ่านตรงกัน
function passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
  const newPassword = group.get('newPassword')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;
  return newPassword === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './change-password.html',
})
export class ChangePasswordComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  isFirstLogin = false;
  hideNewPassword = true;
  hideConfirmPassword = true;
  loading = false;
  errorMessage = '';
  successMessage = '';

  changePasswordForm = new FormGroup(
    {
      newPassword: new FormControl('', [Validators.required, Validators.minLength(8)]),
      confirmPassword: new FormControl('', [Validators.required]),
    },
    { validators: passwordsMatchValidator }
  );

  ngOnInit() {
    // 🌟 มาจากหน้า login ครั้งแรกไหม (?first=1) ใช้แสดงข้อความแจ้งเตือนเฉย ๆ
    this.route.queryParams.subscribe((params) => {
      this.isFirstLogin = params['first'] === '1';
    });

    // ถ้าไม่มี token เลย (เข้าหน้านี้ตรง ๆ โดยไม่ได้ล็อกอิน) เด้งกลับไปหน้า login
    if (!localStorage.getItem('token')) {
      this.router.navigate(['/login']);
    }
  }

  onSubmit() {
    if (this.changePasswordForm.invalid) {
      this.changePasswordForm.markAllAsTouched();
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    const { newPassword, confirmPassword } = this.changePasswordForm.value;
    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http
      .post(
        `${environment.apiUrl}/change_password.php`,
        {
          new_password: newPassword,
          confirm_password: confirmPassword,
        },
        { headers }
      )
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          if (res.success) {
            this.successMessage = res.message || 'เปลี่ยนรหัสผ่านสำเร็จ';
            this.cdr.detectChanges();
            // 🌟 เปลี่ยนสำเร็จแล้ว พาไปหน้าหลักของนักศึกษาต่อ
            setTimeout(() => {
              this.router.navigate(['/personal-data']);
            }, 1200);
          } else {
            this.errorMessage = res.message || 'เปลี่ยนรหัสผ่านไม่สำเร็จ';
            this.cdr.detectChanges();
          }
        },
        error: (err) => {
          console.error('🚨 เปลี่ยนรหัสผ่านไม่สำเร็จ:', err);
          this.errorMessage = 'การเชื่อมต่อผิดพลาด กรุณาลองใหม่อีกครั้ง';
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }
}