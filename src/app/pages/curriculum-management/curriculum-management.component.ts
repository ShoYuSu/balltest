import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-curriculum-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './curriculum-management.html',
})
export class CurriculumManagementComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  curriculumData: any[] = [];
  major: string[] = ['วิทยาการข้อมูลและคอมพิวเตอร์', 'เทคโนโลยีการอาหาร']; // มีค่าเริ่มต้นรอไว้
  selectedMajor: string = 'วิทยาการข้อมูลและคอมพิวเตอร์'; // ล็อกสาขาเริ่มต้นที่จะใช้ค้นหา
  selectedYear: string = '2566';

  isMajorDropdownOpen = false;

  categoryForm!: FormGroup;
  moduleForm!: FormGroup;
  courseForm!: FormGroup;

  isAddCategoryModal = false;
  isAddModuleModal = false;
  isAddCourseModal = false;

  selectedCatId: number | null = null;
  selectedModuleId: number | null = null;
  isGradeDropdownOpen = false;
  isEditMode = false;
  selectedCourseId: number | null = null;

  isDeleteModalOpen = false;
  deleteType: 'course' | 'module' | 'category' | '' = '';
  deleteId: number | null = null;

  selectedDeleteId: number | null = null;
  selectedEditCategoryId: number | null = null;
  selectedEditModuleId: number | null = null;
  isEditCategoryMode = false;
  isEditModuleMode = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
  ) {
    this.initForms();
  }

  ngOnInit(): void {
    if (this.isOpen) {
      this.loadMajors();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && changes['isOpen'].currentValue === true) {
      this.loadMajors(); // ดึงรายชื่อสาขาและข้อมูลหลักสูตรทุกครั้งที่กดเปิดหน้าต่าง
    }
  }

  initForms() {
    this.categoryForm = this.fb.group({
      category_name: ['', Validators.required],
      required_credit: [0, [Validators.required, Validators.min(1)]],
    });
    this.moduleForm = this.fb.group({
      module_name: ['', Validators.required],
      required_credit: [0, [Validators.required, Validators.min(0)]],
    });
    this.courseForm = this.fb.group({
      course_code: ['', Validators.required],
      course_name: ['', Validators.required],
      // course_name_en: [''],
      credit: [3, [Validators.required, Validators.min(1)]],
      grade_system: ['', Validators.required],
    });
  }
  // ฟังก์ชันเปิด-ปิด Dropdown สาขา
  toggleMajorDropdown() {
    this.isMajorDropdownOpen = !this.isMajorDropdownOpen;
  }
  // ฟังก์ชันเลือกสาขาและรีโหลดข้อมูลหลักสูตรตามสาขาที่เลือก
  selectMajor(majorName: string) {
    this.selectedMajor = majorName; // เปลี่ยนชื่อสาขาปัจจุบัน
    this.isMajorDropdownOpen = false; // คลิกเลือกเสร็จให้หุบเมนูปิดลงทันที
    // สั่งรีโหลดวิชาด้านล่างให้เปลี่ยนตามสาขาทันที

    if (this.selectedMajor === 'เทคโนโลยีการอาหาร') {
      this.selectedYear = '2567'; // ล็อกปีการศึกษาสำหรับสาขาเทคโนโลยีการอาหารเป็น 2567 เสมอ
    } else if (this.selectedMajor === 'วิทยาการข้อมูลและคอมพิวเตอร์') {
      this.selectedYear = '2566'; // ล็อกปีการศึกษาสำหรับสาขาวิทยาการคอมพิวเตอร์เป็น 2566
    }
    this.loadCurriculumData();
  }
  toggleGradeDropdown() {
    this.isGradeDropdownOpen = !this.isGradeDropdownOpen;
  }
  selectGradeSystem(system: string) {
    this.courseForm.patchValue({ grade_system: system });
    this.isGradeDropdownOpen = false;
  }

  // ฟังก์ชันโหลดสาขาสไตล์ Set เคลียร์ค่าซ้ำของคุณ
  loadMajors() {
    this.http.get<any[]>(`${environment.apiUrl}/get_majors.php`).subscribe({
      next: (res) => {
        if (Array.isArray(res)) {
          const dbMajors = res.map((m: any) => m.major_name);
          this.major = [...new Set([...['วิทยาการข้อมูลและคอมพิวเตอร์', 'เทคโนโลยีการอาหาร'], ...dbMajors])];

          // ตรวจสอบว่ามีสาขาที่เลือกอยู่ในอาเรย์ไหม ถ้าไม่มีให้ล็อกตัวแรก
          if (this.major.length > 0 && !this.major.includes(this.selectedMajor)) {
            this.selectedMajor = this.major[0];
          }

          this.loadCurriculumData(); // โชว์รายชื่อสาขาเสร็จ วิ่งไปโหลดวิชาต่อทันที
        }
      },
      error: (err) => console.error('โหลดสาขาล้มเหลว', err),
    });
  }

  // ดึงข้อมูลหลักสูตรโดยส่งชื่อสาขา (major_name) ไปฟิลเตอร์หลังบ้าน
  loadCurriculumData() {
    this.http
      .get(
        `${environment.apiUrl}/get_curriculum.php?major_name=${encodeURIComponent(this.selectedMajor)}`,
      )
      .subscribe({
        next: (res: any) => {
          // กางแผง Accordion ออกมาทั้งหมด (true) เพื่อไม่ให้เกิดบั๊กหน้าจอว่างเปล่าตอนเปิดครั้งแรก
          this.curriculumData = res.map((cat: any) => {
            const oldCat = this.curriculumData.find((c) => c.category_id === cat.category_id);
            return {
              ...cat,
              isOpen: oldCat ? oldCat.isOpen : true,
              modules: (cat.modules || []).map((mod: any) => {
                const oldMod = oldCat?.modules?.find((m: any) => m.module_id === mod.module_id);
                return { ...mod, isOpen: oldMod ? oldMod.isOpen : true };
              }),
            };
          });

          // บังคับให้ Angular เรนเดอร์หน้าจออัปเดตสีสันทันที ไม่ต้องรอคลิกปุ่มอื่น
          this.cdr.detectChanges();
        },
        error: (err) => console.error('เกิดข้อผิดพลาดในการโหลดข้อมูลหลักสูตร:', err),
      });
  }

  // ฟังก์ชันจังหวะเปลี่ยน Dropdown สาขาบนหน้าเว็บ
  onMajorChange(event: any) {
    this.selectedMajor = event.target.value;
    this.loadCurriculumData(); // รีโหลดตารางวิชาข้างล่างใหม่ให้ตรงกับสาขานั้น ๆ ทันที
  }

  // ฟังก์ชันคำนวณจำนวนวิชารวมมุมบนขวาตามรูปภาพ
  getTotalCoursesCount(): number {
    let count = 0;
    this.curriculumData.forEach((cat) => {
      if (cat.modules) {
        cat.modules.forEach((mod: any) => {
          if (mod.courses) count += mod.courses.length;
        });
      }
    });
    return count;
  }

  toggleAccordion(item: any) {
    item.isOpen = !item.isOpen;
  }

  openAddCourseModal(moduleId: number) {
    this.isEditMode = false;
    this.selectedCourseId = null;
    this.selectedModuleId = moduleId;
    this.isGradeDropdownOpen = false;
    this.courseForm.reset({ credit: 3, grade_system: 'ปกติ (A-F)' });
    this.isAddCourseModal = true;
  }

  saveCategory() {
  if (this.categoryForm.invalid) return;

  const payload = {
    ...this.categoryForm.value,
    major_name: this.selectedMajor
  };

  const url = this.isEditCategoryMode
    ? `${environment.apiUrl}/update_category.php`
    : `${environment.apiUrl}/add_category.php`;

  if (this.isEditCategoryMode) {
    Object.assign(payload, {
      category_id: this.selectedEditCategoryId
    });
  }

  this.http.post(url, payload).subscribe((res: any) => {
    if (res.success) {
      this.loadCurriculumData();
      this.closeModal();
    }
  });
}

  saveModule() {
  if (this.moduleForm.invalid || !this.selectedCatId) return;

  const data = {
    ...this.moduleForm.value,
    category_id: this.selectedCatId
  };

  const url = this.isEditModuleMode
    ? `${environment.apiUrl}/update_module.php`
    : `${environment.apiUrl}/modules.php`;

  if (this.isEditModuleMode) {
    Object.assign(data, {
      module_id: this.selectedEditModuleId
    });
  }

  this.http.post(url, data).subscribe((res: any) => {
    if (res.success) {
      this.loadCurriculumData();
      this.closeModal();
    }
  });
}

  saveCourse() {
    if (this.courseForm.invalid || !this.selectedModuleId) return;

    // สลับ URL ตามโหมดแก้ไขหรือโหมดเพิ่มใหม่
    const url = this.isEditMode
      ? `${environment.apiUrl}/update_course.php`
      : `${environment.apiUrl}/add_course.php`;

    // ถ้าเป็นโหมดแก้ไข ให้พ่วง course_id ส่งไปให้ PHP ด้วย
    const data = this.isEditMode
      ? {
          ...this.courseForm.value,
          course_id: this.selectedCourseId,
          module_id: this.selectedModuleId,
        }
      : { ...this.courseForm.value, module_id: this.selectedModuleId };

    this.http.post(url, data).subscribe((res: any) => {
      if (res.success) {
        this.loadCurriculumData(); // รีโหลดข้อมูลตารางทันทีโดยไม่ต้อง F5
        this.closeModal();
      }
    });
  }
  editCourse(course: any, moduleId: number) {
    this.isEditMode = true;
    this.selectedCourseId = course.course_id;
    this.selectedModuleId = moduleId;
    this.isGradeDropdownOpen = false;

    this.courseForm.patchValue({
      course_code: course.course_code,
      course_name: course.course_name,
      course_name_en: course.course_name_en,
      credit: course.credit,
      grade_system: course.grade_system || 'ปกติ (A-F)',
    });
    this.isAddCourseModal = true; // เปิด Modal ฟอร์มวิชาขึ้นมา
  }
  editCategory(cat: any) {
    this.isEditCategoryMode = true;
    this.selectedEditCategoryId = cat.category_id;

    this.categoryForm.patchValue({
      category_name: cat.category_name,
      required_credit: cat.required_credit,
    });

    this.isAddCategoryModal = true;
  }
  editModule(mod: any, catId: number) {
    this.isEditModuleMode = true;
    this.selectedEditModuleId = mod.module_id;
    this.selectedCatId = catId;

    this.moduleForm.patchValue({
      module_name: mod.module_name,
      required_credit: mod.required_credit,
    });

    this.isAddModuleModal = true;
  }
  openDeleteModal(type: 'course' | 'module' | 'category', id: number) {
    this.deleteType = type;
    this.deleteId = id;
    this.isDeleteModalOpen = true;
  }
  confirmDelete() {
    if (!this.deleteType || !this.deleteId) return;

    this.http
      .post(`${environment.apiUrl}/delete_item.php`, {
        type: this.deleteType,
        id: this.deleteId,
      })
      .subscribe((res: any) => {
        if (res.success) {
          this.loadCurriculumData();
          this.closeDeleteModal();
        } else {
          alert(res.message);
        }
      });
  }
  // deleteCourse(courseId?: number) {
  //   const idToDelete = courseId || this.selectedCourseId;

  //   if (!idToDelete) return;

  //   this.courseIdToDelete = idToDelete;
  //   this.isDeleteModalOpen = true;
  // }
  // confirmDelete() {
  //   if (!this.courseIdToDelete) return;

  //   this.http
  //     .post(`${environment.apiUrl}/delete_item.php`, { type: 'course', id: this.courseIdToDelete })
  //     .subscribe((res: any) => {
  //       if (res.success) {
  //         this.loadCurriculumData();
  //         this.closeDeleteModal();
  //       }
  //     });
  // }
  closeDeleteModal() {
    this.isDeleteModalOpen = false;
    this.deleteType = '';
    this.deleteId = null;
    // this.courseIdToDelete = null;
  }

  closeMainModal() {
    this.close.emit();
  }

  closeModal() {
  this.isAddCategoryModal = false;
  this.isAddModuleModal = false;
  this.isAddCourseModal = false;

  this.isEditCategoryMode = false;
  this.isEditModuleMode = false;
  this.isEditMode = false;

  this.selectedEditCategoryId = null;
  this.selectedEditModuleId = null;
  this.selectedCourseId = null;

  this.categoryForm.reset({ required_credit: 0 });
  this.moduleForm.reset({ required_credit: 0 });
  this.courseForm.reset({
    credit: 3,
    grade_system: 'ปกติ (A-F)'
  });

  this.selectedCatId = null;
  this.selectedModuleId = null;
  this.isGradeDropdownOpen = false;
}
}
