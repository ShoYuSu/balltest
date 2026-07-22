import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  isStudentPage: boolean = false;

  loginStep: 'select' | 'student' | 'teacher' = 'select';
  hidePassword = true;

  // 🌟 เพิ่ม rememberMe เข้าไปใน FormGroup
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    rememberMe: new FormControl(false),
  });

  loading = false;
  showErrorModal = false;
  errorMessage = '';

  ngOnInit() {
    // 🌟 ดึงข้อมูลที่เคยบันทึกไว้ตอนเปิดหน้าเว็บมาใส่ฟอร์ม
    this.loadSavedCredentials();
  }

  // 🌟 ฟังก์ชันโหลดข้อมูลที่จำไว้
  loadSavedCredentials() {
    const savedEmail = localStorage.getItem('savedEmail');
    const savedPassword = localStorage.getItem('savedPassword');

    if (savedEmail && savedPassword) {
      this.loginForm.patchValue({
        email: savedEmail,
        password: atob(savedPassword), // ถอดรหัส Base64 กลับเป็นรหัสผ่าน
        rememberMe: true,
      });
    }
  }

  setStep(step: 'select' | 'student' | 'teacher') {
    this.loginStep = step;
    this.isStudentPage = step === 'student';
    this.loginForm.reset(); // ล้างฟอร์มเวลาสลับหน้า
    this.loadSavedCredentials(); // 🌟 โหลดข้อมูลที่จำไว้กลับมาใส่ใหม่
    this.cdr.detectChanges();
  }

  closeModal() {
    this.showErrorModal = false;
    this.cdr.detectChanges();
  }

  onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    const { email, password, rememberMe } = this.loginForm.value;

    this.http
      .post(`${environment.apiUrl}/login.php`, {
        email,
        password,
        login_type: this.isStudentPage ? 'student' : 'staff',
      })
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            const role = res.role?.toLowerCase().trim();
            const tokenToSave = res.token ? res.token : 'fake-token-for-test';

            localStorage.setItem('token', tokenToSave);
            localStorage.setItem('img_profile', res.img_profile || '');

            // 🌟 จัดการจดจำรหัสผ่าน ถ้าติ๊กให้จำ ถ้าไม่ติ๊กให้ลบทิ้ง
            if (rememberMe) {
              localStorage.setItem('savedEmail', email as string);
              localStorage.setItem('savedPassword', btoa(password as string)); // เข้ารหัสเป็น Base64
            } else {
              localStorage.removeItem('savedEmail');
              localStorage.removeItem('savedPassword');
            }

            if (role === 'student') {
              this.router.navigate(['/personal-data']);
            } else {
              window.location.href = `http://localhost:4201/dashboard?token=${tokenToSave}`;
            }
          } else {
            this.errorMessage = res.message;
            this.showErrorModal = true;
          }
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('🚨 API พังหรือเชื่อมต่อไม่ได้:', err);
          this.errorMessage = 'การเชื่อมต่อผิดพลาด';
          this.showErrorModal = true;
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }
}
