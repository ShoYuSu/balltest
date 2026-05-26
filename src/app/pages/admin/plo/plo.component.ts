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

  public courseForm!: FormGroup;
  public ploForm!: FormGroup;
  public yloForm!: FormGroup;

  showCourseModal = false;
  showDetailModal = false;
  showPloModal = false;
  showYloModal = false;
  showDeleteModal = false;

  selectedCourse: any;
  selectedPlo: any;
  selectedYlo: any;
  deleteTargetType: string = '';
  isEditMode = false;

  // คอลัมน์แสดงตารางหน้าแรกสุด
  public columns: TableColumnModel[] = [
    {
      columnDef: 'id',
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
      header: 'รหัสภาควิชา',
      tag: 'text',
      display: true,
      width: 'small',
      align: 'center',
      cell: (el) => el.dept_name_th || el.dept_id,
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

  initForms() {
    // 🛠️ ปรับปรุง: เพิ่ม curriculum_id เข้าฟอร์ม เพื่อไม่ให้ส่งค่าเป็น null ไปหลังบ้านตอนสร้างใหม่
    this.courseForm = this.fb.group({
      curriculum_id: ['', Validators.required],
      curriculum_name: ['', Validators.required],
      dept_id: ['', Validators.required],
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
            .filter((p: any) => Number(p.curriculum_id) === Number(course.curriculum_id))
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
            (c) => Number(c.curriculum_id) === Number(this.selectedCourse.curriculum_id),
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

  openAddCourse() {
    this.isEditMode = false;
    this.courseForm.reset({ year: new Date().getFullYear() + 543, dept_id: '', curriculum_id: '' });
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
      dept_id: course.dept_id,
      year: course.year,
    });
    // ล็อกฟิลด์ไอดีไว้ ห้ามแก้ไขรหัสหลักสูตรหลักขณะอยู่ในโหมดแก้ไข
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

  saveCourse() {
    if (
      this.courseForm.invalid &&
      !(this.isEditMode && this.courseForm.get('curriculum_name')?.valid)
    ) {
      this.courseForm.markAllAsTouched();
      return;
    }

    // ดึงข้อมูลฟอร์มแบบรวมกรณีฟิลด์โดน disabled ด้วย
    const formValue = this.courseForm.getRawValue();

    // 🛠️ ส่งคีย์ครอบคลุมความต้องการของ PHP หลังบ้าน
    const body = {
      type: 'curriculum',
      is_edit: this.isEditMode,
      curriculum_id: formValue.curriculum_id,
      curriculum_name: formValue.curriculum_name,
      course_name: formValue.curriculum_name, // พ่วงตัวแปรเผื่อหลังบ้านเช็กคีย์เดิม
      dept_id: formValue.dept_id,
      department: formValue.dept_id, // พ่วงตัวแปรเผื่อหลังบ้านเช็กคีย์เดิม
      year: formValue.year,
    };

    this.http.post(`${environment.apiUrl}/save_plo_ylo.php`, body).subscribe({
      next: (res: any) => {
        if (res.success) {
          alert(res.message || 'บันทึกหลักสูตรสำเร็จ');
          this.loadPloYloData();
          this.showCourseModal = false;
          this.courseForm.reset();
        } else {
          alert(res.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
      },
      error: (err) => {
        console.error(err);
        alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์หลังบ้านได้');
      },
    });
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
            (c) => Number(c.curriculum_id) === Number(this.selectedCourse.curriculum_id),
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
