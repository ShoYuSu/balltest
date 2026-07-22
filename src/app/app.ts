import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly title = signal('advisor-system');

  ngOnInit() {
    // 🌟 เช็คว่ามีคำว่า action=logout อยู่ใน URL ไหม
    if (typeof window !== 'undefined' && window.location.search.includes('action=logout')) {
      // 🚨 ลบแค่ข้อมูลล็อกอิน (ห้ามใช้ clear() เด็ดขาด เดี๋ยวรหัสที่จำไว้บิน!)
      localStorage.removeItem('token');
      localStorage.removeItem('img_profile');
      localStorage.removeItem('full_name');

      // 🧹 ล้างคำว่า ?action=logout ออกจาก URL ให้สะอาดตา
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }
}
