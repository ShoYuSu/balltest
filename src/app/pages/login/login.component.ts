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
  isStudentPage: boolean = false;

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
    this.isStudentPage = (step === 'student');
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

   this.http.post(`${environment.apiUrl}/login.php`, { email, password, login_type: this.isStudentPage ? 'student' : 'staff' }).subscribe({
  next: (res: any) => {
    if (res.success) {
      const role = res.role?.toLowerCase().trim();

      // 1. เก็บข้อมูลลง LocalStorage
      localStorage.setItem('token', res.token || 'authenticated');
      localStorage.setItem('role', role);
      localStorage.setItem('full_name', res.full_name || '');
      localStorage.setItem('img_profile', res.img_profile || '');
      localStorage.setItem('user_id', res.user_id);
      localStorage.setItem('student_code', res.student_code || '');

      // 2. ตรวจสอบเงื่อนไขการไปหน้าต่างๆ
      if (role === 'student') {
        // ✅ ไปที่หน้านักศึกษา (พอร์ต 4200) เพื่อให้โชว์เมนูที่คุณส่งมา
        this.router.navigate(['/personal-data']);
      } else {
        // ⚠️ หากคุณต้องการให้อาจารย์/แอดมิน ไปหน้า Dashboard ของระบบพอร์ต 4201 เหมือนเดิม
        // แต่ถ้าต้องการให้อยู่ในหน้าเดียวกัน ให้เปลี่ยนเป็น this.router.navigate(['/admin-dashboard']);
        window.location.href = `http://localhost:4201/admin/dashboard?role=${role}&token=${res.token}&user=${res.full_name}`;
      }

    } else {
      this.errorMessage = res.message;
      this.showErrorModal = true;
    }
    this.loading = false;
    this.cdr.detectChanges();
  },
  error: () => {
    this.errorMessage = 'การเชื่อมต่อผิดพลาด';
    this.showErrorModal = true;
    this.loading = false;
    this.cdr.detectChanges();
  }
});
  }
}
