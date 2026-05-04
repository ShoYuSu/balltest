import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-plo-evaluation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './plo-evaluation.component.html',
  styleUrl: './plo-evaluation.component.css',
})
export class PloEvaluationComponent {

  overall = {
    progress: 50,
    text: 'ผ่านแล้ว 3 จาก 6 ข้อ',
    status: 'สถานะโดยรวม: รอการประเมินผล'
  };

  plos = [
    {
      title: 'PLO1: ประยุกต์ใช้ความรู้',
      percent: 100,
      status: 'บรรลุผลตามเกณฑ์',
      color: 'green'
    },
    {
      title: 'PLO2: ประยุกต์ใช้ด้านการบริหาร',
      percent: 100,
      status: 'บรรลุผลตามเกณฑ์',
      color: 'green'
    },
    {
      title: 'PLO3: สร้างต้นแบบนวัตกรรม',
      percent: 100,
      status: 'บรรลุผลตามเกณฑ์',
      color: 'green'
    },
    {
      title: 'PLO4: การออกแบบและนำเสนอ',
      percent: 60,
      status: 'รอการประเมิน',
      color: 'yellow'
    },
    {
      title: 'PLO5: มีทักษะการสื่อสาร',
      percent: 0,
      status: 'ยังไม่ประเมิน',
      color: 'gray'
    },
    {
      title: 'PLO6: มีวินัย คุณธรรม',
      percent: 0,
      status: 'ยังไม่ประเมิน',
      color: 'gray'
    },
  ];

  getBarColor(color: string) {
    if (color === 'green') return 'bg-green-500';
    if (color === 'yellow') return 'bg-yellow-400';
    return 'bg-gray-300';
  }

  getStatusColor(color: string) {
    if (color === 'green') return 'bg-green-100 text-green-600';
    if (color === 'yellow') return 'bg-yellow-100 text-yellow-600';
    return 'bg-gray-100 text-gray-500';
  }
}