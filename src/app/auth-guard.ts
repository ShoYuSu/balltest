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

  // 🌟 ลบการบล็อก must_change_password ออกไปเลย ปล่อยให้นักศึกษาไปหน้า personal-data ได้อิสระ
  
  return true;
};