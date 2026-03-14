// src/app/auth.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { SupabaseService } from './supabase';

export const authGuard: CanActivateFn = async (route, state) => {
  const supabaseService = inject(SupabaseService);
  const router = inject(Router);

  // 1. เช็คก่อนว่าล็อกอินหรือยัง (ยามหน้าหมู่บ้าน)
  const user = await supabaseService.getCurrentUser();

  if (!user) {
    // ถ้าไม่ได้ล็อกอิน ไล่ไปหน้า login
    router.navigate(['/login']);
    return false;
  }

  // 2. ถ้าล็อกอินแล้ว แต่ใน "ถังข้อมูล" (Signal) ยังไม่มีข้อมูล Profile (กรณีเผลอกด Refresh หน้าจอ)
  if (!supabaseService.userProfile()) {
    await supabaseService.refreshUserProfile(user.id);
  }

  // 3. เช็คสิทธิ์ตาม Role (ยามหน้าบ้าน)
  const userProfile = supabaseService.userProfile();
  const expectedRole = route.data['role']; // ดึงค่า role ที่เราแปะไว้ใน app.routes.ts

  // ถ้าหน้านั้นระบุไว้ว่าต้องการ Role เฉพาะ (เช่น teacher) แต่เราไม่ใช่
  if (expectedRole && userProfile?.role !== expectedRole) {
    console.warn('มึงไม่มีสิทธิ์เข้าหน้านี้สัส!');

    // ดีดกลับไปหน้าโฮมที่ควรจะเป็นตาม Role ของตัวเอง
    const target = userProfile?.role === 'teacher' ? '/home' : '/personal-data';
    router.navigate([target]);
    return false;
  }

  // ผ่านทุกด่าน! เข้าไปได้เลยไอ้ชาย
  return true;
};
