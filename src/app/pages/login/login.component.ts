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
    this.isStudentPage = (step === 'student');
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

    this.http.post(`${environment.apiUrl}/login.php`, { email, password, login_type: this.isStudentPage ? 'student' : 'staff' }).subscribe({
      next: (res: any) => {
        if (res.success) {
          const role = res.role?.toLowerCase().trim();
          const tokenToSave = res.token ? res.token : 'fake-token-for-test';

          const permsString = res.perms || '';
          const isAdvisorFlag = res.is_advisor || false;

          // 🌟 1. ดึงค่า advisor_id และ staff_id ที่ได้จาก PHP มาเก็บไว้ในตัวแปร
          const advisorId = res.advisor_id || '';
          const staffId = res.staff_id || '';

          localStorage.setItem('token', tokenToSave);
          localStorage.setItem('role', role);
          localStorage.setItem('full_name', res.full_name || '');
          localStorage.setItem('img_profile', res.img_profile || '');
          localStorage.setItem('user_id', res.user_id);
          localStorage.setItem('permissions', permsString);
          localStorage.setItem('student_code', res.student_code || '');
          localStorage.setItem('is_advisor', isAdvisorFlag ? 'true' : 'false');

          // 🌟 2. บันทึกลง Local Storage ไว้ด้วย (เผื่อได้ใช้ในหน้าฝั่งนี้)
          localStorage.setItem('advisor_id', advisorId);
          localStorage.setItem('staff_id', staffId);

          if (role === 'student') {
            this.router.navigate(['/personal-data']);
          } else {
            const encodedPerms = encodeURIComponent(permsString);

            // 🌟 3. แนบ &advisor_id=... และ &staff_id=... ต่อท้าย URL ส่งไปให้ Layout (พอร์ต 4201)
            window.location.href = `http://localhost:4201/dashboard?role=${role}&token=${tokenToSave}&user=${res.full_name}&perms=${encodedPerms}&student_code=${res.student_code || ''}&is_advisor=${isAdvisorFlag}&advisor_id=${advisorId}&staff_id=${staffId}`;
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
      }
    });
  }
}
