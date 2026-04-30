import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-advisor-information',
  standalone: true,
  imports: [],
  templateUrl: './advisor-information.html',
  styleUrl: './advisor-information.css',
})
export class AdvisorInformation {
    advisor = {
    nameTH: 'ดร.สมชาย ใจดี',
    nameEN: 'Dr.Somchai Jaidee',
    email: 'Somchai.J@gmail.com',
    phone: '001-9239-2324',
    line: 'Somchai.J',
    office: 'ห้อง 18-401 ตึก 18',
    avatar: 'https://i.pravatar.cc/150?img=12'
  };
}
