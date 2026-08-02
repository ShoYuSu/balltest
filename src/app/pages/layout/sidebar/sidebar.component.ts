import { Component, OnInit, HostListener } from '@angular/core';
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

  // จอกว้างน้อยกว่านี้ (px) ให้เริ่มต้นแบบยุบเหลือแค่ไอคอน
  private readonly collapseBreakpoint = 1024;

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

  @HostListener('window:resize')
  onResize() {
    this.applyResponsiveDefault();
  }

  ngOnInit() {
    this.userRole = this.getRoleFromToken();
    this.applyResponsiveDefault();
  }

  // ตั้งค่าเริ่มต้นตามขนาดจอ: จอเล็ก (มือถือ/แท็บเล็ต) ให้ยุบเป็นไอคอนอย่างเดียว
  private applyResponsiveDefault() {
    if (typeof window === 'undefined') return;
    this.isSidebarOpen = window.innerWidth >= this.collapseBreakpoint;
    if (!this.isSidebarOpen) {
      this.activeMenu = null;
    }
  }

  //  ดึง role จาก payload ของ JWT token โดยตรง (ไม่ต้องพึ่ง localStorage.setItem('role', ...))
  private getRoleFromToken(): string {
    const token = localStorage.getItem('token');
    if (!token) return '';

    try {
      const payloadPart = token.split('.')[1];
      if (!payloadPart) return '';

      const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = JSON.parse(decodeURIComponent(escape(atob(base64))));
      return (decoded.role || '').toLowerCase().trim();
    } catch (e) {
      console.error(' ถอดรหัส token ไม่สำเร็จ:', e);
      return '';
    }
  }

  goBack() {
    window.location.href = 'http://localhost:4201/dashboard';
  }
}