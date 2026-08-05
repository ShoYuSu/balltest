import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  // 1. ถ้าไม่มี Token ดีดกลับหน้า Login
  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  // 2. เช็กสถานะบังคับเปลี่ยนรหัสผ่านจาก LocalStorage
  const userJson = localStorage.getItem('user');
  if (userJson) {
    const user = JSON.parse(userJson);
    
    if (user.must_change_password === 1) {
      // ถ้ายังไม่เปลี่ยนรหัส และตอนนี้ไม่ได้อยู่หน้า change-password
      if (!state.url.includes('change-password')) {
        router.navigate(['/change-password']); // บังคับดึงกลับมาหน้านี้
        return false;
      }
    }
  }

  return true;
};