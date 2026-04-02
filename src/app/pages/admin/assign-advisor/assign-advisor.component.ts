import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-assign-advisor',
  imports: [CommonModule, FormsModule],
  templateUrl: './assign-advisor.html',
})
export class AssignAdvisorComponent implements OnInit {
  
  // ข้อมูลสมมติ
  advisors = [
    { id: 1, name: 'อ.ดร.สมชาย วิทยกร', dept: 'วิทยาการคอมพิวเตอร์', code: 'CS', image: 'assets/avatar1.png' },
    { id: 2, name: 'อ.สมหญิง รักการสอน', dept: 'เทคโนโลยีการอาหาร', code: 'FT', image: 'assets/avatar2.png' },
    { id: 3, name: 'ผศ.ดร.มานพ ใจกล้า', dept: 'วิทยาการคอมพิวเตอร์', code: 'CS', image: 'assets/avatar3.png' },
  ];

  selectedAdvisor: any = null;
  selectedBranch: string = 'ทุกสาขา';
  
  // Modal State
  showDeleteModal = false;
  targetToDelete: any = null;

  ngOnInit() {}

  selectAdvisor(advisor: any) {
    this.selectedAdvisor = advisor;
  }

  // ฟังก์ชันเรียก Modal ยืนยันการลบ (แทน window.confirm)
  confirmDelete(item: any) {
    this.targetToDelete = item;
    this.showDeleteModal = true;
  }

  executeDelete() {
    // Logic การลบจริง
    console.log('Deleting...', this.targetToDelete);
    this.showDeleteModal = false;
  }
}