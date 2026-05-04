import { Component, OnInit, signal, inject } from '@angular/core'; // เพิ่ม inject เข้ามา
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http'; // ใช้ HttpClient แทน Supabase
import { StatCardsComponent } from '../../../shared/components/stat-cards/stat-cards.component';
import { environment } from '../../../../environments/environment'; // เช็ค Path ให้ตรงกับโฟลเดอร์ environments นะพี่

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, StatCardsComponent], // ไม่ต้องมี CommonModule
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  private http = inject(HttpClient); // Inject HTTP เข้ามาใช้งาน

  dashboardStats = [
    {
      label: 'นักศึกษาที่ดูแลทั้งหมด',
      value: 0,
      icon: 'group',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      cardBg: 'bg-[#F3FBFF]',
    },
    {
      label: 'ผ่าน PLO ทั้งหมด',
      value: 0,
      icon: 'school',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      cardBg: 'bg-[#F5FFFA]',
    },
    {
      label: 'นัดหมายทั้งหมด',
      value: 0,
      icon: 'person',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600',
      cardBg: 'bg-[#FFFDF0]',
    },
    {
      label: 'บันทึกการบึกษา',
      value: 0,
      icon: 'assignment',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      cardBg: 'bg-[#FFF5FE]',
    },
  ];

  // Mock ข้อมูลนักศึกษาในความดูแล
  studentsInCare = signal([
    {
      id: '6501230567',
      name: 'นายสมศักดิ์ ทดสอบ',
      year: 1,
      gpa: 3.45,
      status: 'รออนุมัติ',
      ploStatus: 'PLO รอประเมิน',
      img: 'https://i.pravatar.cc/150?u=1',
    },
    {
      id: '6501230568',
      name: 'นางสาวหญิง ทดลอง',
      year: 1,
      gpa: 3.78,
      status: 'อนุมัติแล้ว',
      ploStatus: 'PLO ผ่าน',
      img: 'https://i.pravatar.cc/150?u=2',
    },
    {
      id: '6501230569',
      name: 'นายวิชัย สมบูรณ์',
      year: 1,
      gpa: 3.21,
      status: 'รออนุมัติ',
      ploStatus: 'PLO ไม่ผ่าน',
      img: 'https://i.pravatar.cc/150?u=3',
    },
    {
      id: '6501230570',
      name: 'นางสาวพิมพ์ชนก ดีงาม',
      year: 1,
      gpa: 3.92,
      status: 'อนุมัติแล้ว',
      ploStatus: 'PLO ผ่าน',
      img: 'https://i.pravatar.cc/150?u=4',
    },
    {
      id: '6501230571',
      name: 'นายธนากร รุ่งเรือง',
      year: 1,
      gpa: 3.56,
      status: 'อนุมัติแล้ว',
      ploStatus: 'PLO ผ่าน',
      img: 'https://i.pravatar.cc/150?u=5',
    },
  ]);

  // Mock ข้อมูลการนัดหมาย
  appointments = signal([
    {
      name: 'นางสาวจุวาวิน วาวิวา',
      id: '6501234567',
      type: 'อาชีพ/ฝึกงาน',
      topic: 'ปรึกษาเรื่องการเตรียมตัวฝึกงาน',
      date: '18 ม.ค. 2569',
      time: '14:00 น.',
      img: 'https://i.pravatar.cc/150?u=8',
    },
    {
      name: 'นายสมศักดิ์ ทดสอบ',
      id: '6501234567',
      type: 'วิชาการ',
      topic: 'ปรึกษาเรื่องลงทะเบียนเรียนเทอมหน้า',
      note: 'แนะนำให้ลงวิชา Advanced ........',
      date: '5 ม.ค. 2569',
      time: '10:00 น.',
      img: 'https://i.pravatar.cc/150?u=1',
    },
    {
      name: 'วิชัย เก่งมาก',
      id: '6501234567',
      type: 'วิชาการ',
      topic: 'ปรึกษาเรื่องปัญหาส่วนตัวที่กระทบการเรียน',
      note: 'แนะนำให้ลงวิชา Advanced Programming และ......',
      date: '5 ม.ค. 2569',
      time: '10:00 น.',
      img: 'https://i.pravatar.cc/150?u=3',
    },
  ]);

  students = signal<any[]>([]);

  ngOnInit() {
    // ยิง API ไปที่ XAMPP แทน Supabase
    this.http.get(`${environment.apiUrl}/get_students.php`).subscribe({
      next: (data: any) => {
        // อัปเดตข้อมูลลงใน Signal
        this.students.set(data);
      },
      error: (error) => {
        console.error('พังดิครับ:', error.message);
      },
    });
  }
}
