import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // 👈 เพิ่มบรรทัดนี้

@Component({
  selector: 'app-advisor-record',
  standalone: true,
  imports: [CommonModule], // 👈 ต้องมีตรงนี้
  templateUrl: './advisor-record.html',
  styleUrl: './advisor-record.css',
})
export class AdvisorRecord {
   currentYear = 2026;

  months = [
    'JAN','FEB','MAR','APR','MAY','JUN',
    'JUL','AUG','SEP','OCT','NOV','DEC'
  ];

  activeMonth = 'JAN';

  selectMonth(m: string) {
    this.activeMonth = m;
  }
}
