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
import Swal from 'sweetalert2';

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

  public majorsList: string[] = [];
  public selectedMajorFilter: string | null = null;

  public yearsList = [
    { year_id: 1, year_name: 'ชั้นปีที่ 1' },
    { year_id: 2, year_name: 'ชั้นปีที่ 2' },
    { year_id: 3, year_name: 'ชั้นปีที่ 3' },
    { year_id: 4, year_name: 'ชั้นปีที่ 4' },
  ];

  public courseForm!: FormGroup;
  public ploForm!: FormGroup;
  public subPloForm!: FormGroup;
  public yloForm!: FormGroup;

  showCourseModal = false;
  showDetailModal = false;
  showPloModal = false;
  showSubPloModal = false;
  showYloModal = false;
  showDeleteModal = false;
  isDepartmentDropdownOpen = false;
  isMajorDropdownOpen = false;

  selectedCourse: any;
  selectedPlo: any;
  selectedSubPlo: any;
  selectedYlo: any;
  deleteTargetType: string = '';
  isEditMode = false;
  isYloYearDropdownOpen = false;
  hasYearLevel = true;

  public columns: TableColumnModel[] = [
    // {
    //   columnDef: 'curriculum_id',
    //   header: 'ID',
    //   tag: 'text',
    //   display: true,
    //   width: 'small',
    //   cell: (el) => el.curriculum_id,
    // },
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
      columnDef: 'major',
      header: 'สาขา',
      tag: 'text',
      display: true,
      width: 'medium',
      align: 'left',
      cell: (el) => el.major_name || '-',
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
    this.loadMajors();
  }

  get filteredDataSource(): any[] {
    if (!this.selectedMajorFilter) return this.dataSource;
    return this.dataSource.filter((row) => row.major_name === this.selectedMajorFilter);
  }

  setMajorFilter(major_name: string | null) {
    this.selectedMajorFilter = major_name;
    this.cdr.detectChanges();
  }

  isMajorFilterActive(major_name: string): boolean {
    return this.selectedMajorFilter === major_name;
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

  loadMajors() {
    this.http.get<any>(`${environment.apiUrl}/get_majors.php`).subscribe({
      next: (res) => {
        if (res && res.success) {
          this.majorsList = res.majors || []; // array ของชื่อสาขาล้วนๆ (string[])
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Error loading majors:', err),
    });
  }

  initForms() {
    this.courseForm = this.fb.group({
      curriculum_id: [null], 
      curriculum_name: ['', Validators.required],
      dept_id: [1, Validators.required],
      major_name: [null, Validators.required],
      year: [new Date().getFullYear() + 543, Validators.required],
    });

    this.ploForm = this.fb.group({
      plo_name: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(2)]],
    });

    this.subPloForm = this.fb.group({
      description: ['', Validators.required],
    });

    this.yloForm = this.fb.group({
      ylo_id: [''],
      ylo_name: [''],
      year: [1, Validators.required],
      description: ['', Validators.required],
      sub_plo_id: [null],
    });
  }

  isInvalid(form: FormGroup, field: string): boolean {
    const control = form.get(field);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  async loadPloYloData(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.get<any>(`${environment.apiUrl}/get_courses.php`).subscribe({
        next: (res) => {
          if (!res || !(res.success !== undefined ? res.success : true)) {
            this.dataSource = [];
            resolve();
            return;
          }

          const curriculums = res.curriculums || [];
          curriculums.sort((a: any, b: any) => Number(a.curriculum_id) - Number(b.curriculum_id));
          const plos = res.plos || [];
          const ylos = res.ylos || [];
          const subPlos = res.sub_plos || [];

          this.dataSource = curriculums.map((course: any) => {
            const coursePlos = plos
              .filter(
                (p: any) =>
                  p.curriculum_id?.toString().trim() === course.curriculum_id?.toString().trim(),
              )
              .map((plo: any) => {
                const ploSubPlosRaw = subPlos.filter(
                  (s: any) => Number(s.plo_id) === Number(plo.plo_id),
                );

                const allPloYlos = ylos.filter((y: any) => Number(y.plo_id) === Number(plo.plo_id));

                const ploSubPlos = ploSubPlosRaw.map((subPlo: any) => {
                  return {
                    ...subPlo,
                    ylos: allPloYlos.filter(
                      (y: any) => String(y.sub_plo_id) === String(subPlo.sub_plo_id),
                    ),
                  };
                });

                const ploYlos = allPloYlos.filter((y: any) => {
                  const sid = y.sub_plo_id;
                  return sid === null || sid === undefined || sid === '' || sid === '0' || Number(sid) === 0;
                });

                return {
                  ...plo,
                  sub_plos: ploSubPlos,
                  ylos: ploYlos,
                };
              });

            return { ...course, ploDetails: coursePlos };
          });

          if (this.selectedCourse) {
            const updated = this.dataSource.find(
              (c) =>
                c.curriculum_id?.toString().trim() ===
                this.selectedCourse.curriculum_id?.toString().trim(),
            );
            if (updated) this.selectedCourse = updated;
          }

          this.cdr.detectChanges();
          resolve();
        },
        error: (err) => reject(err),
      });
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

  toggleMajorDropdown() {
    this.isMajorDropdownOpen = !this.isMajorDropdownOpen;
  }

  selectMajor(major: string) {
    this.courseForm.patchValue({ major_name: major });
    this.courseForm.get('major_name')?.markAsDirty();
    this.isMajorDropdownOpen = false;
    this.cdr.detectChanges();
  }

  getSelectedMajorName(): string {
    const selected = this.courseForm.get('major_name')?.value;
    return selected || 'เลือกสาขา';
  }

  openAddCourse() {
    this.isEditMode = false;
    this.courseForm.reset({
      year: new Date().getFullYear() + 543,
      dept_id: 1,
      major_name: null,
      curriculum_id: '',
      curriculum_name: '',
    });
    this.courseForm.get('curriculum_id')?.disable();
    this.showCourseModal = true;
  }

  toggleYloYearDropdown() {
    this.isYloYearDropdownOpen = !this.isYloYearDropdownOpen;
  }

  selectYloYear(year: number) {
    this.yloForm.patchValue({ year: year });
    this.isYloYearDropdownOpen = false;
    this.cdr.detectChanges();
  }

  openEditCourse(course: any) {
    this.isEditMode = true;
    this.selectedCourse = course;
    this.courseForm.patchValue({
      curriculum_id: course.curriculum_id,
      curriculum_name: course.curriculum_name,
      dept_id: Number(course.dept_id),
      major_name: course.major_name || null,
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
    this.selectedPlo = { ...plo }; // ✅ clone เพื่อกัน reference หาย
    this.ploForm.patchValue({
      plo_name: plo.plo_name || plo.code,
      description: plo.description,
    });
    this.showPloModal = true;
  }

  openAddSubPlo(plo: any) {
    this.isEditMode = false;
    this.selectedPlo = { ...plo }; // ✅ clone
    this.subPloForm.reset();
    this.showSubPloModal = true;
  }

  openEditSubPlo(plo: any, subPlo: any) {
    this.isEditMode = true;
    this.selectedPlo = { ...plo };       // ✅ clone
    this.selectedSubPlo = { ...subPlo }; // ✅ clone
    this.subPloForm.patchValue({
      description: subPlo.description,
    });
    this.showSubPloModal = true;
  }

  openAddYloCustom(plo: any, subPlo?: any) {
    this.isEditMode = false;
    this.selectedPlo = { ...plo };                              // ✅ clone
    this.selectedSubPlo = subPlo ? { ...subPlo } : null;        // ✅ clone
    this.hasYearLevel = true;
    this.yloForm.reset({
      ylo_id: '',
      year: 1,
      description: '',
      sub_plo_id: subPlo ? subPlo.sub_plo_id : null,
    });
    this.showYloModal = true;
    this.cdr.detectChanges();
  }

  getDynamicYloLabel(): string {
    if (!this.selectedPlo) return '';
    const currentYear = this.yloForm.get('year')?.value || 1;
    const ploNo = String(this.selectedPlo.plo_name).replace(/[^0-9]/g, '').trim();
    return `YLO ${currentYear}.${ploNo || '1'}`;
  }

  openEditYlo(plo: any, ylo: any) {
    this.isEditMode = true;
    this.selectedPlo = { ...plo };   // ✅ clone
    this.selectedYlo = { ...ylo };   // ✅ clone

    if (ylo.sub_plo_id) {
      const found = (plo.sub_plos || []).find(
        (s: any) => String(s.sub_plo_id) === String(ylo.sub_plo_id),
      );
      this.selectedSubPlo = found ? { ...found } : { sub_plo_id: ylo.sub_plo_id }; // ✅ clone
    } else {
      this.selectedSubPlo = null;
    }

    this.hasYearLevel = true;
    const currentLevel = ylo.level ?? ylo.year ?? 1;

    this.yloForm.patchValue({
      ylo_id: ylo.ylo_id,
      ylo_name: ylo.ylo_name,
      year: Number(currentLevel),
      description: ylo.description,
      sub_plo_id: ylo.sub_plo_id || null,
    });
    this.showYloModal = true;
    this.cdr.detectChanges();
  }

  saveCourse() {
    if (this.courseForm.invalid) {
      this.courseForm.markAllAsTouched();
      Swal.fire({
        icon: 'warning',
        title: 'ข้อมูลไม่ครบถ้วน',
        text: 'กรุณากรอกข้อมูลให้ครบถ้วนก่อนทำการบันทึก',
        confirmButtonColor: '#6366f1',
      });
      return;
    }

    const formValue = this.courseForm.getRawValue();
    const currentId = this.courseForm.get('curriculum_id')?.value;

    const body = {
      type: 'curriculum',
      is_edit: this.isEditMode,
      curriculum_id: this.isEditMode ? currentId : null,
      curriculum_name: formValue.curriculum_name,
      dept_id: Number(formValue.dept_id),
      major_name: formValue.major_name,
      year: formValue.year,
    };

    // ✅ console.log ตรวจสอบค่าก่อนส่ง
    console.log('[saveCourse] isEditMode:', this.isEditMode);
    console.log('[saveCourse] body:', body);

    this.http.post(`${environment.apiUrl}/save_plo_ylo.php`, body).subscribe({
      next: async (res: any) => {
        if (res.success) {
          Swal.fire({
            icon: 'success',
            title: 'บันทึกสำเร็จ',
            text: res.message || 'บันทึกข้อมูลเรียบร้อย',
            confirmButtonColor: '#6366f1',
            timer: 1500,
          });
          await this.loadPloYloData();
          this.closeModals(false);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: res.message || 'เกิดข้อผิดพลาดในการบันทึก',
            confirmButtonColor: '#ef4444',
          });
        }
      },
      error: (err) =>
        Swal.fire({
          icon: 'error',
          title: 'ผิดพลาด',
          text: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้',
          confirmButtonColor: '#ef4444',
        }),
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

    // ✅ ตรวจสอบ selectedPlo ก่อนบันทึก
    if (this.isEditMode && !this.selectedPlo?.plo_id) {
      console.error('[savePlo] isEditMode=true แต่ selectedPlo หรือ plo_id หายไป:', this.selectedPlo);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่พบข้อมูล PLO ที่จะแก้ไข กรุณาลองใหม่',
        confirmButtonColor: '#ef4444',
      });
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

    // ✅ console.log ตรวจสอบค่าก่อนส่ง
    console.log('[savePlo] isEditMode:', this.isEditMode);
    console.log('[savePlo] selectedPlo:', this.selectedPlo);
    console.log('[savePlo] body:', body);

    this.http.post(`${environment.apiUrl}/save_plo_ylo.php`, body).subscribe(async (res: any) => {
      if (res.success) {
        Swal.fire({
          icon: 'success',
          title: 'บันทึกสำเร็จ',
          text: res.message || 'บันทึก PLO สำเร็จ',
          confirmButtonColor: '#6366f1',
          timer: 1500,
        });
        await this.loadPloYloData();
        this.showPloModal = false;
        this.closeModals(false);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: res.message,
          confirmButtonColor: '#ef4444',
        });
      }
    });
  }

  getYlosByYear(plo: any, year: number) {
    return (plo.ylos || []).filter((y: any) => Number(y.level) === Number(year));
  }

  saveSubPlo() {
    if (this.subPloForm.invalid) {
      this.subPloForm.markAllAsTouched();
      return;
    }

    // ✅ ตรวจสอบ selectedSubPlo ก่อนบันทึก
    if (this.isEditMode && !this.selectedSubPlo?.sub_plo_id) {
      console.error('[saveSubPlo] isEditMode=true แต่ selectedSubPlo หรือ sub_plo_id หายไป:', this.selectedSubPlo);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่พบข้อมูล SubPLO ที่จะแก้ไข กรุณาลองใหม่',
        confirmButtonColor: '#ef4444',
      });
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

    // ✅ console.log ตรวจสอบค่าก่อนส่ง
    console.log('[saveSubPlo] isEditMode:', this.isEditMode);
    console.log('[saveSubPlo] selectedSubPlo:', this.selectedSubPlo);
    console.log('[saveSubPlo] body:', body);

    this.http.post(`${environment.apiUrl}/save_plo_ylo.php`, body).subscribe(async (res: any) => {
      if (res.success) {
        Swal.fire({
          icon: 'success',
          title: 'บันทึกสำเร็จ',
          text: res.message || 'บันทึก SubPLO สำเร็จ',
          confirmButtonColor: '#6366f1',
          timer: 1500,
        });
        await this.loadPloYloData();
        this.showSubPloModal = false;
        this.closeModals(false);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: res.message,
          confirmButtonColor: '#ef4444',
        });
      }
    });
  }

  saveYloCustom() {
    if (this.yloForm.invalid) {
      this.yloForm.markAllAsTouched();
      return;
    }

    // ✅ ตรวจสอบ selectedYlo ก่อนบันทึก
    if (this.isEditMode && !this.selectedYlo?.ylo_id) {
      console.error('[saveYloCustom] isEditMode=true แต่ selectedYlo หรือ ylo_id หายไป:', this.selectedYlo);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่พบข้อมูล YLO ที่จะแก้ไข กรุณาลองใหม่',
        confirmButtonColor: '#ef4444',
      });
      return;
    }

    const formValue = this.yloForm.value;
    const level = Number(formValue.year || 1);
    const ploNo = String(this.selectedPlo.plo_name).replace(/[^0-9]/g, '').trim();
    const yloName = `YLO${level}.${ploNo || '1'}`;

    const body = {
      type: 'ylo',
      is_edit: this.isEditMode,
      ylo_id: this.isEditMode ? this.selectedYlo?.ylo_id : null,
      plo_id: this.selectedPlo.plo_id,
      sub_plo_id: this.selectedSubPlo
        ? this.selectedSubPlo.sub_plo_id
        : formValue.sub_plo_id || null,
      level: level,
      ylo_name: yloName,
      description: formValue.description,
    };

    // ✅ console.log ตรวจสอบค่าก่อนส่ง
    console.log('[saveYloCustom] isEditMode:', this.isEditMode);
    console.log('[saveYloCustom] selectedYlo:', this.selectedYlo);
    console.log('[saveYloCustom] body:', body);

    this.http.post(`${environment.apiUrl}/save_plo_ylo.php`, body).subscribe(async (res: any) => {
      if (res.success) {
        Swal.fire({
          icon: 'success',
          title: 'บันทึกสำเร็จ',
          text: 'บันทึก YLO สำเร็จ',
          confirmButtonColor: '#6366f1',
          timer: 1500,
        });
        await this.loadPloYloData();
        this.showYloModal = false;
        this.closeModals(false);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: res.message,
          confirmButtonColor: '#ef4444',
        });
      }
    });
  }

  confirmDelete(type: string, item: any) {
    this.deleteTargetType = type;
    if (type === 'course') this.selectedCourse = item;
    if (type === 'plo') this.selectedPlo = item;
    if (type === 'sub_plo') this.selectedSubPlo = item;
    if (type === 'ylo') this.selectedYlo = item;
    this.showDeleteModal = true;
    this.cdr.detectChanges();
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
        .subscribe(async (res: any) => {
          if (res.success) {
            Swal.fire({
              icon: 'success',
              title: 'ลบสำเร็จ',
              text: 'ลบข้อมูลเรียบร้อย',
              confirmButtonColor: '#6366f1',
              timer: 1500,
            });
            await this.loadPloYloData();
            this.showDeleteModal = false;
            this.closeModals(type === 'course');
          } else {
            Swal.fire({
              icon: 'error',
              title: 'เกิดข้อผิดพลาด',
              text: res.message || 'เกิดข้อผิดพลาดในการลบข้อมูล',
              confirmButtonColor: '#ef4444',
            });
          }
        });
    } else {
      this.showDeleteModal = false;
      this.cdr.detectChanges();
    }
  }

  openDetail(course: any) {
    this.selectedCourse = course;
    this.showDetailModal = true;
    this.cdr.detectChanges();
  }

  closeModals(closeDetail = false) {
    this.showCourseModal = false;
    this.showPloModal = false;
    this.showSubPloModal = false;
    this.showYloModal = false;
    this.showDeleteModal = false;
    this.isDepartmentDropdownOpen = false;
    this.isYloYearDropdownOpen = false;

    this.selectedPlo = null;
    this.selectedSubPlo = null;
    this.selectedYlo = null;
    this.isEditMode = false;

    if (closeDetail) {
      this.showDetailModal = false;
      this.selectedCourse = null;
    }
    this.cdr.detectChanges();
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