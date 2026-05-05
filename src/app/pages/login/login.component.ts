import { Component, inject, ChangeDetectorRef } from '@angular/core';
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
export class LoginComponent {
  private http = inject(HttpClient);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  // ควบคุมหน้าจอ: select (หน้าแรก) -> student (หน้านักศึกษา) -> teacher (หน้าอาจารย์)
  loginStep: 'select' | 'student' | 'teacher' = 'select';
  hidePassword = true;

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  loading = false;
  showErrorModal = false;
  errorMessage = '';

  // ฟังก์ชันเปลี่ยนหน้าจอ
  setStep(step: 'select' | 'student' | 'teacher') {
    this.loginStep = step;
    this.loginForm.reset(); // ล้างฟอร์มเวลาสลับหน้า
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
    const { email, password } = this.loginForm.value;

    this.http.post(`${environment.apiUrl}/login.php`, { email, password }).subscribe({
      next: (res: any) => {
        if (res.success) {
          const role = res.role?.toLowerCase().trim();

          localStorage.setItem('token', res.token);
          localStorage.setItem('role', role);
          if (res.full_name) localStorage.setItem('full_name', res.full_name);
          if (res.student_code) localStorage.setItem('student_code', res.student_code);

          if (role === 'student') {
            // ถ้านักศึกษา พุ่งไปหน้าข้อมูลส่วนตัวเลย
            this.router.navigate(['/personal-data']);
          } else {
            // ถ้าเป็น อาจารย์/เจ้าหน้าที่/แอดมิน แนบ Role กับ Token ไปให้ระบบเพื่อนด้วย
            window.location.href = `http://localhost:4201/admin/dashboard?role=${role}&token=${res.token}`;
          }
        } else {
          this.errorMessage = res.message;
          this.showErrorModal = true;
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'เชื่อมต่อ XAMPP ไม่ได้ เช็คพอร์ต 8080 หรือยัง?';
        this.showErrorModal = true;
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
