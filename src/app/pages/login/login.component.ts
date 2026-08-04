import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router'; 
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
  private route = inject(ActivatedRoute); 
  private cdr = inject(ChangeDetectorRef);

  isStudentPage: boolean = false;
  loginStep: 'select' | 'student' | 'teacher' = 'select';
  hidePassword = true;

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    rememberMe: new FormControl(false), 
  });

  loading = false;
  showErrorModal = false;
  errorMessage = '';

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['action'] === 'logout') {
        localStorage.removeItem('token');
        localStorage.removeItem('img_profile');
        localStorage.removeItem('full_name');
        localStorage.removeItem('must_change_password'); // ล้างสถานะเผื่อไว้
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      this.loadSavedCredentials();
    });
  }

  loadSavedCredentials() {
    const savedEmail = localStorage.getItem('savedEmail');
    const savedPassword = localStorage.getItem('savedPassword');

    if (savedEmail && savedPassword) {
      try {
        this.loginForm.patchValue({
          email: savedEmail,
          password: atob(savedPassword), 
          rememberMe: true, 
        });
      } catch (e) {
        console.error('รหัสผ่านเก่าอ่านไม่ได้ ล้างทิ้งซะเลย', e);
        localStorage.removeItem('savedEmail');
        localStorage.removeItem('savedPassword');
      }
    }
  }

  setStep(step: 'select' | 'student' | 'teacher') {
    this.loginStep = step;
    this.isStudentPage = step === 'student';

    this.loadSavedCredentials();
    if (!localStorage.getItem('savedEmail')) {
      this.loginForm.reset({ email: '', password: '', rememberMe: false });
    }
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

            if (rememberMe) {
              localStorage.setItem('savedEmail', email as string);
              localStorage.setItem('savedPassword', btoa(password as string));
            } else {
              localStorage.removeItem('savedEmail');
              localStorage.removeItem('savedPassword');
            }

            // 🌟 1. ดักเก็บ LocalStorage สำหรับโปรเจกต์นี้ 
            if (res.must_change_password) {
              localStorage.setItem('must_change_password', 'true');
            } else {
              localStorage.removeItem('must_change_password');
            }

            // 🌟 2. แนบ Parameter ข้ามโปรเจกต์ไปให้เพื่อน
            if (role === 'student') {
              this.router.navigate(['/personal-data']);
            } else {
              let targetUrl = `http://localhost:4201/dashboard?token=${tokenToSave}`;
              if (res.must_change_password) {
                targetUrl += `&must_change_pwd=true`; // ส่งสัญญาณบังคับเปลี่ยนรหัส
              }
              window.location.href = targetUrl;
            }
          } else {
            this.errorMessage = res.message;
            this.showErrorModal = true;
          }
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.errorMessage = 'การเชื่อมต่อผิดพลาด';
          this.showErrorModal = true;
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }
}