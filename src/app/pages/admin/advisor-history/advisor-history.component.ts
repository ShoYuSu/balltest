import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatCardsComponent } from "../../../shared/components/stat-cards/stat-cards.component";
import { TableColumnModel } from '../../../shared/components/stat-cards/models/table-option';

@Component({
  selector: 'app-advisor-history',
  standalone: true,
  imports: [StatCardsComponent, CommonModule],
  templateUrl: './advisor-history.html',
  styleUrl: './advisor-history.css',
})
export class AdvisorHistoryComponent {
  // สถานะสำหรับเปิด/ปิด Modal และเก็บข้อมูลนักศึกษาที่เลือก
  isModalOpen = false;
  selectedStudent: any = null;

  public myStats = [
    { label: 'นักศึกษาทั้งหมด', value: 5, icon: 'group', bgColor: 'bg-blue-100', textColor: 'text-blue-600', cardBg: 'bg-[#F3FBFF]' },
    { label: 'วิทยาการคอมพิวเตอร์', value: 3, icon: 'school', bgColor: 'bg-green-100', textColor: 'text-green-600', cardBg: 'bg-[#F5FFFA]' },
    { label: 'เทคโนโลยีการอาหาร', value: 2, icon: 'person', bgColor: 'bg-yellow-100', textColor: 'text-yellow-600', cardBg: 'bg-[#FFF9E5]' },
  ];

  public columns: TableColumnModel[] = [
    // เปลี่ยน tag เป็น 'avatar-text' เพื่อให้หายแดงตามเงื่อนไขของ Interface
    { columnDef: "name", header: "ชื่อนักศึกษา", tag: "name", display: true, width: "large", cell: (el) => el },
    { columnDef: "id", header: "รหัสนักศึกษา", tag: "text", align: "center", display: true, width: "medium", cell: (el) => el.id },
    { columnDef: "department", header: "ภาควิชา", tag: "text", align: "center", display: true, width: "medium", cell: (el) => el.department },
    { columnDef: "advisor", header: "ที่ปรึกษาปัจจุบัน", tag: "text", align: "center", display: true, width: "large", cell: (el) => el.advisor },
    { columnDef: "view", header: "ดูประวัติ", tag: "icon", align: "center", display: true, width: "small", cell: (el) => 'visibility' },
  ];

  public students = [
    { 
      name: 'นายปิยบุตร เลิศวรจักร', 
      id: '65130001', 
      department: 'วิทยาการคอมพิวเตอร์', 
      advisor: 'อาจารย์ ดร.ธนพล ชัยมงคล', 
      img: 'https://ui-avatars.com/api/?name=Piyabut+L&background=random',
      history: [
        { year: 'ปี 1', name: 'อ.สมหญิง รักการสอน', color: 'bg-[#E8F5E9]', textColor: 'text-[#4CAF50]' },
        { year: 'ปี 2', name: 'อ.ดร.สมชาย วิทยกร', color: 'bg-[#E3F2FD]', textColor: 'text-[#2196F3]' },
        { year: 'ปี 3', name: 'อ.ดร.สมชาย วิทยกร', color: 'bg-[#F3E5F5]', textColor: 'text-[#9C27B0]' }
      ]
    },
    { 
      name: 'นางสาววรินดา เตชะวนิช', 
      id: '66130003', 
      department: 'เทคโนโลยีการอาหาร', 
      advisor: 'อาจารย์ ดร.ปิยาภรณ์ แสงแก้ว', 
      img: '/assets/img/🏎.jpg',
      history: [
        { year: 'ปี 1', name: 'อ.ใจดี มีสุข', color: 'bg-[#E8F5E9]', textColor: 'text-[#4CAF50]' },
        { year: 'ปี 2', name: 'อ.ใจดี มีสุข', color: 'bg-[#E3F2FD]', textColor: 'text-[#2196F3]' }
      ]
    },
    { 
      name: 'นายอัครพล สุวรรณเมธานนท์', 
      id: '6801234567', 
      department: 'วิทยาการคอมพิวเตอร์', 
      advisor: 'อาจารย์ ดร.สมชาย พัฒนกิจ', 
      img: '/assets/img/แว่น.jpg',
      history: [
        { year: 'ปี 1', name: 'อ.สมชาย พัฒนกิจ', color: 'bg-[#E8F5E9]', textColor: 'text-[#4CAF50]' }
      ]
    },
    { 
      name: 'นางสาวชลดา พิพัฒน์ไพศาล', id: '6801234567', department: 'เทคโนโลยีการอาหาร', advisor: 'อาจารย์ ดร.สุภาวดี จันทร์ศรี', img: '/assets/img/อ้วน.jpg',
      history: [{ year: 'ปี 1', name: 'อ.สุภาวดี จันทร์ศรี', color: 'bg-[#E8F5E9]', textColor: 'text-[#4CAF50]' }]
    },
    { 
      name: 'นางสาวอริสรา ใจดี', id: '67130005', department: 'วิทยาการคอมพิวเตอร์', advisor: 'อาจารย์ ดร.วิทยา ศิริวัฒน์', img: '/assets/img/masha__.jpg',
      history: [{ year: 'ปี 1', name: 'อ.วิทยา ศิริวัฒน์', color: 'bg-[#E8F5E9]', textColor: 'text-[#4CAF50]' }]
    },
  ];

  openHistory(student: any) {
    this.selectedStudent = student;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedStudent = null;
  }
}