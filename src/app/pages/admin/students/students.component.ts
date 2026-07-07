import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { StatCardsComponent } from '../../../shared/components/stat-cards/stat-cards.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { TableColumnModel } from '../../../shared/components/stat-cards/models/table-option';
import { environment } from '../../../../environments/environment';
import { CurriculumManagementComponent } from '../../curriculum-management/curriculum-management.component';

// 🌟 Import SweetAlert2 เข้ามาใช้งาน
import Swal from 'sweetalert2';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    StatCardsComponent,
    ButtonComponent,
    CurriculumManagementComponent,
  ],
  templateUrl: './students.html',
  styleUrl: './students.css',
})
export class StudentsComponent implements OnInit {
  public columns: TableColumnModel[] = [
    {
      columnDef: 'profile',
      header: 'โปรไฟล์',
      tag: 'image',
      display: true,
      width: 'small',
      cell: (el) => (el.image ? `http://localhost:8080/api/${el.image}` : null),
    },
    {
      columnDef: 'student_code',
      header: 'รหัสนักศึกษา',
      tag: 'text',
      display: true,
      width: 'medium',
      cell: (el) => el.student_code,
    },
    {
      columnDef: 'name',
      header: 'ชื่อ-นามสกุล',
      tag: 'text',
      display: true,
      width: 'large',
      cell: (el) => el.full_name || '-',
    },
    {
      columnDef: 'email',
      header: 'อีเมล',
      tag: 'text',
      display: true,
      width: 'large',
      cell: (el) => el.email || '-',
    },
    {
      columnDef: 'faculty_major',
      header: 'สาขา',
      tag: 'text',
      display: true,
      width: 'large',
      cell: (el) => ` ${el.major}`,
    },
    {
      columnDef: 'year',
      header: 'ชั้นปี',
      tag: 'text',
      display: true,
      width: 'small',
      cell: (el) => `ปี ${el.year}`,
    },
    {
      columnDef: 'advisor',
      header: 'ที่ปรึกษา',
      tag: 'text',
      display: true,
      width: 'medium',
      cell: (el) => el.advisor_name || '-',
    },
    {
      columnDef: 'view_curriculum',
      header: 'ดูหลักสูตร',
      tag: 'action',
      display: true,
      width: 'medium',
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
      header: 'สถานะ',
      tag: 'delete',
      display: true,
      width: 'small',
      align: 'center',
      cell: (el) => el,
    },
  ];

  studentStats = [
    {
      label: 'นักศึกษาทั้งหมด',
      value: 0,
      icon: 'school',
      bgColor: 'bg-green-200',
      textColor: 'text-green-600',
      cardBg: 'bg-[#F5FFFA]',
    },
    {
      label: 'มีที่ปรึกษาแล้ว',
      value: 0,
      icon: 'person',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600',
      cardBg: 'bg-[#FFF9E5]',
    },
    {
      label: 'ยังไม่มีที่ปรึกษา',
      value: 0,
      icon: 'person_off',
      bgColor: 'bg-red-200',
      textColor: 'text-red-600',
      cardBg: 'bg-[#FFE5E5]',
    },
  ];

  isModalOpen = false;
  submitted = false;
  searchText = '';
  imagePreview: string | ArrayBuffer | null = null;
  studentForm!: FormGroup;
  students: any[] = [];
  isSaving = false;
  isEditMode = false;
  editingStudentId: number | null = null;
  selectedMajor = '';
  selectedYear: any = '';
  curriculumData: any[] = [];
  selectedStudentForCurriculum: any = null;
  isStudentCurriculumOpen = false;
  activeGradeDropdownId: number | null = null;
  studentCoursesState: {
    [courseId: number]: { isChecked: boolean; grade: string; semester: number | null; year: number | null };
  } = {};

  majors: string[] = ['วิทยาการข้อมูลและคอมพิวเตอร์', 'เทคโนโลยีการอาหาร'];
  // 🌟 รายการหลักสูตรที่โหลดจากฐานข้อมูลจริง (curriculum_id, curriculum_name, year) ผ่าน get_courses.php
  curriculums: any[] = [];
  users: any[] = [];
  isMajorDropdownOpen = false;
  isYearDropdownOpen = false;
  isFormMajorDropdownOpen = false;
  isFormCurriculumDropdownOpen = false;
  isFormYearDropdownOpen = false;

  newMajorName: string = '';
  isAddingNewMajor = false;
  isCurriculumModalOpen = false;

  currentPage: number = 1;
  pageSize: number = 5;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.currentPage = 1;
    this.loadStudents();
    this.loadMajors();
    this.loadCurriculums();
  }

  initForm() {
    this.studentForm = this.fb.group({
      student_code: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      full_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      faculty: ['วิทยาศาสตร์', Validators.required],
      major: ['', Validators.required],
      curriculum_id: [''],
      curriculum_year: [''],
      year: ['1', Validators.required],
    });
  }

  loadStudents() {
    this.http.get<any[]>(`${environment.apiUrl}/get_students.php`).subscribe({
      next: (res) => {
        this.students = [...res];
        this.updateStats();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Fetch error:', err),
    });
  }

  toggleAddNewMajor() {
    this.isAddingNewMajor = !this.isAddingNewMajor;
    if (!this.isAddingNewMajor) this.newMajorName = '';
  }

  addNewMajor() {
    const trimmedMajor = this.newMajorName.trim();
    if (trimmedMajor) {
      this.http
        .post(`${environment.apiUrl}/add_major.php`, { major_name: trimmedMajor })
        .subscribe({
          next: (res: any) => {
            if (res.success || res.message === 'มีสาขานี้อยู่แล้ว') {
              if (!this.majors.includes(trimmedMajor)) {
                this.majors.push(trimmedMajor);
              }
              Swal.fire({
                icon: 'success',
                title: 'เพิ่มสาขาสำเร็จ',
                text: `เพิ่ม "${trimmedMajor}" เข้าสู่ระบบเรียบร้อยแล้ว`,
                timer: 1500,
                showConfirmButton: false,
              });
              this.newMajorName = '';
              this.isAddingNewMajor = false;
            } else {
              // 🌟 จุดแก้ไขที่ 1: เปลี่ยนแจ้งเตือนสาขาผิดพลาด
              Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: res.message,
                confirmButtonColor: '#3085d6'
              });
            }
          },
        });
    }
  }

  loadMajors() {
    this.http.get<any>(`${environment.apiUrl}/get_majors.php`).subscribe({
      next: (res) => {
        // ⭐️ แก้ไข: get_majors.php ส่งกลับเป็น { success: true, majors: [...] }
        // ไม่ใช่ array ตรงๆ เหมือนที่โค้ดเดิมคาดไว้ (Array.isArray(res) เดิมเป็น false เสมอ)
        if (res && res.success && Array.isArray(res.majors)) {
          const dbMajors: string[] = res.majors;
          this.majors = [
            ...new Set([...['วิทยาการข้อมูลและคอมพิวเตอร์', 'เทคโนโลยีการอาหาร'], ...dbMajors]),
          ];
        }
      },
      error: (err) => console.error('โหลดสาขาล้มเหลว', err),
    });
  }

  // 🌟 โหลดรายการหลักสูตรทั้งหมดจากฐานข้อมูล (แทนการ hardcode curriculum_id/year)
  // ใช้ endpoint get_courses.php ที่มีอยู่แล้ว (ตัวเดียวกับหน้า PLO/YLO) ซึ่งคืน
  // res.curriculums เป็น array ของ { curriculum_id, curriculum_name, dept_id, year }
  loadCurriculums() {
    this.http.get<any>(`${environment.apiUrl}/get_courses.php`).subscribe({
      next: (res) => {
        const ok = res && (res.success !== undefined ? res.success : true);
        this.curriculums = ok && Array.isArray(res.curriculums) ? res.curriculums : [];
      },
      error: (err) => console.error('โหลดรายการหลักสูตรไม่สำเร็จ', err),
    });
  }

  saveStudent() {
    this.submitted = true;
    if (this.studentForm.invalid || this.isSaving) return;

    this.isSaving = true;
    const studentData = {
      ...this.studentForm.value,
      image: this.imagePreview,
      student_id: this.isEditMode ? this.editingStudentId : null,
    };

    this.http.post(`${environment.apiUrl}/add_student.php`, studentData).subscribe({
      next: (response: any) => {
        if (response && (response.status === 'success' || response.success)) {
          // 🌟 จุดแก้ไขที่ 2: แจ้งเตือนเมื่อบันทึกข้อมูลสำเร็จ (ใช้ Toast เล็กๆ สวยงามไม่ต้องคอยกดตกลง)
          Swal.fire({
            icon: 'success',
            title: 'สำเร็จ!',
            text: 'บันทึกข้อมูลเรียบร้อยแล้ว',
            timer: 2000,
            showConfirmButton: false
          });
          this.loadStudents();
          this.closeModal();
        } else {
          // 🌟 จุดแก้ไขที่ 3: แจ้งเตือนเมื่อข้อมูลไม่ถูกต้อง
          Swal.fire({
            icon: 'warning',
            title: 'ไม่สามารถบันทึกได้',
            text: response?.message || 'ข้อมูลไม่ถูกต้อง',
            confirmButtonColor: '#3085d6'
          });
        }
        this.isSaving = false;
      },
      error: (err) => {
        console.error('HTTP Error:', err);
        // 🌟 จุดแก้ไขที่ 4: แจ้งเตือนเมื่อเชื่อมต่อ Server ไม่ได้
        Swal.fire({
          icon: 'error',
          title: 'การเชื่อมต่อล้มเหลว',
          text: 'ไม่สามารถติดต่อเซิร์ฟเวอร์ได้ในขณะนี้',
          confirmButtonColor: '#d33'
        });
        this.isSaving = false;
      },
    });
  }

  updateStats() {
    const totalStudents = this.students.length;
    const studentsWithAdvisor = this.students.filter(
      (s) => s.advisor_name && s.advisor_name.trim() !== '' && s.advisor_name !== '-'
    ).length;
    const studentsWithoutAdvisor = totalStudents - studentsWithAdvisor;

    this.studentStats[0].value = totalStudents;
    this.studentStats[1].value = studentsWithAdvisor;
    this.studentStats[2].value = studentsWithoutAdvisor;
  }

  get filteredStudents() {
    const search = this.searchText.toLowerCase();
    const filtered = this.students.filter((s) => {
      const matchesSearch =
        (s.full_name || '').toLowerCase().includes(search) ||
        (s.student_code || '').includes(search);
      const matchesMajor = this.selectedMajor === '' || s.major === this.selectedMajor;
      const matchesYear = this.selectedYear === '' || String(s.year) === String(this.selectedYear);

      return matchesSearch && matchesMajor && matchesYear;
    });

    const startIndex = (this.currentPage - 1) * this.pageSize;
    return filtered.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages(): number {
    const search = this.searchText.toLowerCase();
    const filteredCount = this.students.filter((s) => {
      const matchesSearch = (s.full_name || '').toLowerCase().includes(search) || (s.student_code || '').includes(search);
      const matchesMajor = this.selectedMajor === '' || s.major === this.selectedMajor;
      const matchesYear = this.selectedYear === '' || String(s.year) === String(this.selectedYear);
      return matchesSearch && matchesMajor && matchesYear;
    }).length;

    return Math.ceil(filteredCount / this.pageSize) || 1;
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.cdr.detectChanges();
    }
  }

  toggleGradeDropdown(courseId: number) {
    if (this.activeGradeDropdownId === courseId) {
      this.activeGradeDropdownId = null;
    } else {
      this.activeGradeDropdownId = courseId;
    }
  }

  selectGrade(courseId: number, gradeValue: string) {
    this.onCourseStateChange(courseId, 'grade', gradeValue);
    this.activeGradeDropdownId = null;
  }

  openModal() {
    this.isEditMode = false;
    this.isModalOpen = true;
    this.imagePreview = null;
    this.studentForm.reset({ faculty: 'วิทยาศาสตร์', year: '1' });
  }

  closeModal() {
    this.isModalOpen = false;
    this.submitted = false;
    this.isEditMode = false;
    this.studentForm.reset({
      faculty: 'วิทยาศาสตร์',
      year: '1',
      curriculum_year: '',
    });
    this.imagePreview = null;
    this.cdr.detectChanges();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  editStudent(student: any) {
    this.isEditMode = true;
    this.editingStudentId = student.student_id;
    this.studentForm.reset();
    this.isModalOpen = true;
    this.imagePreview = student.image ? `http://localhost:8080/api/${student.image}` : null;

    // 🌟 หาปีหลักสูตรจากรายการ curriculums (โหลดจาก backend) โดยจับคู่ด้วย curriculum_id ก่อน
    // ถ้าไม่เจอ (เช่นข้อมูลเก่า) ค่อย fallback ไปใช้ค่า curriculum_year ที่ติดมากับตัวนักศึกษาเอง
    const matchedCurriculum = this.curriculums.find(
      (c) => Number(c.curriculum_id) === Number(student.curriculum_id),
    );
    const curriculumYear = matchedCurriculum?.year ?? student.curriculum_year ?? '';

    this.studentForm.patchValue({
      student_code: student.student_code,
      full_name: student.full_name,
      email: student.email,
      faculty: student.faculty,
      major: student.major,
      year: student.year,
      curriculum_year: curriculumYear,
      curriculum_id: student.curriculum_id
    });

    this.cdr.detectChanges();
  }

  toggleStudentStatus(student: any) {
    const newStatus = student.status === 'inactive' ? 'active' : 'inactive';

    this.http
      .post(`${environment.apiUrl}/toggle_student_status.php`, {
        student_id: student.student_id,
        status: newStatus,
      })
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            student.status = newStatus;
            this.updateStats();
            this.cdr.detectChanges();

            // 🌟 จุดแก้ไขหลัก (จากในรูปภาพ): เปลี่ยนปุ่มกดยืนยันสถานะสไตล์โมเดิร์น
            Swal.fire({
              icon: 'success',
              title: 'อัปเดตสถานะสำเร็จ',
              text: newStatus === 'inactive'
                ? 'เปลี่ยนสถานะนักศึกษาเป็นศิษย์เก่าเรียบร้อย'
                : 'เปิดการมองเห็นนักศึกษาเรียบร้อย',
              confirmButtonText: 'ตกลง',
              confirmButtonColor: '#3085d6'
            });
          }
        },
        error: () => {
          Swal.fire({
            icon: 'error',
            title: 'ผิดพลาด',
            text: 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะ',
            confirmButtonColor: '#d33'
          });
        },
      });
  }

  openStudentCurriculum(student: any) {
    this.selectedStudentForCurriculum = student;
    this.curriculumData = [];
    this.studentCoursesState = {};
    this.activeGradeDropdownId = null;
    this.isStudentCurriculumOpen = true;

    setTimeout(() => {
      this.http
        .get<any>(`${environment.apiUrl}/get_curriculum.php?major_name=${encodeURIComponent(student.major)}`)
        .subscribe({
          next: (res) => {
            // ⭐️ get_curriculum.php ตอนนี้ส่งกลับเป็น { categories: [...], curriculum_year: ... }
            this.curriculumData = Array.isArray(res?.categories) ? [...res.categories] : [];
            this.cdr.detectChanges();
            this.loadStudentPassedCourses(student.student_id);
          },
          error: (err) => console.error('โหลดหลักสูตรไม่สำเร็จ', err),
        });
    }, 0);
  }

  loadStudentPassedCourses(studentId: number) {
    this.http
      .get<any[]>(`${environment.apiUrl}/get_student_passed_courses.php?student_id=${studentId}`)
      .subscribe({
        next: (res) => {
          if (Array.isArray(res)) {
            res.forEach((item) => {
              this.studentCoursesState = {
                ...this.studentCoursesState,
                [item.course_id]: {
                  isChecked: true,
                  grade: item.grade || '-',
                  semester: item.semester,
                  year: item.year,
                },
              };
            });
            this.cdr.detectChanges();
          }
        },
      });
  }

  toggleCourseStatus(courseId: number) {
    const isCurrentlyChecked = this.studentCoursesState[courseId]?.isChecked || false;

    if (isCurrentlyChecked) {
      this.studentCoursesState[courseId].isChecked = false;
      this.http
        .post(`${environment.apiUrl}/save_student_course_check.php`, {
          student_id: this.selectedStudentForCurriculum.student_id,
          course_id: courseId,
          is_checked: false,
        })
        .subscribe();
    } else {
      this.studentCoursesState[courseId] = { isChecked: true, grade: '-', semester: null, year: null };
      this.updateCourseOnServer(courseId);
    }
  }

  onCourseStateChange(courseId: number, field: 'grade' | 'semester' | 'year', value: any) {
    if (!this.studentCoursesState[courseId]) {
      this.studentCoursesState[courseId] = { isChecked: true, grade: '-', semester: null, year: null };
    }

    if (field === 'grade') this.studentCoursesState[courseId].grade = value;
    if (field === 'semester') this.studentCoursesState[courseId].semester = Number(value);
    if (field === 'year') this.studentCoursesState[courseId].year = Number(value);

    this.updateCourseOnServer(courseId);
  }

  updateCourseOnServer(courseId: number) {
    const state = this.studentCoursesState[courseId];
    this.http
      .post(`${environment.apiUrl}/save_student_course_check.php`, {
        student_id: this.selectedStudentForCurriculum.student_id,
        course_id: courseId,
        is_checked: true,
        grade: state.grade,
        semester: state.semester,
        year: state.year,
      })
      .subscribe();
  }

  getCheckedCoursesCount(): number {
    return Object.values(this.studentCoursesState).filter((v) => v.isChecked).length;
  }

  toggleYearDropdown() {
    this.isYearDropdownOpen = !this.isYearDropdownOpen;
    if (this.isYearDropdownOpen) this.isMajorDropdownOpen = false;
  }

  toggleMajorDropdown() {
    this.isMajorDropdownOpen = !this.isMajorDropdownOpen;
    if (this.isMajorDropdownOpen) this.isYearDropdownOpen = false;
  }

  get uniqueMajors() {
    if (!this.students) return [];
    const majorsFromStudents = this.students.map((s) => s.major).filter((m) => m);
    return [...new Set(majorsFromStudents)];
  }

  selectYear(year: any) {
    this.selectedYear = year;
    this.isYearDropdownOpen = false;
    this.currentPage = 1;
  }

  selectMajor(major: string) {
    this.selectedMajor = major;
    this.isMajorDropdownOpen = false;
    this.currentPage = 1;
  }

  toggleFormMajorDropdown() {
    this.isFormMajorDropdownOpen = !this.isFormMajorDropdownOpen;
    if (this.isFormMajorDropdownOpen) {
      this.isFormYearDropdownOpen = false;
      this.isFormCurriculumDropdownOpen = false;
    }
  }

  toggleFormCurriculumDropdown() {
    this.isFormCurriculumDropdownOpen = !this.isFormCurriculumDropdownOpen;
    if (this.isFormCurriculumDropdownOpen) {
      this.isFormYearDropdownOpen = false;
      this.isFormMajorDropdownOpen = false;
    }
  }

  toggleFormYearDropdown() {
    this.isFormYearDropdownOpen = !this.isFormYearDropdownOpen;
    if (this.isFormYearDropdownOpen) {
      this.isFormMajorDropdownOpen = false;
      this.isFormCurriculumDropdownOpen = false;
    }
  }

  // 🌟 label ของหลักสูตรที่เลือกไว้ในฟอร์ม (ใช้โชว์ในปุ่ม dropdown)
  get selectedCurriculumLabel(): string {
    const id = this.studentForm.get('curriculum_id')?.value;
    if (!id) return '';
    const c = this.curriculums.find((c) => Number(c.curriculum_id) === Number(id));
    return c ? `${c.curriculum_name} (มคอ.2 - ${c.year})` : '';
  }

  // ⭐️ หลักสูตรที่กรองแล้วเฉพาะของสาขาที่เลือกอยู่ในฟอร์ม (ใช้แสดงใน dropdown)
  get filteredCurriculums() {
    const major = this.studentForm.get('major')?.value;
    if (!major) return [];
    return this.curriculums.filter((c) => c.major_name === major);
  }

  // 🌟 สาขา (major) — ตอนนี้ผูกกับหลักสูตรผ่าน major_name แล้ว
  selectFormMajor(major: string) {
    this.studentForm.patchValue({ major });
    this.isFormMajorDropdownOpen = false;

    // ⭐️ ถ้าสาขานี้มีหลักสูตรเดียว ให้ auto-fill ให้เลย (สะดวก ไม่ต้องกดซ้ำ)
    // ถ้ามีหลายหลักสูตร (เช่นมีหลักสูตรเก่า/ใหม่) ให้เคลียร์ค่าเดิม บังคับผู้ใช้เลือกเองให้ตรง
    const matches = this.curriculums.filter((c) => c.major_name === major);
    if (matches.length === 1) {
      this.studentForm.patchValue({
        curriculum_id: matches[0].curriculum_id,
        curriculum_year: matches[0].year,
      });
    } else {
      this.studentForm.patchValue({ curriculum_id: '', curriculum_year: '' });
    }
  }

  // 🌟 เลือกหลักสูตรจากรายการที่กรองตามสาขาแล้ว (filteredCurriculums)
  // set เฉพาะ curriculum_id / curriculum_year เท่านั้น ไม่แตะฟิลด์ major
  selectFormCurriculum(curriculum: any) {
    this.studentForm.patchValue({
      curriculum_year: curriculum.year,
      curriculum_id: curriculum.curriculum_id,
    });

    this.isFormCurriculumDropdownOpen = false;
  }

  prepareStudentData() {
    // curriculum_id / curriculum_year ถูกกำหนดค่าไว้แล้วตอนเลือกหลักสูตรใน selectFormCurriculum
    // จึงไม่ต้องเดาซ้ำจากชื่อสาขาอีก
    return { ...this.studentForm.value };
  }

  selectFormYear(year: number) {
    this.studentForm.patchValue({ year: year.toString() });
    this.isFormYearDropdownOpen = false;
  }
}