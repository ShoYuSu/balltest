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
    { dept_id: 1, dept_name_th: 'ภาควิชาการคอมพิวเตอร์' },
    { dept_id: 2, dept_name_th: 'ภาควิชาเทคโนโลยีการอาหาร' },
  ];

  public courseForm!: FormGroup;
  public ploForm!: FormGroup;
  public subPloForm!: FormGroup; //  เพิ่มฟอร์ม SubPLO
  public yloForm!: FormGroup;

  showCourseModal = false;
  showDetailModal = false;
  showPloModal = false;
  showSubPloModal = false; //  เพิ่มสเตตัสเปิดปิด Modal SubPLO
  showYloModal = false;
  showDeleteModal = false;
  isDepartmentDropdownOpen = false;

  selectedCourse: any;
  selectedPlo: any;
  selectedSubPlo: any; //  เก็บ SubPLO ที่เลือก
  selectedYlo: any;
  deleteTargetType: string = '';
  isEditMode = false;
  isYloYearDropdownOpen = false;
  hasYearLevel = false; // เช็คว่า YLO นั้นมีชั้นปีหรือไม่ (สำหรับวิทยุเลือกใน HTML)

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
        if (el.dept_name_th) return el.dept_name_th;
        const dept = this.departmentsList.find((d) => Number(d.dept_id) === Number(el.dept_id));
        return dept ? dept.dept_name_th : '-';
      },
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
    this.loadDepartments();
  }

  loadDepartments() {
    this.http.get<any>(`${environment.apiUrl}/get_departments.php`).subscribe({
      next: (res) => {
        if (res && res.success) {
          this.departmentsList = res.departments || [];
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Error loading departments:', err),
    });
  }

  initForms() {
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

    // ✨ สร้างฟอร์มรองรับ SubPLO
    this.subPloForm = this.fb.group({
      // sub_plo_name: ['', Validators.required],
      description: ['', Validators.required],
    });

    this.yloForm = this.fb.group({
      ylo_id: [''],
      ylo_name: [''],
      year: [null],
      description: ['', Validators.required],
      sub_plo_id: [null],
    });
  }

  isInvalid(form: FormGroup, field: string): boolean {
    const control = form.get(field);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  loadPloYloData() {
    this.http.get<any>(`${environment.apiUrl}/get_courses.php`).subscribe({
      next: (res) => {
        if (!res || !(res.success !== undefined ? res.success : true)) {
          this.dataSource = [];
          return;
        }

        const curriculums = res.curriculums || [];
        const plos = res.plos || [];
        const ylos = res.ylos || [];
        const subPlos = res.sub_plos || []; // ✨ ดึงข้อมูล sub_plos ย่อยจากหลังบ้าน

        this.dataSource = curriculums.map((course: any) => {
          const coursePlos = plos
            .filter(
              (p: any) =>
                p.curriculum_id?.toString().trim() === course.curriculum_id?.toString().trim(),
            )
            .map((plo: any) => {
              // กรองหา SubPLO ที่อยู่ภายใต้ PLO หลักนี้
              const ploSubPlos = subPlos.filter(
                (s: any) => Number(s.plo_id) === Number(plo.plo_id),
              );

              // กรองหา YLO และแมปชื่อ SubPLO ไปแสดงคู่กันด้วยถ้ามี
              const ploYlos = ylos
                .filter((y: any) => Number(y.plo_id) === Number(plo.plo_id))
                .map((ylo: any) => {
                  const matchedSub = ploSubPlos.find(
                    (s: any) => Number(s.sub_plo_id) === Number(ylo.sub_plo_id),
                  );
                  return {
                    ...ylo,
                    sub_plo_name: matchedSub ? matchedSub.sub_plo_name : null,
                  };
                });

              return {
                ...plo,
                sub_plos: ploSubPlos,
                ylos: ploYlos,
              };
            });

          return { ...course, ploDetails: coursePlos };
        });

        this.cdr.detectChanges();

        if (this.selectedCourse) {
          const updated = this.dataSource.find(
            (c) =>
              c.curriculum_id?.toString().trim() ===
              this.selectedCourse.curriculum_id?.toString().trim(),
          );
          if (updated) this.selectedCourse = updated;
        }
      },
      error: (err) => {
        console.error('API Error:', err);
        this.dataSource = [];
        this.cdr.detectChanges();
      },
    });
  }

  toggleDepartmentDropdown() {
    this.isDepartmentDropdownOpen = !this.isDepartmentDropdownOpen;
  }

  selectDepartment(dept: any) {
    this.courseForm.patchValue({ dept_id: Number(dept.dept_id) });
    this.courseForm.get('dept_id')?.markAsDirty();
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
    this.courseForm.get('curriculum_id')?.enable();
    this.showCourseModal = true;
  }

  toggleYloYearDropdown() {
    this.isYloYearDropdownOpen = !this.isYloYearDropdownOpen;
  }

  selectYloYear(year: number) {
    this.yloForm.patchValue({ year: year });
    this.isYloYearDropdownOpen = false;
  }

  openEditCourse(course: any) {
    this.isEditMode = true;
    this.selectedCourse = course;
    this.courseForm.patchValue({
      curriculum_id: course.curriculum_id,
      curriculum_name: course.curriculum_name,
      dept_id: Number(course.dept_id),
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

  // ✨ ฟังก์ชันเพิ่ม SubPLO ใหม่
  openAddSubPlo(plo: any) {
    this.isEditMode = false;
    this.selectedPlo = plo;
    this.subPloForm.reset();
    this.showSubPloModal = true;
  }

  // ✨ ฟังก์ชันแก้ไข SubPLO
  openEditSubPlo(plo: any, subPlo: any) {
    this.isEditMode = true;
    this.selectedPlo = plo;
    this.selectedSubPlo = subPlo;
    this.subPloForm.patchValue({
      // sub_plo_name: subPlo.sub_plo_name,
      description: subPlo.description,
    });
    this.showSubPloModal = true;
  }

  // ✨ ฟังก์ชันเปิดกล่อง YLO แบบกำหนดความสัมพันธ์ได้เอง
  openAddYloCustom(plo: any, subPlo?: any) {
    this.isEditMode = false;
    this.selectedPlo = plo;
    this.hasYearLevel = false; // ค่าเริ่มต้นเป็นเป้าหมายทั่วไปแบบไม่มีชั้นปี
    this.yloForm.reset({
      ylo_id: '',
      year: null,
      description: '',
      sub_plo_id: subPlo ? subPlo.sub_plo_id : null,
    });
    this.showYloModal = true;
  }
  getDynamicYloLabel(): string {
    if (!this.selectedPlo) return '';
    const currentYear = this.yloForm.get('year')?.value || 1;

    // กรองหา YLO ที่อยู่ภายใต้ปีที่กำลังเลือกในปัจจุบัน
    const yearYlos = (this.selectedPlo.ylos || []).filter(
      (y: any) => Number(y.year || y.level) === Number(currentYear),
    );

    if (this.isEditMode && this.selectedYlo) {
      const index = yearYlos.findIndex((y: any) => y.ylo_id === this.selectedYlo.ylo_id);
      return `YLO ${currentYear}.${index !== -1 ? index + 1 : yearYlos.length + 1}`;
    } else {
      // โหมดเพิ่มใหม่: ลำดับถัดไปคือจำนวนที่มีอยู่แล้วบวกด้วย 1
      return `YLO ${currentYear}.${yearYlos.length + 1}`;
    }
  }

  openEditYlo(plo: any, ylo: any) {
    this.isEditMode = true;
    this.selectedPlo = plo;
    this.selectedYlo = ylo;

    const currentLevel = ylo.level || ylo.year;
    this.hasYearLevel = !!currentLevel; // ถ้ามีเลขชั้นปี ให้เปิดโหมดรายชั้นปี

    this.yloForm.patchValue({
      ylo_id: ylo.ylo_id,
      ylo_name: ylo.ylo_name,
      year: currentLevel ? Number(currentLevel) : null,
      description: ylo.description,
      sub_plo_id: ylo.sub_plo_id || null,
    });
    this.showYloModal = true;
  }

  saveCourse() {
    if (this.courseForm.invalid) {
      this.courseForm.markAllAsTouched();
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    const formValue = this.courseForm.getRawValue();
    const body = {
      type: 'curriculum',
      is_edit: this.isEditMode,
      curriculum_id: formValue.curriculum_id,
      curriculum_name: formValue.curriculum_name,
      dept_id: Number(formValue.dept_id),
      year: formValue.year,
    };

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
      error: (err) => alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้'),
    });
  }

  getSelectedDepartmentName(): string {
    const selectedId = this.courseForm.get('dept_id')?.value;
    const dept = this.departmentsList.find((d) => d.dept_id == selectedId);
    return dept ? dept.dept_name_th : 'เลือกภาควิชา';
  }

  savePlo() {
    if (this.ploForm.invalid) {
      this.ploForm.markAllAsTouched();
      return;
    }
    const formValue = this.ploForm.value;
    const body = {
      type: 'plo',
      is_edit: this.isEditMode,
      plo_id: this.isEditMode ? this.selectedPlo.plo_id : null,
      curriculum_id: this.selectedCourse.curriculum_id,
      plo_name: formValue.plo_name,
      description: formValue.description,
    };

    this.http.post(`${environment.apiUrl}/save_plo_ylo.php`, body).subscribe((res: any) => {
      if (res.success) {
        alert(res.message || 'บันทึก PLO สำเร็จ');
        this.loadPloYloData();
        this.showPloModal = false;
      } else {
        alert(res.message);
      }
    });
  }
  getYlosByYear(plo: any, year: number) {
    return (plo.ylos || []).filter((y: any) => Number(y.level) === Number(year));
  }
  // ✨ ฟังก์ชันบันทึกข้อมูล SubPLO
  saveSubPlo() {
    if (this.subPloForm.invalid) {
      this.subPloForm.markAllAsTouched();
      return;
    }

    const formValue = this.subPloForm.value;

    let subPloName = '';

    if (this.isEditMode) {
      subPloName = this.selectedSubPlo.sub_plo_name;
    } else {
      const ploNo = String(this.selectedPlo.plo_name).replace('PLO', '').trim();

      const nextSubNo = (this.selectedPlo.sub_plos || []).length + 1;

      subPloName = `SubPLOs${ploNo}.${nextSubNo}`;
    }

    const body = {
      type: 'sub_plo',
      is_edit: this.isEditMode,
      sub_plo_id: this.isEditMode ? this.selectedSubPlo.sub_plo_id : null,

      plo_id: this.selectedPlo.plo_id,

      sub_plo_name: subPloName,

      description: formValue.description,
    };

    this.http.post(`${environment.apiUrl}/save_plo_ylo.php`, body).subscribe((res: any) => {
      if (res.success) {
        alert(res.message || 'บันทึก SubPLO สำเร็จ');

        this.loadPloYloData();

        this.showSubPloModal = false;
      } else {
        alert(res.message);
      }
    });
  }

  //  ฟังก์ชันบันทึก YLO แบบใหม่ (ปรับให้เข้ากับสวิตช์เปิดปิดชั้นปี)
  saveYloCustom() {
    if (this.yloForm.invalid) {
      this.yloForm.markAllAsTouched();
      return;
    }

    const formValue = this.yloForm.value;

    let yloName = formValue.ylo_name;
    let level: number | null = null;

    if (this.hasYearLevel) {
      level = Number(formValue.year);
    }

    // เพิ่มใหม่เท่านั้น ค่อย generate อัตโนมัติ
    if (!this.isEditMode) {
      if (this.hasYearLevel) {
        const yearYlos = (this.selectedPlo.ylos || []).filter(
          (y: any) => Number(y.level) === Number(level),
        );

        yloName = `YLO${level}.${yearYlos.length + 1}`;
      } else {
        const generalYlos = (this.selectedPlo.ylos || []).filter((y: any) => !y.level);

        yloName = `YLO1.${generalYlos.length + 1}`;
      }
    }

    const body = {
      type: 'ylo',
      is_edit: this.isEditMode,
      ylo_id: this.isEditMode ? this.selectedYlo?.ylo_id : null,
      plo_id: this.selectedPlo.plo_id,
      sub_plo_id: formValue.sub_plo_id,
      level: level,
      ylo_name: yloName,
      description: formValue.description,
    };

    this.http.post(`${environment.apiUrl}/save_plo_ylo.php`, body).subscribe((res: any) => {
      if (res.success) {
        alert('บันทึก YLO สำเร็จ');
        this.loadPloYloData();
        this.showYloModal = false;
      } else {
        alert(res.message);
      }
    });
  }

  // ✨ ฟังก์ชันลบข้อมูลแบบครอบคลุมประเภทใหม่
  confirmDelete(type: string, item: any) {
    this.deleteTargetType = type;
    if (type === 'course') this.selectedCourse = item;
    if (type === 'plo') this.selectedPlo = item;
    if (type === 'sub_plo') this.selectedSubPlo = item;
    if (type === 'ylo') this.selectedYlo = item;
    this.showDeleteModal = true;
  }

  executeDelete() {
    let type = this.deleteTargetType;
    let id = null;

    if (type === 'course') id = this.selectedCourse.curriculum_id;
    else if (type === 'plo') id = this.selectedPlo.plo_id;
    else if (type === 'sub_plo') id = this.selectedSubPlo.sub_plo_id;
    else if (type === 'ylo') id = this.selectedYlo.ylo_id;

    if (id) {
      this.http
        .post(`${environment.apiUrl}/delete_plo_ylo.php`, { type, id })
        .subscribe((res: any) => {
          if (res.success) {
            alert('ลบข้อมูลสำเร็จ');
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

  openDetail(course: any) {
    this.selectedCourse = course;
    this.showDetailModal = true;
  }

  closeModals() {
    this.showCourseModal = false;
    this.showDetailModal = false;
    this.showPloModal = false;
    this.showSubPloModal = false;
    this.showYloModal = false;
    this.showDeleteModal = false;
  }

  getDeleteModalTitle(): string {
    return this.deleteTargetType === 'course'
      ? 'ลบหลักสูตร'
      : this.deleteTargetType === 'plo'
        ? 'ลบ PLO หลัก'
        : this.deleteTargetType === 'sub_plo'
          ? 'ลบ SubPLO ย่อย'
          : 'ลบ YLO';
  }

  getDeleteModalMessage(): string {
    return 'คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้?\nการกระทำนี้จะไม่สามารถย้อนคืนได้ และจะลบข้อมูลลูกที่ผูกไว้ทั้งหมดออกจากระบบ';
  }
}
