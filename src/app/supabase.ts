import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    // สร้างการเชื่อมต่อกับ Supabase โดยดึงค่าจาก environment
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }
  // ฟังก์ชันสำหรับดึงรายชื่อนักศึกษาทั้งหมด
  async getStudents() {
    const { data, error } = await this.supabase
      .from('students_test') // ชื่อตารางที่เราสร้างเมื่อกี้
      .select('*'); // ดึงทุก Column

    return { data, error };
  }


  // 1. สมัครสมาชิกใหม่ (Sign Up)
  async signUp(email: string, password: string) {
    return await this.supabase.auth.signUp({ email, password });
  }

  // 2. เข้าสู่ระบบ (Sign In)
  async signIn(email: string, password: string) {
    return await this.supabase.auth.signInWithPassword({ email, password });
  }

  // 3. ออกจากระบบ (Sign Out)
  async signOut() {
    return await this.supabase.auth.signOut();
  }

  // 4. ดึงข้อมูล User ปัจจุบัน (ดูว่าใครล็อคอินอยู่)
  get user(): User | null {
    // ดึงข้อมูลจาก Session ปัจจุบัน
    const session = this.supabase.auth.getSession();
    // ถ้าอยากได้ข้อมูลแบบ Real-time แนะนำให้ใช้ auth.onAuthStateChange ในอนาคต
    return null; // เดี๋ยวพี่สอนวิธีทำแบบละเอียดตอนเริ่มเขียนหน้า UI ครับ
  }

  // --- ระบบจัดการข้อมูล (Database) ---

  // ตัวอย่าง: ดึงข้อมูลจากตาราง (เดี๋ยวเราค่อยมาเขียนเพิ่มกัน)
  async getTableData(tableName: string) {
    return await this.supabase.from(tableName).select('*');
  }
  //เช็ค user ว่าล็อคอินอยู่ไหม
  async getCurrentUser() {
    const { data: { user } } = await this.supabase.auth.getUser();
    return user;
  }
}
