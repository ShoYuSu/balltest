import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

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

  loginStep: 'select' | 'student' | 'teacher' = 'select';
  hidePassword = true;

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  loading = false;
  showErrorModal = false;
  errorMessage = '';

  setStep(step: 'select' | 'student' | 'teacher') {
    this.loginStep = step;
    this.isStudentPage = (step === 'student');
    this.loginForm.reset();
    this.cdr.detectChanges();
  }

  closeModal() {
    this.showErrorModal = false;
  }

  // 🌟 ใช้ชื่อ onLogin() ให้ตรงกับ HTML ของคุณ
  onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const loginData = {
      ...this.loginForm.value,
      login_type: this.loginStep 
    };

    this.http.post<any>('http://localhost:8080/api/login.php', loginData)
      .subscribe({
        next: (res) => {
          if (res && res.success) {
            const realToken = res.token; 
            const role = res.role || (this.isStudentPage ? 'student' : 'teacher');
            const isAdvisorFlag = res.is_advisor || false;
            const advisorId = res.advisor_id || '';
            const staffId = res.staff_id || '';

            localStorage.setItem('token', realToken);
            localStorage.setItem('role', role);
            localStorage.setItem('full_name', res.full_name || '');
            localStorage.setItem('img_profile', res.img_profile || '');
            localStorage.setItem('student_code', res.student_code || '');
            localStorage.setItem('is_advisor', isAdvisorFlag ? 'true' : 'false');
            localStorage.setItem('advisor_id', advisorId);
            localStorage.setItem('staff_id', staffId);
            localStorage.setItem('user_id', res.user_id); 

            if (role === 'student') {
              this.router.navigate(['/personal-data']);
            } else {
              // ส่งพารามิเตอร์ทั้งหมดไปหาระบบ 4201 
              window.location.href = `http://localhost:4201/dashboard?role=${role}&token=${realToken}&user=${encodeURIComponent(res.full_name)}&student_code=${res.student_code || ''}&is_advisor=${isAdvisorFlag}&advisor_id=${advisorId}&staff_id=${staffId}&user_id=${res.user_id}`;
            }

          } else {
            this.errorMessage = res.message;
            this.showErrorModal = true;
          }
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Login Error:', err);
          this.errorMessage = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ API ได้';
          this.showErrorModal = true;
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }
}