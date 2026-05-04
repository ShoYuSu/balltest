import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const loginGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role')?.toLowerCase().trim() || '';

  if (token) {
    if (role === 'advisor' || role === 'teacher') {
      window.location.href = 'http://localhost:4201/home';
    } else {
      router.navigate([role === 'admin' ? '/system-dashboard' : '/personal-data']);
    }
    return false;
  }
  return true;
};
