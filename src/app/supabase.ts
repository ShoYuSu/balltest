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
    // สั่งให้ Supabase ไปหยิบข้อมูลจากตารางที่เชื่อมกันผ่าน Foreign Key
    const { data, error } = await this.supabase
      .from('profiles')
      .select(
        `
      *,
      student_details (
        student_code,
        year_level,
        major_id
      ),
      teacher_details (
        major_id
      )
    `,
      )
      .eq('id', userId)
      .single<UserProfile>();

    if (!error) {
      this.userProfile.set(data);
    }
    return { data, error };
  }

  // 1. สมัครสมาชิก
  async signUp(email: string, password: string) {
    return await this.supabase.auth.signUp({ email, password });
  }

  // 2. เข้าสู่ระบบ (คืนค่ากลับไปที่ Component ให้ไวที่สุด)
  async signIn(email: string, password: string) {
    // ไม่ต้อง await refreshUserProfile ในนี้ เพราะมันทำให้ Response รวมช้าลง
    const response = await this.supabase.auth.signInWithPassword({ email, password });

    if (response.data.user) {
      // โหลด Profile ใส่ Signal ไว้เฉยๆ ไม่ต้องขัดจังหวะการคืนค่า Response
      this.refreshUserProfile(response.data.user.id);
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
export interface UserProfile {
  id: string;
  role: string;
  full_name: string;
  created_at: string;
  // ข้อมูลจากตาราง student_details (ถ้ามี)
  student_details?: {
    student_code: string;
    year_level: number;
    major_id: number;
    advisor_id: string;
  } | null;
  // ข้อมูลจากตาราง teacher_details (ถ้ามี)
  teacher_details?: {
    major_id: number;
  } | null;
}

