import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.html',
  styleUrl: './reports.css'
})
export class ReportsComponent {
  public reportData = [
    {
      title: 'วิทยาการคอมพิวเตอร์',
      subtitle: 'หลักสูตร',
      totalStudents: 100,
      totalAdvisors: 7,
      logo: '/assets/img/วิทยาการคอมพิวเตอร์.jpg', // เปลี่ยนเป็น path รูปของคุณ
      subCourses: [
        { name: 'วิทยาการข้อมูล', count: 50 },
        { name: 'วิศวกรรมซอฟต์แวร์', count: 50 }
      ]
    },
    {
      title: 'เทคโนโลยีการอาหาร',
      subtitle: 'หลักสูตร',
      totalStudents: 15,
      totalAdvisors: 5,
      logo: 'https://cdn-icons-png.flaticon.com/512/3081/3081918.png', // เปลี่ยนเป็น path รูปของคุณ
      subCourses: [
        { name: 'วิทยาศาสตร์และเทคโนโลยีการอาหาร', count: 15 }
      ]
    }
  ];
}