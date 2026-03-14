import { Component, OnInit, signal } from '@angular/core'; // ใช้ Signal
import { RouterModule } from '@angular/router';
import { SupabaseService } from '../../../supabase';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule], // ไม่ต้องมี CommonModule แล้ว!
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  // สร้าง Signal เพื่อเก็บรายชื่อนักศึกษา
  students = signal<any[]>([]);

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    const { data, error } = await this.supabase.getStudents();

    if (error) {
      console.error('พังดิครับ:', error.message);
    } else if (data) {
      // อัปเดตข้อมูลลงใน Signal
      this.students.set(data);
    }
  }
}
