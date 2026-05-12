import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-curriculum-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './curriculum-management.html',
})
export class CurriculumManagementComponent implements OnInit {
  @Input() isOpen = false; 
  @Output() close = new EventEmitter<void>(); 

  curriculumData: any[] = [];
  categoryForm!: FormGroup;
  moduleForm!: FormGroup;
  courseForm!: FormGroup;
  
  // สถานะ Modal ย่อย
  isAddCategoryModal = false;
  isAddModuleModal = false;
  isAddCourseModal = false;

  // ตัวแปรเก็บ ID ที่เลือกเพื่อใช้สร้างข้อมูลชั้นถัดไป
  selectedCatId: number | null = null;
  selectedModuleId: number | null = null;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.initForms();
  }

  ngOnInit(): void {
    if (this.isOpen) this.loadCurriculumData();
  }

  initForms() {
    // อ้างอิงตาราง categories
    this.categoryForm = this.fb.group({
      category_name: ['', Validators.required],
      required_credit: [0, [Validators.required, Validators.min(1)]]
    });
    // อ้างอิงตาราง modules
    this.moduleForm = this.fb.group({
      module_name: ['', Validators.required],
      required_credit: [0]
    });
    // อ้างอิงตาราง courses
    this.courseForm = this.fb.group({
      course_code: ['', Validators.required],
      course_name: ['', Validators.required],
      credit: [3, [Validators.required, Validators.min(1)]]
    });
  }

  loadCurriculumData() {
    this.http.get(`${environment.apiUrl}/get_curriculum_structure.php`).subscribe((res: any) => {
      // เพิ่ม property 'isOpen' ให้ข้อมูลแต่ละชั้นเพื่อใช้ทำ Accordion
      this.curriculumData = res.map((cat: any) => ({
        ...cat,
        isOpen: false,
        modules: cat.modules?.map((mod: any) => ({ ...mod, isOpen: false }))
      }));
    });
  }

  // ฟังก์ชันควบคุมการเปิด-ปิด Accordion
  toggleAccordion(item: any) {
    item.isOpen = !item.isOpen;
  }

  // ฟังก์ชันบันทึกข้อมูลแยกตามชั้น
  saveCategory() {
    if (this.categoryForm.valid) {
      this.http.post(`${environment.apiUrl}/categories.php`, this.categoryForm.value).subscribe((res: any) => {
        if (res.success) { this.loadCurriculumData(); this.closeModal(); }
      });
    }
  }

  saveModule() {
    if (this.moduleForm.valid && this.selectedCatId) {
      const data = { ...this.moduleForm.value, category_id: this.selectedCatId };
      this.http.post(`${environment.apiUrl}/modules.php`, data).subscribe((res: any) => {
        if (res.success) { this.loadCurriculumData(); this.closeModal(); }
      });
    }
  }

  saveCourse() {
    if (this.courseForm.valid && this.selectedModuleId) {
      const data = { ...this.courseForm.value, module_id: this.selectedModuleId };
      this.http.post(`${environment.apiUrl}/courses.php`, data).subscribe((res: any) => {
        if (res.success) { this.loadCurriculumData(); this.closeModal(); }
      });
    }
  }

  closeMainModal() {
    this.close.emit(); // ส่งสัญญาณไปบอก StudentsComponent ให้เปลี่ยนค่า isCurriculumModalOpen เป็น false
  }
  
  closeModal() {
    this.isAddCategoryModal = false;
    this.isAddModuleModal = false;
    this.isAddCourseModal = false;
    this.categoryForm.reset();
    this.moduleForm.reset();
    this.courseForm.reset();
  }
}