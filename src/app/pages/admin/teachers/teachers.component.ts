import { Component } from '@angular/core';
import { StatCardsComponent } from "../../../shared/components/stat-cards/stat-cards.component";
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-teachers',
  imports: [StatCardsComponent, ButtonComponent],
  templateUrl: './teachers.html',
  styleUrl: './teachers.css',
})
export class TeachersComponent {
 myStats = [
    { label: 'อาจารย์ทั้งหมด', 
      value: 0, icon: 'group', 
      bgColor: 'bg-blue-100', 
      textColor: 'text-blue-600',
      cardBg: 'bg-[#F3FBFF]' 
    },
    { label: 'เป็นที่ปรึกษา', 
      value: 0, icon: 'school',
      bgColor: 'bg-green-100', 
      textColor: 'text-green-600',
      cardBg: 'bg-[#F5FFFA]'

      },
    { label: 'นักศึกษาในที่ปรึกษาทั้งหมด',
      value: 0, icon: 'person', 
      bgColor: 'bg-yellow-100', 
      textColor: 'text-yellow-600',
      cardBg: 'bg-[#FFF9E5]' 
       },
    
  ];
  someOtherFunction() {
    console.log('ปุ่มเพิ่มอาจารย์ถูกคลิก!');
    // คุณสามารถเพิ่มฟังก์ชันการทำงานอื่น ๆ ที่นี่ได้ เช่น เปิด Modal หรือไปยังหน้าอื่น
  }
}
