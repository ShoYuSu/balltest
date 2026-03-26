import { Component } from '@angular/core';
import { StatCardsComponent } from '../../../shared/components/stat-cards/stat-cards.component';

@Component({
  selector: 'app-students',
  imports: [StatCardsComponent],
  templateUrl: './students.html',
  styleUrl: './students.css',
})
export class Students {
  studentStats = [
    { label: 'นักศึกษาทั้งหมด', value: 0, icon: 'school', bgColor: 'bg-green-50', textColor: 'text-green-600' },
    { label: 'มีที่ปรึกษาแล้ว', value: 0, icon: 'person', bgColor: 'bg-yellow-50', textColor: 'text-yellow-600' },
    { label: 'ยังไม่มีที่ปรึกษา', value: 0, icon: 'person_off', bgColor: 'bg-red-50', textColor: 'text-red-600' },

  ];
}
