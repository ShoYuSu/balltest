import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { SupabaseService } from './supabase';

export const loginGuard: CanActivateFn = async (route, state) => {
  const supabaseService = inject(SupabaseService);
  const router = inject(Router);

  // เช็คว่าล็อกอินค้างอยู่ไหม
  const user = await supabaseService.getCurrentUser();

  if (user) {
    // ถ้าล็อกอินอยู่แล้ว "ห้ามเข้า" หน้า Login ให้เด้งไปหน้า Home แทน
    router.navigate(['/home']);
    return false;
  } else {
    // ถ้ายังไม่ได้ล็อกอิน ให้เข้าหน้า Login ได้ตามปกติ
    return true;
  }
};
