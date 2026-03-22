import { Component ,Input} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stat-cards.html',
})
export class StatCardsComponent {
  // รับข้อมูล Array จากหน้าไหนก็ได้ที่เรียกใช้
  @Input() stats: any[] = []; 
}