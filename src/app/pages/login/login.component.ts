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
    this.isStudentPage = step === 'student';
    this.loginForm.reset();
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
            const permsString = res.perms || '';
            const isAdvisorFlag = res.is_advisor || false;

            // 🌟 เก็บแค่ Token (และรูป/ชื่อถ้าอยากให้โชว์ไวๆ)
            localStorage.setItem('token', tokenToSave);
            localStorage.setItem('full_name', res.full_name || '');
            localStorage.setItem('student_code', res.student_code || '');
            localStorage.setItem('img_profile', res.img_profile || '');

            if (role === 'student') {
              // 🚀 นักศึกษาไป 4200 ต่อ (เดี๋ยวเมนูจะไปโหลดสิทธิ์เอง)
              this.router.navigate(['/personal-data']);
            } else {
              // 🚀 อาจารย์/แอดมิน โยนไป 4201
              const encodedPerms = encodeURIComponent(permsString);
              window.location.href = `http://localhost:4201/dashboard?role=${role}&token=${tokenToSave}&user=${res.full_name}&perms=${encodedPerms}&student_code=${res.student_code || ''}&is_advisor=${isAdvisorFlag}`;
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
