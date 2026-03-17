import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { SupabaseService } from './supabase';

// src/app/login-guard.ts
export const loginGuard: CanActivateFn = async (route, state) => {
  const supabaseService = inject(SupabaseService);
  const router = inject(Router);

  const user = await supabaseService.getCurrentUser();

  if (user) {
    if (!supabaseService.userProfile()) {
      await supabaseService.refreshUserProfile(user.id);
    }

    const userProfile = supabaseService.userProfile();
    // ดึง role ออกมาแบบตัดช่องว่างและทำให้เป็นตัวเล็ก จะได้เช็คไม่พลาด
    const role = userProfile?.role?.toLowerCase().trim() || '';

    console.log('LoginGuard: ข้อมูล Role ของคุณคือ:', role); // ดูที่ Console ว่ามันออกมาเป็น 'admin' จริงไหม

    const roleRedirects: Record<string, string> = {
      admin: '/system-dashboard',
      teacher: '/home', // เช็คให้ตรงกับ path ใน app.routes.ts
      student: '/personal-data',
    };

    const target = roleRedirects[role] || '/personal-data';

    // ใส่ await ตรงนี้ตามที่ IDE ฟ้อง และมันจะทำงานได้ถูกต้อง
    await router.navigate([target]);
    return false;
  }

  return true;
};
