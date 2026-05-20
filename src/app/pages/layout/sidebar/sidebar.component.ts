import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit {
  userRole: string = '';

  // เปลี่ยนจาก boolean เป็น string เพื่อเก็บชื่อเมนูที่เปิดอยู่
  activeMenu: string | null = null;
  isSidebarOpen = true;

  // ฟังก์ชันเดียวจัดการเปิด-ปิด โดยเช็คชื่อเมนู
  toggleMenu(menuName: string) {
    if (this.activeMenu === menuName) {
      this.activeMenu = null; // ถ้ากดซ้ำเมนูเดิม ให้ปิด
    } else {
      this.activeMenu = menuName; // เปิดเมนูที่เลือก
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    if (!this.isSidebarOpen) {
      this.activeMenu = null; // ปิดเมนูทั้งหมดเมื่อหุบ Sidebar
    }
  }

  ngOnInit() {
    this.userRole = localStorage.getItem('role')?.toLowerCase().trim() || '';
  }

  goBack() {
    window.location.href = 'http://localhost:4201/admin/dashboard';
  }
}
