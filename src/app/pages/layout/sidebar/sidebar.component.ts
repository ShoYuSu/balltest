import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit {
  userRole: string = '';
  isAppointmentOpen = false;
  toggleAppointmentMenu() {
    this.isAppointmentOpen = !this.isAppointmentOpen;
  }
  ngOnInit() {
    // ดึง Role จาก LocalStorage ที่เราเก็บไว้ตอนล็อกอินผ่าน XAMPP มาใช้งาน
    this.userRole = localStorage.getItem('role')?.toLowerCase().trim() || '';
  }
}
