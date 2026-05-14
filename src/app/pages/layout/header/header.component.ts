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
  userImageUrl: string | null = null; // ตัวแปรเก็บ URL รูปภาพ

  ngOnInit() {
    // 1. ดึงค่าพื้นฐาน
    this.userName = localStorage.getItem('full_name') || 'ผู้ใช้งาน';
    this.userRole = localStorage.getItem('role')?.toLowerCase().trim() || '';
    this.studentCode = localStorage.getItem('student_code') || '';


    // 2. ดึงค่ารูปภาพที่เก็บไว้ตอน Login (สมมติว่าใช้คีย์ชื่อ 'student_image')
    const savedImagePath = localStorage.getItem('img_profile');

    if (savedImagePath && savedImagePath !== 'null' && savedImagePath !== '') {

      const cleanPath = savedImagePath.startsWith('/')
        ? savedImagePath.substring(1)
        : savedImagePath;

      this.userImageUrl = `http://localhost:8080/api/${cleanPath}`;
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
