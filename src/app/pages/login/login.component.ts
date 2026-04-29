import { Component, inject, ChangeDetectorRef } from '@angular/core'; // เพิ่ม ChangeDetectorRef
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { SupabaseService } from '../../supabase';
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
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef); // เพิ่มตัวนี้เข้าไปบี้ Change Detection

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  loading = false;
  showErrorModal = false;
  errorMessage = '';

  closeModal() {
    this.showErrorModal = false;
    this.cdr.detectChanges(); // สั่งให้หน้าจอหายไปทันทีเมื่อปิด
  }

  async onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const { email, password } = this.loginForm.value;

    try {
      const { data, error } = await this.supabaseService.signIn(email!, password!);
     console.log("LOGIN RESULT:", data);
     console.log("LOGIN ERROR:", error);
      if (error) throw error;

      if (data.user) {
        // 1. มั่นใจว่าได้ Profile ล่าสุด (ถ้า Service มีฟังก์ชันดึงข้อมูลใหม่)
        // หรือรอให้ Service อัปเดต State ให้เสร็จ

        const { data: profile, error: profileError } =
          await this.supabaseService.refreshUserProfile(data.user.id);

        if (profileError || !profile) {
          this.errorMessage = 'ไม่สามารถดึงข้อมูลสิทธิ์การใช้งานได้';
          this.showErrorModal = true;
          return; // หยุดการทำงานถ้าดึง profile ไม่สำเร็จ
        }

        const role = profile.role?.toLowerCase().trim();

        // 2. ใช้ switch case เพื่อความอ่านง่าย
        switch (role) {
          case 'teacher':
            await this.router.navigate(['/home']);
            break;
          case 'student':
            await this.router.navigate(['/personal-data']);
            break;
          case 'admin':
            await this.router.navigate(['/system-dashboard']);
            break;
          default:
            this.errorMessage = 'ไม่พบสิทธิ์การใช้งานในระบบ หรือ Role ไม่ถูกต้อง';
            this.showErrorModal = true;
        }
      }
    } catch (err: any) {
      this.errorMessage =
        err.message === 'Invalid login credentials'
          ? 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
          : 'เกิดข้อผิดพลาดในการเชื่อมต่อ';
      this.showErrorModal = true;
    } finally {
      this.loading = false;
      this.cdr.detectChanges(); // เรียกครั้งเดียวตอนจบเพื่อ Update UI
    }
  }
}
