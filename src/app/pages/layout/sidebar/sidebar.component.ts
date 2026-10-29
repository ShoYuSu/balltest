import { Component, OnInit, HostListener, inject, DestroyRef } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit {
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  userRole: string = '';

  // เก็บชื่อเมนูที่เปิดอยู่
  activeMenu: string | null = null;
  isSidebarOpen = true;

  // ตรงกับ lg: ของ Tailwind (1024px)
  private readonly collapseBreakpoint = 1024;
  private wasDesktop = true;

  toggleMenu(menuName: string) {
    this.activeMenu = this.activeMenu === menuName ? null : menuName;
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    if (!this.isSidebarOpen) {
      this.activeMenu = null; // ปิดเมนูทั้งหมดเมื่อหุบ Sidebar
    }
  }

  // ทำงานเฉพาะตอน "ข้ามเส้น" 1024px เท่านั้น
  // (กัน address bar มือถือ / การหมุนเครื่อง / เปิด DevTools มารีเซ็ต Sidebar)
  @HostListener('window:resize')
  onResize() {
    const desktop = this.isDesktop();
    if (desktop === this.wasDesktop) return;
    this.wasDesktop = desktop;
    this.isSidebarOpen = desktop;
    if (!desktop) this.activeMenu = null;
  }

  ngOnInit() {
    this.userRole = this.getRoleFromToken();
    this.wasDesktop = this.isDesktop();
    this.isSidebarOpen = this.wasDesktop;

    // จอเล็ก (มือถือ / iPad แนวตั้ง): ปิดแผงหลังเปลี่ยนหน้า
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        if (!this.isDesktop()) {
          this.isSidebarOpen = false;
          this.activeMenu = null;
        }
      });
  }

  private isDesktop(): boolean {
    return typeof window !== 'undefined' && window.innerWidth >= this.collapseBreakpoint;
  }

  // ดึง role จาก payload ของ JWT token โดยตรง
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

  // ส่ง token กลับไประบบหลัก (คนละ origin จึงไม่แชร์ localStorage)
  goBack() {
    const token = localStorage.getItem('token') || '';
    window.location.href = `http://localhost:4201/dashboard?token=${encodeURIComponent(token)}`;
  }
}