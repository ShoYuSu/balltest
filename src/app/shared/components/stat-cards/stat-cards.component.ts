import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stat-cards.html',
})
export class StatCardsComponent {
  // ตั้งค่าเป็น 0 เพราะยังไม่มีการเพิ่มผู้ใช้
  stats = [
    { 
      label: 'จำนวนผู้ใช้งานทั้งหมด', 
      value: 0, 
      icon: 'group', 
      bgColor: 'bg-blue-50', 
      textColor: 'text-blue-500' 
    },
    { 
      label: 'จำนวนนักศึกษา', 
      value: 0, 
      icon: 'school', 
      bgColor: 'bg-green-50', 
      textColor: 'text-green-500' 
    },
    { 
      label: 'จำนวนอาจารย์', 
      value: 0, 
      icon: 'person', 
      bgColor: 'bg-yellow-50', 
      textColor: 'text-yellow-500' 
    },
    { 
      label: 'ผู้ดูแลระบบ', 
      value: 0, 
      icon: 'assignment', 
      bgColor: 'bg-red-50', 
      textColor: 'text-red-500' 
    }
  ];
}