import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { SupabaseService } from './supabase';

export const authGuard: CanActivateFn = async (route, state) => {
  const supabaseService = inject(SupabaseService);
  const router = inject(Router);

  // 1. ตรวจสอบว่ามีการล็อกอินอยู่ไหม
  const user = await supabaseService.getCurrentUser();

  if (user) {
    return true; // ล็อกอินแล้ว ให้ผ่านไปได้
  } else {
    // ยังไม่ได้ล็อกอิน ให้เด้งไปหน้า login
    router.navigate(['/login']);
    return false;
  }
};
