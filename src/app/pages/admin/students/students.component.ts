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
// import { ConfirmModalComponent } from '../../../shared/components/stat-cards/models/comfirm-modal/confirm-modal.component';
import { environment } from '../../../../environments/environment';
import { CurriculumManagementComponent } from '../../curriculum-management/curriculum-management.component';

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
    // ConfirmModalComponent,
    CurriculumManagementComponent,
  ],
  templateUrl: './students.html',
  styleUrl: './students.css',
})
export class StudentsComponent implements OnInit {
  // 1. ปรับการ Map Column ให้แม่นยำตาม Database
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
      header: 'หลักสูตร',
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
  // isDeleteModalOpen = false;
  // studentToDelete: any = null;
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
  users: any[] = [];
  isMajorDropdownOpen = false;
  isYearDropdownOpen = false;
  isFormMajorDropdownOpen = false;
  isFormYearDropdownOpen = false;

  newMajorName: string = '';
  isCurriculumModalOpen = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private cdr: ChangeDetectorRef, // เพิ่มเพื่อบังคับ Refresh หน้าจอ
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadStudents();
    this.loadMajors();
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

  // 2. ปรับการดึงข้อมูลให้นิ่งและรองรับ Change Detection
  loadStudents() {
    this.http.get<any[]>(`${environment.apiUrl}/get_students.php`).subscribe({
      next: (res) => {
        // ใช้ Spread Operator เพื่อสร้าง Array ใหม่ ป้องกันปัญหา UI ไม่ยอม Refresh
        this.students = [...res];
        this.updateStats();
        this.cdr.detectChanges(); // สั่งให้ Angular วาดหน้าจอทันที
      },
      error: (err) => console.error('Fetch error:', err),
    });
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
              // เลือกสาขานี้ให้ฟอร์มทันทีเพื่อให้ Valid และกดบันทึกได้
              this.selectMajor(trimmedMajor);
              this.newMajorName = '';
            } else {
              alert(res.message);
            }
          },
        });
    }
  }

  loadMajors() {
    this.http.get<any[]>(`${environment.apiUrl}/get_majors.php`).subscribe({
      next: (res) => {
        if (Array.isArray(res)) {
          const dbMajors = res.map((m: any) => m.major_name);
          this.majors = [
            ...new Set([...['วิทยาการข้อมูลและคอมพิวเตอร์', 'เทคโนโลยีการอาหาร'], ...dbMajors]),
          ];
        }
      },
    });
  }

  saveStudent() {
    this.submitted = true;
    if (this.studentForm.invalid || this.isSaving) return;

    this.isSaving = true;
    const studentData = {
      ...this.studentForm.value,
      image: this.imagePreview,
      student_id: this.isEditMode ? this.editingStudentId : null, // ส่งรูป Base64 ไปยัง PHP
    };

    this.http.post(`${environment.apiUrl}/add_student.php`, studentData).subscribe({
      next: (response: any) => {
        // รองรับทั้ง status success และ success: true
        if (response && (response.status === 'success' || response.success)) {
          alert('บันทึกข้อมูลสำเร็จ!');
          this.loadStudents();
          this.closeModal();
        } else {
          alert('ผิดพลาด: ' + (response?.message || 'ข้อมูลไม่ถูกต้อง'));
        }
        this.isSaving = false;
      },
      error: (err) => {
        console.error('HTTP Error:', err);
        alert('ติดต่อเซิร์ฟเวอร์ไม่ได้');
        this.isSaving = false;
      },
    });
  }

  // --- UI Helpers ---
  updateStats() {
    const totalStudents = this.students.length;
    
    // 1. นับจำนวนคนที่มีที่ปรึกษา (ต้องมีค่า, ไม่ใช่ค่าว่าง และไม่ใช่ขีด '-')
    const studentsWithAdvisor = this.students.filter(
      (s) => s.advisor_name && s.advisor_name.trim() !== '' && s.advisor_name !== '-'
    ).length;

    // 2. คนที่ยังไม่มีที่ปรึกษา (เอาจำนวนทั้งหมด ลบด้วยคนที่มีที่ปรึกษาแล้ว)
    const studentsWithoutAdvisor = totalStudents - studentsWithAdvisor;

    // 3. อัปเดตค่าเข้ากล่องสถิติทั้ง 3 กล่องให้ครบ
    this.studentStats[0].value = totalStudents;          // กล่องสีเขียว: นักศึกษาทั้งหมด
    this.studentStats[1].value = studentsWithAdvisor;    // กล่องสีเหลือง: มีที่ปรึกษาแล้ว
    this.studentStats[2].value = studentsWithoutAdvisor; // กล่องสีแดง: ยังไม่มีที่ปรึกษา
  }

  get filteredStudents() {
    const search = this.searchText.toLowerCase();

    return this.students.filter((s) => {
      // ตรวจสอบกล่องพิมพ์ Search
      const matchesSearch =
        (s.full_name || '').toLowerCase().includes(search) ||
        (s.student_code || '').includes(search);

      // ตรวจสอบ Dropdown สาขา
      const matchesMajor = this.selectedMajor === '' || s.major === this.selectedMajor;

      // ตรวจสอบ Dropdown ชั้นปี (แปลงเป็น string ป้องกัน Type Error)
      const matchesYear = this.selectedYear === '' || String(s.year) === String(this.selectedYear);

      return matchesSearch && matchesMajor && matchesYear;
    });
  }
  toggleGradeDropdown(courseId: number) {
    if (this.activeGradeDropdownId === courseId) {
      this.activeGradeDropdownId = null; // ถ้ากดซ้ำช่องเดิมให้หุบปิด
    } else {
      this.activeGradeDropdownId = courseId; // เปิดช่องใหม่
    }
  }
  selectGrade(courseId: number, gradeValue: string) {
    // 1. สั่งบันทึกข้อมูลและอัปเดตสเตตัสตัวแปรเกรดในระบบ
    this.onCourseStateChange(courseId, 'grade', gradeValue);

    // 2. ปิดหน้าต่างตัวเลือกเกรดที่กางอยู่ลงทันที
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
        this.cdr.detectChanges(); // บังคับให้พรีวิวรูปขึ้นทันที
      };
      reader.readAsDataURL(file);
    }
  }

 editStudent(student: any) {
  this.isEditMode = true;
   this.editingStudentId = student.student_id;

  this.studentForm.reset();

  this.isModalOpen = true;

  this.imagePreview = student.image
    ? `http://localhost:8080/api/${student.image}`
    : null;

  this.studentForm.patchValue({
    student_code: student.student_code,
    full_name: student.full_name,
    email: student.email,
    faculty: student.faculty,
    major: student.major,
    year: student.year,
    curriculum_year:
      student.major === 'เทคโนโลยีการอาหาร'
        ? '2567'
        : '2566',
        curriculum_id: student.curriculum_id
  });

  this.cdr.detectChanges();
}
  toggleStudentStatus(student: any) {
  const newStatus =
    student.status === 'inactive'
      ? 'active'
      : 'inactive';

  this.http
    .post(`${environment.apiUrl}/toggle_student_status.php`, {
      student_id: student.student_id, // ✅ เปลี่ยนจาก user_id เป็น student_id
      status: newStatus,
    })
    .subscribe({
      next: (res: any) => {
        if (res.success) {
          student.status = newStatus;

          this.updateStats();
          this.cdr.detectChanges();

          alert(
            newStatus === 'inactive'
              ? 'เปลี่ยนสถานะนักศึกษาเป็นศิษย์เก่าเรียบร้อย'
              : 'เปิดการมองเห็นนักศึกษาเรียบร้อย'
          );
        }
      },
      error: () => {
        alert('เกิดข้อผิดพลาด');
      },
    });
}

  // confirmDelete() {
  //   if (this.studentToDelete) {
  //     this.http
  //       .post(`${environment.apiUrl}/delete_student.php`, {
  //         student_id: this.studentToDelete.student_id,
  //       })
  //       .subscribe({
  //         next: (res: any) => {
  //           if (res.success) {
  //             // แจ้งเตือนย้ายสถานะเรียบร้อย
  //             alert('ย้ายสถานะนักศึกษาเป็นนักศึกษาเก่าเรียบร้อยแล้ว');

  //             // ⭐️ สั่งให้แถวของนักศึกษาคนนี้กลายเป็นสีเทาทันทีบนหน้าจอ
  //             const target = this.students.find(
  //               (s) => s.student_id === this.studentToDelete.student_id,
  //             );
  //             if (target) {
  //               target.status = 'inactive';
  //             }

  //             this.updateStats(); // คำนวณยอดสถิติใหม่
  //             this.isDeleteModalOpen = false;
  //             this.cdr.detectChanges(); // บังคับ Refresh หน้าจอ
  //           } else {
  //             alert(res.message);
  //           }
  //         },
  //         error: () => alert('เกิดข้อผิดพลาดทางเซิร์ฟเวอร์'),
  //       });
  //   }
  // }
 openStudentCurriculum(student: any) {
  this.selectedStudentForCurriculum = student;

  this.curriculumData = [];
  this.studentCoursesState = {};
  this.activeGradeDropdownId = null;

  this.isStudentCurriculumOpen = true;

  setTimeout(() => {
    this.http
      .get<any[]>(
        `${environment.apiUrl}/get_curriculum.php?major_name=${encodeURIComponent(student.major)}`
      )
      .subscribe({
        next: (res) => {
          console.log('curriculum by major:', res);

          this.curriculumData = Array.isArray(res) ? [...res] : [];

          this.cdr.detectChanges();

          this.loadStudentPassedCourses(student.student_id);
        },
        error: (err) => {
          console.error('โหลดหลักสูตรไม่สำเร็จ', err);
        },
      });
  }, 0);
}

  // ปรับฟังก์ชันโหลดประวัติเรียนผ่านให้สั่งอัปเดตหน้าจอด้วยเช่นกัน (ติ๊กถูกจะได้เด้งขึ้นมา)
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
                  year: item.year ,
                },
              };
            });
            // สั่งอัปเดตตัวติ๊กถูกบนหน้าจอ
            this.cdr.detectChanges();
          }
        },
      });
  }

  // ฟังก์ชันจังหวะกด ติ๊กถูก/ติ๊กออก วงกลมหน้าวิชา
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

  // ฟังก์ชันจังหวะที่แอดมินคลิกเปลี่ยนเกรด หรือเปลี่ยนเทอม/ปี ในตาราง
  onCourseStateChange(courseId: number, field: 'grade' | 'semester' | 'year', value: any) {
    if (!this.studentCoursesState[courseId]) {
      this.studentCoursesState[courseId] = { isChecked: true, grade: '-', semester: null, year: null };
    }

    if (field === 'grade') this.studentCoursesState[courseId].grade = value;
    if (field === 'semester') this.studentCoursesState[courseId].semester = Number(value);
    if (field === 'year') this.studentCoursesState[courseId].year = Number(value);

    this.updateCourseOnServer(courseId);
  }

  // ฟังก์ชันส่วนกลางสำหรับส่งข้อมูลปัจจุบันไปเซฟหลังบ้าน
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

  // cancelDelete() {
  //   this.isDeleteModalOpen = false;
  // }

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
  }

  selectMajor(major: string) {
    this.selectedMajor = major;
    this.isMajorDropdownOpen = false;
  }
  toggleFormMajorDropdown() {
    this.isFormMajorDropdownOpen = !this.isFormMajorDropdownOpen;
    if (this.isFormMajorDropdownOpen) this.isFormYearDropdownOpen = false;
  }

  toggleFormYearDropdown() {
    this.isFormYearDropdownOpen = !this.isFormYearDropdownOpen;
    if (this.isFormYearDropdownOpen) this.isFormMajorDropdownOpen = false;
  }

selectFormMajor(major: string) {
  // หาปีหลักสูตรโดยอัตโนมัติตามเงื่อนไขบรีฟของอาจารย์
  let curriculumYear = '';
  let curriculumId: number | null = null;
  if (major === 'เทคโนโลยีการอาหาร') {
    curriculumYear = '2567';
    curriculumId = 2;
  } else if (major === 'วิทยาการข้อมูลและคอมพิวเตอร์' || major === 'วิทยาการคอม') {
    curriculumYear = '2566';
    curriculumId = 3;
  }

  // ⭐️ แพทช์ค่าทั้งชื่อสาขา และ ปีหลักสูตร เข้าไปใน FormGroup พร้อมกันทันที
  this.studentForm.patchValue({ 
    major: major,
    curriculum_year: curriculumYear,
    curriculum_id: curriculumId // มั่นใจว่าฟอร์มมี Control ชื่อนี้ หรือเพิ่มฟิลด์นี้ใน FormBuilder
  });
  
  this.isFormMajorDropdownOpen = false;
}
prepareStudentData() {
  const formValue = this.studentForm.value;
  let detectedYear = formValue.curriculum_year;

  if (formValue.major === 'เทคโนโลยีการอาหาร') {
    detectedYear = '2567';
  } else if (formValue.major === 'วิทยาการข้อมูลและคอมพิวเตอร์' || formValue.major === 'วิทยาการคอม') {
    detectedYear = '2566';
  }

  // คืนค่าออบเจกต์ข้อมูลที่จะยิงไปหา API หลังบ้าน
  return {
    ...formValue,
    curriculum_year: detectedYear
  };
}

  selectFormYear(year: number) {
    this.studentForm.patchValue({ year: year.toString() }); // ⭐️ ยัดค่าเข้า FormGroup
    this.isFormYearDropdownOpen = false; // เลือกเสร็จปิดกล่องชั้นปีในฟอร์ม
  }
}
