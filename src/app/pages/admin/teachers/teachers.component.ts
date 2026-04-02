import { Component } from '@angular/core';
import { StatCardsComponent } from "../../../shared/components/stat-cards/stat-cards.component";

@Component({
  selector: 'app-teachers',
  imports: [StatCardsComponent],
  templateUrl: './teachers.html',
  styleUrl: './teachers.css',
})
export class TeachersComponent {
 myStats = [
    { label: 'อาจารย์ทั้งหมด', value: 0, icon: 'group', bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
    { label: 'เป็นที่ปรึกษา', value: 0, icon: 'school', bgColor: 'bg-green-50', textColor: 'text-green-600' },
    { label: 'นักศึกษาในที่ปรึกษาทั้งหมด', value: 0, icon: 'person', bgColor: 'bg-yellow-50', textColor: 'text-yellow-600' }
  ];
}
