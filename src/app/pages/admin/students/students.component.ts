import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { StatCardsComponent } from '../../../shared/components/stat-cards/stat-cards.component';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, StatCardsComponent],
  templateUrl: './students.html',
  styleUrl: './students.css',
})
export class StudentsComponent implements OnInit {
  // --- ตัวแปรเดิมที่คุณมี ---
  studentStats = [
    { label: 'นักศึกษาทั้งหมด', value: 0, icon: 'school', bgColor: 'bg-green-50', textColor: 'text-green-600' },
    { label: 'มีที่ปรึกษาแล้ว', value: 0, icon: 'person', bgColor: 'bg-yellow-50', textColor: 'text-yellow-600' },
    { label: 'ยังไม่มีที่ปรึกษา', value: 0, icon: 'person_off', bgColor: 'bg-red-50', textColor: 'text-red-600' },
  ];

  // --- ตัวแปรจัดการ Modal และ Form ---
  isModalOpen = false;
  submitted = false;
  searchText = '';
  imagePreview: string | ArrayBuffer | null = null;
  studentForm!: FormGroup;

  // --- ตัวแปรเก็บข้อมูลจริง (เพิ่มได้จริง) ---
  students: any[] = []; 

  constructor(private fb: FormBuilder) {
    this.initForm();
  }

  ngOnInit(): void {
    this.updateStats();
  }

  initForm() {
    this.studentForm = this.fb.group({
      studentId: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      fullName: ['', Validators.required],
      major: ['', Validators.required],
      year: ['1', Validators.required]
    });
  }

  // ฟังก์ชันควบคุม Modal
  openModal() {
    this.isModalOpen = true;
    this.submitted = false;
    this.imagePreview = null;
    this.studentForm.reset({ year: '1', major: '' });
  }

  closeModal() {
    this.isModalOpen = false;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => this.imagePreview = reader.result;
      reader.readAsDataURL(file);
    }
  }

  // --- ฟังก์ชันบันทึกข้อมูล (เพิ่มลงตารางจริง) ---
  saveStudent() {
    this.submitted = true;
    if (this.studentForm.valid) {
      const newStudent = {
        id: this.studentForm.value.studentId,
        name: this.studentForm.value.fullName,
        major: this.studentForm.value.major,
        year: this.studentForm.value.year,
        image: this.imagePreview
      };

      this.students.unshift(newStudent); // เพิ่มข้อมูลใหม่ไปข้างบนสุด
      this.updateStats(); // อัปเดตตัวเลขบน Card
      this.closeModal();
    }
  }

  updateStats() {
    this.studentStats[0].value = this.students.length;
    // สถิติอื่นๆ สามารถเขียนเงื่อนไขเพิ่มได้ตามต้องการ
  }

  // ฟังก์ชันค้นหา
  get filteredStudents() {
    return this.students.filter(s => 
      s.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
      s.id.includes(this.searchText)
    );
  }
}