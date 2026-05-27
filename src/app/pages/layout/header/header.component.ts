import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  userName: string = 'ผู้ใช้งาน';
  userRole: string = '';
  studentCode: string = '';
  isDropdownOpen: boolean = false;
  userImageUrl: string | null = null;

  ngOnInit() {
    // 1. ดึงค่าพื้นฐาน
    this.userName = localStorage.getItem('full_name') || 'ผู้ใช้งาน';
    this.userRole = localStorage.getItem('role')?.toLowerCase().trim() || '';
    this.studentCode =
      localStorage.getItem('student_code') || localStorage.getItem('username') || '6504800006';

    // 2. ดึงค่ารูปภาพที่เก็บไว้ตอน Login
    const savedImagePath = localStorage.getItem('img_profile');

    if (savedImagePath && savedImagePath !== 'null' && savedImagePath !== '') {
      const cleanPath = savedImagePath.startsWith('/')
        ? savedImagePath.substring(1)
        : savedImagePath;
      this.userImageUrl = `http://localhost:8080/api/${cleanPath}`;
    } else {
      // เพิ่ม UI Avatars ถ้ารูปไม่มี จะได้ดูสวยเนียนตาไปกับหน้าระบบอื่นๆ
      this.userImageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(this.userName)}&background=fff7ed&color=ea580c`;
    }
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  onLogout() {
    localStorage.clear();
    window.location.href = 'http://localhost:4200/login';
  }
}
