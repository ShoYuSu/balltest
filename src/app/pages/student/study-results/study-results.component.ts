import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-study-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './study-results.component.html',
  styleUrl: './study-results.component.css',
})
export class StudyResultsComponent {

  activeTab: 'result' | 'credit' = 'result';

  subjects = [
    { code: '101-101', name: 'การพัฒนาแอปพลิเคชันเบื้องต้น', credit: 3, grade: 'A' },
    { code: '101-102', name: 'UX/UI Design', credit: 3, grade: 'A' },
    { code: '101-103', name: 'ฐานข้อมูล', credit: 3, grade: 'A' },
    { code: '101-104', name: 'ระบบเครือข่าย', credit: 3, grade: 'B' },
    { code: '101-105', name: 'โครงงาน', credit: 3, grade: 'A' },
  ];

  creditSummary = [
    { name: 'หมวดศึกษาทั่วไป', need: 30, done: 24, remain: 6 },
    { name: 'หมวดวิชาเฉพาะ', need: 60, done: 45, remain: 15 },
    { name: 'หมวดวิชาเลือก', need: 18, done: 12, remain: 6 },
  ];

  getGradeColor(grade: string) {
    return grade === 'A'
      ? 'bg-green-100 text-green-600'
      : 'bg-blue-100 text-blue-600';
  }
}