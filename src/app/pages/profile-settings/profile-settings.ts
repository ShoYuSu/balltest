import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

interface ProfileData {
  user_id: number;
  username: string;
  full_name: string;
  email: string;
  img_profile: string | null;
}

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-settings.html',
  styleUrls: ['./profile-settings.css'],
})
export class ProfileSettingsComponent implements OnInit {
  private http = inject(HttpClient);
  private location = inject(Location);
  private cdr = inject(ChangeDetectorRef); // เพิ่มตัวนี้เพื่อสั่งให้ UI อัปเดตทันที

  loading = true;
  loadFailed = false;
  saving = false;
  changingPassword = false;

  username = '';
  fullName = '';
  email = '';
  currentImageUrl: string | null = null;

  selectedFile: File | null = null;
  previewUrl: string | null = null;

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  profileMessage = '';
  profileError = '';
  passwordMessage = '';
  passwordError = '';

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.loading = true;
    this.loadFailed = false;
    this.http
      .get<ProfileData>(`${environment.apiUrl}/get_profile.php`)
      .pipe(
        timeout(8000),
        catchError(() => of(null)),
      )
      .subscribe((data) => {
        this.loading = false;
        if (!data || (data as any).error) {
          this.loadFailed = true;
          this.profileError = 'โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง';
          this.cdr.detectChanges(); // บังคับอัปเดตหน้าจอ
          return;
        }
        this.username = data.username;
        this.fullName = data.full_name;
        this.email = data.email;
        this.currentImageUrl = this.resolveImageUrl(data.img_profile);
        
        // บังคับให้ Angular อัปเดตหน้าจอทันทีที่ข้อมูลมาถึง (แก้ปัญหาที่ต้องคลิกก่อนข้อมูลถึงจะมา)
        this.cdr.detectChanges(); 
      });
  }

  private resolveImageUrl(img: string | null): string {
    if (!img || img === 'null') {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.fullName || 'U')}&background=fff7ed&color=ea580c`;
    }
    if (img.startsWith('http')) return img;
    const cleanPath = img.startsWith('/') ? img.substring(1) : img;
    return `http://localhost:8080/api/${cleanPath}`;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;

    const file = input.files[0];
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowed.includes(file.type)) {
      this.profileError = 'รองรับเฉพาะไฟล์ JPG, PNG หรือ WEBP เท่านั้น';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      this.profileError = 'ขนาดไฟล์ต้องไม่เกิน 2MB';
      return;
    }

    this.profileError = '';
    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = () => (this.previewUrl = reader.result as string);
    reader.readAsDataURL(file);
  }

  saveProfile() {
    this.profileMessage = '';
    this.profileError = '';

    if (!this.fullName.trim() || !this.email.trim()) {
      this.profileError = 'กรุณากรอกชื่อและอีเมล';
      return;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(this.email.trim())) {
      this.profileError = 'รูปแบบอีเมลไม่ถูกต้อง';
      return;
    }

    this.saving = true;
    const formData = new FormData();
    formData.append('full_name', this.fullName.trim());
    formData.append('email', this.email.trim());
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.http
      .post<any>(`${environment.apiUrl}/update_profile.php`, formData)
      .pipe(
        timeout(15000),
        catchError(() => of({ error: 'เกิดข้อผิดพลาด ไม่สามารถบันทึกข้อมูลได้' })),
      )
      .subscribe((res) => {
        this.saving = false;
        if (res.error) {
          this.profileError = res.error;
          this.cdr.detectChanges();
          return;
        }
        if (res.token) {
          localStorage.setItem('token', res.token);
        }
        this.currentImageUrl = this.resolveImageUrl(res.img_profile);
        this.selectedFile = null;
        this.previewUrl = null;
        this.profileMessage = 'บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว';
        this.cdr.detectChanges();
      });
  }

  toggleCurrentPassword() {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  toggleNewPassword() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  changePassword() {
    this.passwordMessage = '';
    this.passwordError = '';

    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.passwordError = 'กรุณากรอกข้อมูลให้ครบถ้วน';
      return;
    }
    if (this.newPassword.length < 8) {
      this.passwordError = 'รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = 'รหัสผ่านใหม่ไม่ตรงกัน';
      return;
    }

    this.changingPassword = true;
    this.http
      .post<any>(`${environment.apiUrl}/change_password.php`, {
        current_password: this.currentPassword,
        new_password: this.newPassword,
        confirm_password: this.confirmPassword,
      })
      .pipe(
        timeout(15000),
        catchError(() => of({ success: false, message: 'เกิดข้อผิดพลาด ไม่สามารถเปลี่ยนรหัสผ่านได้' })),
      )
      .subscribe((res) => {
        this.changingPassword = false;
        if (!res.success) {
          this.passwordError = res.message || 'เกิดข้อผิดพลาด ไม่สามารถเปลี่ยนรหัสผ่านได้';
          this.cdr.detectChanges();
          return;
        }
        this.passwordMessage = res.message || 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว';
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.showCurrentPassword = false;
        this.showNewPassword = false;
        this.showConfirmPassword = false;
        this.cdr.detectChanges();
      });
  }

  goBack() {
    this.location.back();
  }
}