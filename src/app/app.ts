import { Component, signal, OnInit } from '@angular/core'; // 👈 นำเข้า OnInit
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit { // 👈 ใส่ implements OnInit
  protected readonly title = signal('advisor-system');

  // ⭐️ เพิ่มฟังก์ชันนี้เพื่อรับสัญญาณเคลียร์ข้อมูลจากระบบ 4201
  ngOnInit() {
    if (window.location.href.includes('action=logout')) {
      localStorage.clear();
    }
  }
}