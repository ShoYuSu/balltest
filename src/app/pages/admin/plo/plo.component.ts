import { Component, OnInit } from '@angular/core';
import { NgClass, CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { TableColumnModel } from '../../../shared/components/stat-cards/models/table-option';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-plo',
  imports: [NgClass, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './plo.html',
  styleUrls: ['./plo.css'],
})
export class PloComponent implements OnInit {
  public dataSource: any[] = [];
  public rawPlos: any[] = [];
  public rawYlos: any[] = [];
  public departmentsList = [
  { dept_id: 1, dept_name_th: 'วิทยาการคอมพิวเตอร์' },
  { dept_id: 2, dept_name_th: 'เทคโนโลยีการอาหาร' }
];

  public courseForm!: FormGroup;
  public ploForm!: FormGroup;
  public yloForm!: FormGroup;

  showCourseModal = false;
  showDetailModal = false;
  showPloModal = false;
  showYloModal = false;
  showDeleteModal = false;
  isDepartmentDropdownOpen = false;

  selectedCourse: any;
  selectedPlo: any;
  selectedYlo: any;
  deleteTargetType: string = '';
  isEditMode = false;

  // คอลัมน์แสดงตารางหน้าแรกสุด
  public columns: TableColumnModel[] = [
    {
      columnDef: 'curriculum_id',
      header: 'ID หลักสูตร',
      tag: 'text',
      display: true,
      width: 'small',
      cell: (el) => el.curriculum_id,
    },
    {
      columnDef: 'name',
      header: 'ชื่อหลักสูตร',
      tag: 'text',
      display: true,
      width: 'medium',
      cell: (el) => el.curriculum_name,
    },
{
    columnDef: 'dept',
    header: 'ภาควิชา',
    tag: 'text',
    display: true,
    width: 'medium',
    align: 'left',
    cell: (el) => {
      // 1. ถ้ามีข้อมูล dept_name_th มาจากการ JOIN ให้แสดงได้เลย
      if (el.dept_name_th) return el.dept_name_th;
      
      // 2. ถ้าไม่มี (เผื่อข้อมูลเก่าที่อาจจะตกหล่น) ให้ไปหาจาก departmentsList ที่เราประกาศไว้
      const dept = this.departmentsList.find(d => Number(d.dept_id) === Number(el.dept_id));
      return dept ? dept.dept_name_th : '-';
    } 
  },
    {
      columnDef: 'year',
      header: 'ปี พ.ศ.',
      tag: 'text',
      display: true,
      width: 'small',
      align: 'center',
      cell: (el) => el.year,
    },
    {
      columnDef: 'view_curriculum',
      header: 'ดูPLO/YLO',
      tag: 'action',
      display: true,
      width: 'small',
      align: 'center',
      cell: (el) => el,
    },
    {
      columnDef: 'edit',
      header: 'แก้ไข',
      tag: 'edit',
      display: true,
      width: 'small',
      align: 'center',
      cell: (el) => el,
    },
    {
      columnDef: 'delete',
      header: 'ลบ',
      tag: 'delete',
      display: true,
      width: 'small',
      align: 'center',
      cell: (el) => el,
    },
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadPloYloData();
  }
  loadDepartments() {
    this.http.get<any>(`${environment.apiUrl}/get_departments.php`).subscribe({
      next: (res) => {
        if (res && res.success) {
          this.departmentsList = res.departments || [];
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error loading departments:', err);
      },
    });
  }
  initForms() {
    // 🛠️ ปรับปรุง: เพิ่ม curriculum_id เข้าฟอร์ม เพื่อไม่ให้ส่งค่าเป็น null ไปหลังบ้านตอนสร้างใหม่
    this.courseForm = this.fb.group({
      curriculum_id: ['', Validators.required],
      curriculum_name: ['', Validators.required],
      dept_id: [1, Validators.required],
      year: [new Date().getFullYear() + 543, Validators.required],
    });

    this.ploForm = this.fb.group({
      plo_name: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(2)]],
    });

    this.yloForm = this.fb.group({
      ylo_id: [''],
      year: [1, Validators.required],
      description: ['', Validators.required],
    });
  }

  isInvalid(form: FormGroup, field: string): boolean {
    const control = form.get(field);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  loadPloYloData() {
    this.http.get<any>(`${environment.apiUrl}/get_courses.php`).subscribe({
      next: (res) => {
        // 3. ป้องกันกรณี res เป็น null/undefined
        if (!res) {
          this.dataSource = [];
          return;
        }

        // 4. ถ้าโครงสร้าง success ไม่มา ให้เช็กว่า res เป็น array โดยตรงไหม
        const success = res.success !== undefined ? res.success : true;
        if (!success) {
          this.dataSource = [];
          return;
        }

        const curriculums = res.curriculums || [];
        const plos = res.plos || [];
        const ylos = res.ylos || [];

        // การ Map ข้อมูลคงเดิม (ถูกต้องแล้ว)
        this.dataSource = curriculums.map((course: any) => {
          const coursePlos = plos
            .filter(
              (p: any) =>
                p.curriculum_id?.toString().trim() === course.curriculum_id?.toString().trim(),
            ) //  เปลี่ยนเป็นตัวหนังสือ
            .map((plo: any) => ({
              ...plo,
              ylos: ylos.filter((y: any) => Number(y.plo_id) === Number(plo.plo_id)),
            }));

          return { ...course, ploDetails: coursePlos };
        });

        console.log('Mapped Success:', this.dataSource);

        // 5. [สำคัญมาก] บังคับให้ Angular อัปเดตหน้าจอหลังจาก map ข้อมูลเสร็จ
        this.cdr.detectChanges();

        // ตรวจสอบ selectedCourse
        if (this.selectedCourse) {
          const updated = this.dataSource.find(
            (c) =>
              c.curriculum_id?.toString().trim() ===
              this.selectedCourse.curriculum_id?.toString().trim(), //  เทียบด้วยสตริง
          );
          if (updated) this.selectedCourse = updated;
        }
      },
      error: (err) => {
        console.error('API Error:', err);
        this.dataSource = [];
        this.cdr.detectChanges(); // อัปเดตหน้าจอเมื่อเกิด Error
      },
    });
  }

  toggleDepartmentDropdown() {
    this.isDepartmentDropdownOpen = !this.isDepartmentDropdownOpen;
  }
  selectDepartment(dept: any) {
    // บันทึกค่า dept_id และ dept_name_th ลงฟอร์ม (ถ้าในอนาคตอยากเก็บชื่อภาควิชาในฟอร์มด้วย)
    this.courseForm.patchValue({
      dept_id: Number(dept.dept_id), // แปลงเป็นตัวเลขเพื่อความปลอดภัย
      // ถ้าในอนาคตไม่ต้องใช้ major แล้ว ก็ไม่ต้อง patch major ลงไปครับ
    });

    // มาร์กสถานะฟอร์มว่ามีการแก้ไข
    this.courseForm.get('dept_id')?.markAsDirty();

    // สั่งปิด Dropdown และอัปเดตหน้าจอ
    this.isDepartmentDropdownOpen = false;
    this.cdr.detectChanges();
  }
  openAddCourse() {
    this.isEditMode = false;
    this.courseForm.reset({
      year: new Date().getFullYear() + 543,
      dept_id: 1,
      curriculum_id: '',
      curriculum_name: '',
    });
    // ปลดล็อกฟิลด์ไอดีเพื่อให้ระบุรหัสได้ตอนสร้างใหม่
    this.courseForm.get('curriculum_id')?.enable();
    this.showCourseModal = true;
  }

 openEditCourse(course: any) {
  this.isEditMode = true;
  this.selectedCourse = course;

  this.courseForm.patchValue({
    curriculum_id: course.curriculum_id,
    curriculum_name: course.curriculum_name,
    dept_id: Number(course.dept_id), // ใช้ dept_id ตัวเดียว
    year: course.year,
  });
  
  this.courseForm.get('curriculum_id')?.disable();
  this.showCourseModal = true;
}

  openAddPlo() {
    this.isEditMode = false;
    this.ploForm.reset();
    this.showPloModal = true;
  }

  openEditPlo(plo: any) {
    this.isEditMode = true;
    this.selectedPlo = plo;

    this.ploForm.patchValue({
      plo_name: plo.plo_name || plo.code,
      description: plo.description,
    });
    this.showPloModal = true;
  }

  openAddYlo(plo: any) {
    this.isEditMode = false;
    this.selectedPlo = plo;

    const currentYear = 1;
    const ylosInYear = (plo.ylos || []).filter(
      (y: any) => Number(y.year || y.level) === currentYear,
    );

    // 2. คำนวณเลขลำดับถัดไป (ถ้ามี 1.1 แล้ว ตัวต่อไปจะเป็น 1.2)
    const nextLevel = ylosInYear.length + 1;
    this.yloForm.reset({
      ylo_id: '',
      year: nextLevel,
      description: '',
    });
    this.showYloModal = true;
  }
  getYlosByYear(plo: any, year: number) {
    if (!plo.ylos) return [];
    // เช็คทั้ง y.year หรือ y.level ตามที่คุณเก็บข้อมูลไว้
    return plo.ylos.filter((y: any) => Number(y.year || y.level) === year);
  }

  openEditYlo(plo: any, ylo: any) {
    this.isEditMode = true;
    this.selectedPlo = plo;
    this.selectedYlo = ylo;
    this.yloForm.patchValue({
      ylo_id: ylo.ylo_id,
      year: ylo.level || ylo.year,
      description: ylo.description,
    });
    this.showYloModal = true;
  }

  // ใน saveCourse() ให้เพิ่มการเช็กค่าก่อนส่ง
saveCourse() {
  // 1. ตรวจสอบสถานะฟอร์ม
  if (this.courseForm.invalid) {
    this.courseForm.markAllAsTouched();
    // ถ้าอยากรู้ว่าช่องไหนติด error ให้ log ออกมาดู
    console.log('Form errors:', this.courseForm.errors); 
    alert('กรุณากรอกข้อมูลให้ครบถ้วน');
    return;
  }

  // 2. ใช้ getRawValue() เพื่อดึงค่าที่ถูก disable ไว้ด้วย (เช่น curriculum_id ตอนแก้ไข)
  const formValue = this.courseForm.getRawValue();

  const body = {
    type: 'curriculum',
    is_edit: this.isEditMode,
    curriculum_id: formValue.curriculum_id,
    curriculum_name: formValue.curriculum_name,
    dept_id: Number(formValue.dept_id), // ส่งเป็นตัวเลข
    year: formValue.year,
  };

  // 3. ส่งข้อมูล
  this.http.post(`${environment.apiUrl}/save_plo_ylo.php`, body).subscribe({
    next: (res: any) => {
      if (res.success) {
        alert('บันทึกข้อมูลเรียบร้อย');
        this.loadPloYloData();
        this.closeModals();
      } else {
        alert(res.message || 'เกิดข้อผิดพลาดในการบันทึก');
      }
    },
    error: (err) => {
      console.error('API Error:', err);
      alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    }
  });
}
getSelectedDepartmentName(): string {
  const selectedId = this.courseForm.get('dept_id')?.value;
  const dept = this.departmentsList.find(d => d.dept_id == selectedId);
  return dept ? dept.dept_name_th : 'เลือกภาควิชา';
}

  savePlo() {
    if (this.ploForm.invalid) {
      this.ploForm.markAllAsTouched();
      return;
    }
    const formValue = this.ploForm.value;

    // 🛠️ ส่งทั้ง plo_name และ code เพื่อป้องกันอาการตัวแปรไม่ครบฝั่งหลังบ้าน
    const body = {
      type: 'plo',
      is_edit: this.isEditMode,
      plo_id: this.isEditMode ? this.selectedPlo.plo_id : null,
      curriculum_id: this.selectedCourse.curriculum_id,
      plo_name: formValue.plo_name,
      code: formValue.plo_name,
      description: formValue.description,
    };

    this.http.post(`${environment.apiUrl}/save_plo_ylo.php`, body).subscribe((res: any) => {
      if (res.success) {
        alert(res.message || 'บันทึก PLO สำเร็จ');
        this.loadPloYloData();
        this.showPloModal = false;
        this.ploForm.reset();
        this.cdr.detectChanges();

        setTimeout(() => {
          this.loadPloYloData();
        }, 300);
      } else {
        alert(res.message);
      }
    });
  }

  saveYlo() {
    if (this.yloForm.invalid) {
      this.yloForm.markAllAsTouched();
      return;
    }

    const formValue = this.yloForm.value;

    const body = {
      type: 'ylo',
      is_edit: this.isEditMode,
      ylo_id: this.isEditMode ? this.selectedYlo?.ylo_id : null,
      plo_id: this.selectedPlo.plo_id,
      level: formValue.year,
      ylo_name: `YLO${formValue.year}`,
      description: formValue.description,
    };

    this.http.post(`${environment.apiUrl}/save_plo_ylo.php`, body).subscribe((res: any) => {
      if (res.success) {
        this.loadPloYloData();

        setTimeout(() => {
          const updated = this.dataSource.find(
            (c) =>
              c.curriculum_id?.toString().trim() ===
              this.selectedCourse.curriculum_id?.toString().trim(),
          );

          if (updated) {
            this.selectedCourse = updated;
          }

          this.showYloModal = false;
          this.cdr.detectChanges();
        }, 500);
      } else {
        alert(res.message);
      }
    });
  }

  confirmDeleteCourse(course: any) {
    this.selectedCourse = course;
    this.deleteTargetType = 'course';
    this.showDeleteModal = true;
  }
  confirmDeletePlo(plo: any) {
    this.selectedPlo = plo;
    this.deleteTargetType = 'plo';
    this.showDeleteModal = true;
  }
  confirmDeleteYlo(plo: any, ylo: any) {
    this.selectedPlo = plo;
    this.selectedYlo = ylo;
    this.deleteTargetType = 'ylo';
    this.showDeleteModal = true;
  }

  executeDelete() {
    let type = this.deleteTargetType;
    let id = null;

    if (type === 'plo') id = this.selectedPlo.plo_id;
    else if (type === 'ylo') id = this.selectedYlo.ylo_id;
    else if (type === 'course') id = this.selectedCourse.curriculum_id;

    if (id) {
      this.http
        .post(`${environment.apiUrl}/delete_plo_ylo.php`, { type, id })
        .subscribe((res: any) => {
          if (res.success) {
            this.loadPloYloData();
            this.showDeleteModal = false;
          } else {
            alert(res.message || 'เกิดข้อผิดพลาดในการลบข้อมูล');
          }
        });
    } else {
      this.showDeleteModal = false;
    }
  }
  getNextYloLevel(plo: any): number {
    if (!plo || !plo.ylos || plo.ylos.length === 0) {
      return 1; // ถ้ายังไม่มี YLO เลย ให้เริ่มที่ 1
    }
    // หาเลขลำดับสูงสุดที่มีอยู่ แล้วบวก 1
    const levels = plo.ylos.map((y: any) => Number(y.level || y.year));
    return Math.max(...levels) + 1;
  }

  openDetail(course: any) {
    this.selectedCourse = course;
    this.showDetailModal = true;
  }
  closeModals() {
    this.showCourseModal = false;
    this.showDetailModal = false;
    this.showPloModal = false;
    this.showYloModal = false;
    this.showDeleteModal = false;
  }
  getDeleteModalTitle(): string {
    return this.deleteTargetType === 'course'
      ? 'ลบหลักสูตร'
      : this.deleteTargetType === 'plo'
        ? 'ลบ PLO'
        : 'ลบ YLO';
  }
  getDeleteModalMessage(): string {
    return 'คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้?\nการกระทำนี้จะไม่สามารถย้อนคืนได้ และจะลบข้อมูลลูกที่ผูกไว้ทั้งหมด';
  }
}
