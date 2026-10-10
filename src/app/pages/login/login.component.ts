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
        localStorage.removeItem('must_change_password');
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    });
  }

  // ฟังก์ชันดึงรหัสผ่านแบบแยกตาม Role
  loadSavedCredentials() {
    const roleKey = this.isStudentPage ? 'student' : 'teacher';
    const savedEmail = localStorage.getItem(`savedEmail_${roleKey}`);
    const savedPassword = localStorage.getItem(`savedPassword_${roleKey}`);

    if (savedEmail && savedPassword) {
      try {
        this.loginForm.patchValue({
          email: savedEmail,
          password: atob(savedPassword),
          rememberMe: true,
        });
      } catch (e) {
        console.error('รหัสผ่านเก่าอ่านไม่ได้ ล้างทิ้งซะเลย', e);
        localStorage.removeItem(`savedEmail_${roleKey}`);
        localStorage.removeItem(`savedPassword_${roleKey}`);
      }
    } else {
      this.loginForm.reset({ email: '', password: '', rememberMe: false });
    }
  }

  setStep(step: 'select' | 'student' | 'teacher') {
    this.loginStep = step;
    
    if (step !== 'select') {
      this.isStudentPage = step === 'student';
      //  สั่งให้ Angular วาดฟอร์มให้เสร็จก่อน
      this.cdr.detectChanges(); 
      
      //  หน่วงเวลา 50ms แล้วค่อยดึงข้อมูลมายัดใส่ฟอร์ม (กันปัญหาฟอร์มล้างค่าตัวเอง)
      setTimeout(() => {
        this.loadSavedCredentials();
        this.cdr.detectChanges();
      }, 50);

    } else {
      // กลับหน้าเลือก ให้ล้างฟอร์ม
      this.loginForm.reset({ email: '', password: '', rememberMe: false });
      this.cdr.detectChanges();
    }
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
    const roleKey = this.isStudentPage ? 'student' : 'teacher';

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

            //  บันทึกรหัสผ่านแยกลง LocalStorage
            if (rememberMe) {
              localStorage.setItem(`savedEmail_${roleKey}`, email as string);
              localStorage.setItem(`savedPassword_${roleKey}`, btoa(password as string));
            } else {
              localStorage.removeItem(`savedEmail_${roleKey}`);
              localStorage.removeItem(`savedPassword_${roleKey}`);
            }

            if (res.must_change_password) {
              localStorage.setItem('must_change_password', 'true');
            } else {
              localStorage.removeItem('must_change_password');
            }

            // นำทาง
            if (role === 'student') {
              if (res.must_change_password) {
                this.router.navigate(['/personal-data'], {
                  queryParams: { showPasswordModal: 'true' },
                });
              } else {
                this.router.navigate(['/personal-data']);
              }
            } else {
              let targetUrl = `http://localhost:4201/dashboard?token=${tokenToSave}`;
              if (res.must_change_password) {
                targetUrl += `&must_change_pwd=true`;
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