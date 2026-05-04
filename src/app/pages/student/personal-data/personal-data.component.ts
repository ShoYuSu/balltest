import { Component } from '@angular/core';

@Component({
  selector: 'app-personal-data',
  imports: [],
  templateUrl: './personal-data.component.html',
  styleUrl: './personal-data.component.css',
})
export class PersonalDataComponent {
  student = {
    fullName: 'สมชาย ใจดี',
    studentCode: '65001',
    email: 'student@siam.edu',
    faculty: 'วิศวกรรมศาสตร์',
    major: 'Computer Science',
    year: 3,
    avatar: 'https://i.pravatar.cc/150?img=3'
  };
}
