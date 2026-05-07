import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common'; // เพิ่ม CommonModule เพื่อใช้ [class]

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule], // เพิ่ม CommonModule ตรงนี้
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit {
  userRole: string = '';
  isAppointmentOpen = false;
  
  // เพิ่มตัวแปรควบคุมการ เปิด/ปิด Sidebar
  isSidebarOpen = true; 

  toggleAppointmentMenu() {
    this.isAppointmentOpen = !this.isAppointmentOpen;
  }

  // เพิ่มฟังก์ชันสลับสถานะ Sidebar
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  ngOnInit() {
    this.userRole = localStorage.getItem('role')?.toLowerCase().trim() || '';
  }
  
 goBack() {
    // คำสั่งย้อนกลับไปหน้าก่อนหน้า (หน้าเดิมของเพื่อน)
    window.location.href = 'http://localhost:4201/admin/dashboard';
  }
}