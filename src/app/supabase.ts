import { Injectable, signal, computed } from '@angular/core'; // เพิ่ม signal และ computed
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;

  //  สร้าง Signal เป็น "ถังเก็บข้อมูล" ประจำแอป
  // ใครอยากได้ข้อมูล Profile ก็มาดูที่ตัวแปรนี้ได้เลย
  userProfile = signal<any>(null);

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

    // (Optional) ถ้าอยากให้มันโหลดข้อมูลออโต้ตอนเปิดแอป
    this.initializeAuth();
  }

  // ฟังก์ชันพิเศษสำหรับเช็ค Auth และโหลด Profile ทันที
  private async initializeAuth() {
    const user = await this.getCurrentUser();
    if (user) {
      await this.refreshUserProfile(user.id);
    }
  }

  //  ฟังก์ชันดึงข้อมูล Profile แล้วเก็บลงถัง (Signal)
  async refreshUserProfile(userId: string) {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*, student_details(*), teacher_details(*)')
      .eq('id', userId)
      .single();

    if (!error) {
      this.userProfile.set(data); // เก็บข้อมูลลง Signal
    }
    return { data, error };
  }

  // 1. สมัครสมาชิก
  async signUp(email: string, password: string) {
    return await this.supabase.auth.signUp({ email, password });
  }

  // 2. เข้าสู่ระบบ (อัปเดต: ให้โหลด Profile ทันทีที่ล็อกอินสำเร็จ)
  async signIn(email: string, password: string) {
    const response = await this.supabase.auth.signInWithPassword({ email, password });
    if (response.data.user) {
      await this.refreshUserProfile(response.data.user.id);
    }
    return response;
  }

  // 3. ออกจากระบบ (อัปเดต: ล้างข้อมูลในถังทิ้งด้วย)
  async signOut() {
    await this.supabase.auth.signOut();
    this.userProfile.set(null); // ล้างข้อมูล Profile ในแอป
  }

  async getCurrentUser() {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    return user;
  }

  async getStudents() {
    return await this.supabase.from('students_test').select('*');
  }
}
