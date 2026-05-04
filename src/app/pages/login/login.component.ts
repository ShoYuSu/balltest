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

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  loading = false;
  showErrorModal = false;
  errorMessage = '';

  // เพิ่มฟังก์ชันปิด Modal ตรงนี้ครับ
  closeModal() {
    this.showErrorModal = false;
    this.cdr.detectChanges();
  }

  onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const { email, password } = this.loginForm.value;

    this.http.post(`${environment.apiUrl}/login.php`, { email, password }).subscribe({
      next: (res: any) => {
        if (res.success) {
          const role = res.role?.toLowerCase().trim();

          // เก็บข้อมูลลง LocalStorage เพื่อให้ Guard และ Header เรียกใช้ได้
          localStorage.setItem('token', res.token);
          localStorage.setItem('role', role);

          // เก็บชื่อและรหัสนักศึกษาเผื่อให้ Header เอาไปโชว์
          if (res.full_name) localStorage.setItem('full_name', res.full_name);
          if (res.student_code) localStorage.setItem('student_code', res.student_code);

          if (role === 'advisor' || role === 'teacher') {
            // ดีดไป Port 4201 (Advisor App)
            window.location.href = 'http://localhost:4200/home';
          } else if (role === 'student') {
            this.router.navigate(['/personal-data']);
          } else if (role === 'admin') {
            this.router.navigate(['/system-dashboard']);
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
