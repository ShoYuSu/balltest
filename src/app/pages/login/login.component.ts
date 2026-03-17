import { Component, inject } from '@angular/core';
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

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  loading = false;

  async onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const { email, password } = this.loginForm.value;

    try {
      // 1. เรียกใช้ signIn ที่เราแก้ใหม่ (ซึ่งมันจะโหลด Profile ลง Signal ให้เสร็จสรรพ)
      const { data, error } = await this.supabaseService.signIn(email!, password!);

      if (error) {
        alert('เข้าสู่ระบบไม่สำเร็จ: ' + error.message);
      } else {
        // 2. ดึงค่า Role จาก Signal ใน Service มาเช็คทางแยก
        // มึงต้องแน่ใจนะว่าใน Database มึงใส่ role เป็น 'teacher' หรือ 'student' (ตัวเล็กหมด)
        const userProfile = this.supabaseService.userProfile();
        const role = userProfile?.role;

        console.log('Login สำเร็จ! Role ของมึงคือ:', role);

        // 3. ทำทางแยก (Conditional Routing)
        if (role === 'teacher') {
          await this.router.navigate(['/home']); // หน้าของอาจารย์
        } else if (role === 'student') {
          await this.router.navigate(['/personal-data']); // หน้าของนักเรียน
        } else if (role === 'admin') {
          //
          await this.router.navigate(['/system-dashboard']); // หน้า admin
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      this.loading = false;
    }
  }
}
