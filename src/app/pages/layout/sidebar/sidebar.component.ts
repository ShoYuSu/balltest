import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SupabaseService } from '../../../supabase';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  public supabaseService = inject(SupabaseService);

  // เพิ่มตัวแปรสำหรับเช็กสถานะการเปิด/ปิดเมนูย่อย
  isAppointmentOpen = false;

  // ฟังก์ชันสลับการเปิด/ปิด
  toggleAppointmentMenu() {
    this.isAppointmentOpen = !this.isAppointmentOpen;
  }
}
