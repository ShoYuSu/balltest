import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const loginGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // ⭐️ 1. ดักจับจาก Query Parameter โดยตรง (ชัวร์ 100%)
if (window.location.href.includes('action=logout')) {
    localStorage.clear(); 
    window.location.href = 'http://localhost:4200/login'; 
    return false; 
  }

  // 2. การเช็ค Token ปกติ (สำหรับตอนล็อกอิน)
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role')?.toLowerCase().trim() || '';

  if (token) {
    // ถ้ามี Token ค้างอยู่ ให้แยกว่าใครไปไหน
    if (role === 'admin' || role === 'teacher' || role === 'advisor') {
      window.location.href = 'http://localhost:4201/dashboard';
    } else {
      router.navigate(['/personal-data']);
    }
    return false;
  }
  
  // ถ้าไม่มี Token (โดนล้างไปแล้ว) ก็ให้เข้าหน้า Login ได้ปกติ
  return true;
};