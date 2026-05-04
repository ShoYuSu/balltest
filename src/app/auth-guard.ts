import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (!token) {
    // ถ้าไม่มีตั๋ว ดีดกลับไปหน้าล็อกอินแอปหลัก[cite: 1]
    router.navigate(['/login']);
    return false;
  }
  return true;
};
