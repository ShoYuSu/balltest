import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router'; // 🌟 ขาดไม่ได้
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
  private route = inject(ActivatedRoute); // 🌟 ต้องมีตัวนี้เพื่อดักจับ ?action=logout
  private cdr = inject(ChangeDetectorRef);

  isStudentPage: boolean = false;
  loginStep: 'select' | 'student' | 'teacher' = 'select';
  hidePassword = true;

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    rememberMe: new FormControl(false), // 🌟 กล่องจำรหัสเริ่มต้นเป็น false
  });

  loading = false;
  showErrorModal = false;
  errorMessage = '';

  ngOnInit() {
    // 🌟 1. ดักจับสัญญาณว่ามาจากปุ่ม Logout ของระบบเพื่อนไหม
    this.route.queryParams.subscribe((params) => {
      if (params['action'] === 'logout') {
        // ลบข้อมูลขยะเก่าออกทั้งหมด แต่เก็บ savedEmail และ savedPassword ไว้
        localStorage.removeItem('token');
        localStorage.removeItem('img_profile');
        localStorage.removeItem('full_name');

        // ล้าง URL ให้สะอาด
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      // 🌟 2. ให้โหลดรหัสผ่านที่เคยติ๊ก "จำไว้" เอามาใส่ฟอร์มรอเลย
      this.loadSavedCredentials();
    });
  }

  // 🌟 ฟังก์ชันโหลดข้อมูลที่จำไว้แบบรัดกุม
  loadSavedCredentials() {
    const savedEmail = localStorage.getItem('savedEmail');
    const savedPassword = localStorage.getItem('savedPassword');

    if (savedEmail && savedPassword) {
      try {
        this.loginForm.patchValue({
          email: savedEmail,
          password: atob(savedPassword), // ถอดรหัส Base64 คืนกลับมา
          rememberMe: true, // ติ๊กถูกที่กล่องให้ด้วยอัตโนมัติ
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

    // 🌟 ดึงรหัสผ่านมาใส่ใหม่ทุกครั้งที่กดเข้าหน้านักศึกษา/อาจารย์
    this.loadSavedCredentials();

    // ถ้าไม่มีให้จำเลย ค่อยเคลียร์ฟอร์มทิ้ง
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

            // 🌟 พระเอกอยู่ตรงนี้: จัดการจดจำรหัสผ่าน
            if (rememberMe) {
              localStorage.setItem('savedEmail', email as string);
              // เข้ารหัส Base64 ก่อนเก็บ เพื่อไม่ให้คนเห็นรหัสผ่านตรงๆ ใน F12
              localStorage.setItem('savedPassword', btoa(password as string));
            } else {
              // ถ้าไม่ได้ติ๊ก ให้ลบทิ้ง
              localStorage.removeItem('savedEmail');
              localStorage.removeItem('savedPassword');
            }

            // 🌟 บังคับเปลี่ยนรหัสผ่านตอนล็อกอินครั้งแรก (เช็คจาก flag ที่ login.php ส่งมา)
            if (res.must_change_password) {
              this.router.navigate(['/change-password'], {
                queryParams: { first: 1 },
              });
              this.loading = false;
              this.cdr.detectChanges();
              return;
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