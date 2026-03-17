// src/app/auth.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { SupabaseService } from './supabase';

// src/app/auth.guard.ts
export const authGuard: CanActivateFn = async (route, state) => {
  const supabaseService = inject(SupabaseService);
  const router = inject(Router);

  const user = await supabaseService.getCurrentUser();
  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  if (!supabaseService.userProfile()) {
    await supabaseService.refreshUserProfile(user.id);
  }

  const userProfile = supabaseService.userProfile();
  // แปลง Role ทั้งคู่เป็นตัวพิมพ์เล็ก และตัดช่องว่างทิ้งก่อนเช็ค
  const currentRole = userProfile?.role?.toLowerCase().trim();
  const expectedRole = route.data['role']?.toLowerCase().trim();

  // ถ้าหน้าจอนี้ระบุ Role และ Role ของเราไม่ตรง
  if (expectedRole && currentRole !== expectedRole) {
    console.error(`[Guard] สิทธิ์ไม่ตรง: ต้องการ ${expectedRole} แต่คุณคือ ${currentRole}`);

    await supabaseService.signOut();
    router.navigate(['/login']);
    return false;
  }

  return true;
};
