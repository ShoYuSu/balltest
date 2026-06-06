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

    console.log('1. กำลังส่งข้อมูลไป API...', { email, login_type: this.isStudentPage ? 'student' : 'staff' });

    this.http.post(`${environment.apiUrl}/login.php`, { email, password, login_type: this.isStudentPage ? 'student' : 'staff' }).subscribe({
      next: (res: any) => {
        console.log('2. API ตอบกลับมาว่า:', res);

        if (res.success) {
          const role = res.role?.toLowerCase().trim();
          console.log('3. ล็อกอินสำเร็จ Role คือ:', role);

          const tokenToSave = res.token ? res.token : 'fake-token-for-test';
          
          // ⭐️ เก็บข้อมูลสิทธิ์ (Permissions) จาก API (ถ้ามี)
          const permissions = res.permissions || [];

          // 1. เก็บข้อมูลลง LocalStorage ของ 4200 ด้วย
          localStorage.setItem('token', tokenToSave);
          localStorage.setItem('role', role);
          localStorage.setItem('full_name', res.full_name || '');
          localStorage.setItem('img_profile', res.img_profile || '');
          localStorage.setItem('user_id', res.user_id);
          localStorage.setItem('permissions', JSON.stringify(permissions)); // เซฟสิทธิ์ลงเครื่อง

          console.log('4. เซฟลง LocalStorage เสร็จแล้ว กำลังจะเปลี่ยนหน้า...');

          // 2. ตรวจสอบเงื่อนไขการไปหน้าต่างๆ
          if (role === 'student') {
            console.log('5. ไปหน้านักศึกษา...');
            this.router.navigate(['/personal-data']);
          } else {
            console.log('5. เตะไปหาพอร์ต 4201...');
            
            // ⭐️ แปลง Array ของสิทธิ์ให้เป็นข้อความยาวๆ เพื่อแนบไปกับ URL
            const permsString = encodeURIComponent(JSON.stringify(permissions));
            
            // ส่งไปพอร์ต 4201 พร้อมแนบสิทธิ์ (&perms=...) ไปด้วย
            window.location.href = `http://localhost:4201/dashboard?role=${role}&token=${tokenToSave}&user=${res.full_name}&perms=${permsString}`;
          }

        } else {
          console.log('❌ ล็อกอินไม่ผ่าน:', res.message);
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