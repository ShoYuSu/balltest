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
  // สร้างตัวแปรมารอรับค่าแทน Supabase
  userName: string = 'ผู้ใช้งาน';
  userRole: string = '';
  studentCode: string = '';
  isDropdownOpen: boolean = false;

  ngOnInit() {
    // ดึงค่าจากที่ XAMPP ส่งมาเก็บไว้ตอนล็อกอิน
    this.userName = localStorage.getItem('full_name') || 'ผู้ใช้งาน';
    this.userRole = localStorage.getItem('role')?.toLowerCase().trim() || '';
    this.studentCode = localStorage.getItem('student_code') || '';
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  onLogout() {
    localStorage.clear();
    // ดีดกลับหน้า Login ของพอร์ต 4200
    window.location.href = 'http://localhost:4200/login';
  }
}
