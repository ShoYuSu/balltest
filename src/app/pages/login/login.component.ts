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

  // สร้างฟอร์มและตั้งค่าการตรวจสอบ (Validation)
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  loading = false;

  async onLogin() {
    // ถ้าฟอร์มยังไม่ถูกต้อง ห้ามกดส่ง
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const { email, password } = this.loginForm.value;

    try {
      const { data, error } = await this.supabaseService.signIn(email!, password!);

      if (error) {
        alert('เข้าสู่ระบบไม่สำเร็จ: ' + error.message);
      } else {
        // เข้าสู่ระบบสำเร็จ ย้ายไปหน้า home
        this.router.navigate(['/home']);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      this.loading = false;
    }
  }
}
