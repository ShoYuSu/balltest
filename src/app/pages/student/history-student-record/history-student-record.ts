import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-history-student-record',
  standalone: true,
  imports: [],
  templateUrl: './history-student-record.html',
  styleUrl: './history-student-record.css',
})
export class HistoryStudentRecord {
  student = {
    name: 'นายแข็งแร่ง ดั่งหินผา',
    en: 'Klanggang Danghyinpa',
    avatar: 'https://i.pravatar.cc/150?img=13'
  };
}
