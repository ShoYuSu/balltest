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
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';


interface ImportRow {
  line: number; // เลขแถวในไฟล์ (ไว้บอกตำแหน่งที่ผิด)
  category_name: string;
  category_credit: number;
  module_name: string;
  module_credit: number;
  course_code: string;
  course_name: string;
  credit: number;
  grade_system: string;
}

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
  major: string[] = ['วิทยาการข้อมูลและคอมพิวเตอร์', 'นวัตกรรมอาหารและการเป็นผู้ประกอบการ']; // มีค่าเริ่มต้นรอไว้
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

  isImportModal = false;
  isImporting = false;
  importFileName = '';
  importYear = '';
  importRows: ImportRow[] = [];
  importErrors: string[] = [];

  // หัวคอลัมน์ในไฟล์ (ภาษาไทย ให้อาจารย์กรอกง่าย)
  private readonly IMPORT_HEADERS = [
    'หมวดวิชา',
    'หน่วยกิตหมวด',
    'กลุ่มวิชา',
    'หน่วยกิตกลุ่ม',
    'รหัสวิชา',
    'ชื่อวิชา',
    'หน่วยกิต',
    'ระบบเกรด',
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
  ) {
    this.initForms();
  }

  ngOnInit(): void {
  // 1. ดึงรายชื่อสาขามาใส่ Dropdown (ถ้ามี)
  this.loadMajors(); 
  
  // 2. ⭐️ เพิ่มการเรียกฟังก์ชันดึงข้อมูลโครงสร้างหลักสูตรของสาขาเริ่มต้นทันที
  this.loadCurriculumData(); 
}

  ngOnChanges(changes: SimpleChanges): void {
    // ปล่อยฟังก์ชันนี้ให้ว่างไว้ หรือจะลบออกไปเลยก็ได้ครับ 
    // เพราะเราใช้ *ngIf ควบคุมที่หน้าหลักอยู่แล้ว ไม่จำเป็นต้องดักจับการเปลี่ยนแปลงซ้ำซ้อน
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
    // ⭐️ ลบการ hardcode ปีตามชื่อสาขาออกแล้ว — ปีที่แสดงตอนนี้จะดึงมาจาก
    // backend จริงๆ ใน loadCurriculumData() (ผ่าน res.curriculum_year)
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
    this.http.get<any>(`${environment.apiUrl}/get_majors.php`).subscribe({
      next: (res) => {
        // ⭐️ แก้ไข: get_majors.php ส่งกลับเป็น { success: true, majors: [...] }
        // ไม่ใช่ array ตรงๆ ดังนั้น Array.isArray(res) เดิมจะเป็น false เสมอ
        // และไม่เคย merge สาขาจาก backend เข้ามาเลยสักครั้ง
        if (res && res.success && Array.isArray(res.majors)) {
          const dbMajors: string[] = res.majors;
          this.major = [...new Set([...['วิทยาการข้อมูลและคอมพิวเตอร์', 'นวัตกรรมอาหารและการเป็นผู้ประกอบการ'], ...dbMajors])];

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
      .get<any>(
        `${environment.apiUrl}/get_curriculum.php?major_name=${encodeURIComponent(this.selectedMajor)}`,
      )
      .subscribe({
        next: (res: any) => {
          // 🟢 get_curriculum.php ส่งกลับเป็น array ของ categories ตรงๆ (ไม่ได้ห่อด้วย object)
          const categories = Array.isArray(res) ? res : (res?.categories ?? []);

          // กางแผง Accordion ออกมาทั้งหมด (true) เพื่อไม่ให้เกิดบั๊กหน้าจอว่างเปล่าตอนเปิดครั้งแรก
          this.curriculumData = categories.map((cat: any) => {
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

          // ⭐️ ใช้ปีหลักสูตรจริงจากฐานข้อมูลแทนการ hardcode ตามชื่อสาขา
          this.selectedYear = res?.curriculum_year ?? '-';

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
    major_name: this.selectedMajor,
    curriculum_year: this.selectedYear
  };

  const url = this.isEditCategoryMode
    ? `${environment.apiUrl}/update_category.php`
    : `${environment.apiUrl}/add_category.php`;

  if (this.isEditCategoryMode) {
    Object.assign(payload, {
      category_id: this.selectedEditCategoryId
    });
  }

  this.http.post(url, payload).subscribe({
    next: (res: any) => {
      if (res.success) {
        Swal.fire({
          icon: 'success',
          title: 'สำเร็จ',
          text: res.message || 'บันทึกหมวดวิชาเรียบร้อยแล้ว',
          timer: 1500,
          showConfirmButton: false,
        });
        this.loadCurriculumData();
        this.closeModal();
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'ไม่สามารถบันทึกได้',
          text: res.message,
          confirmButtonColor: '#3085d6',
        });
      }
    },
    error: () => {
      Swal.fire({
        icon: 'error',
        title: 'การเชื่อมต่อล้มเหลว',
        text: 'ไม่สามารถติดต่อเซิร์ฟเวอร์ได้ในขณะนี้',
        confirmButtonColor: '#d33',
      });
    },
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
  // ตัดคำนำหน้า "หมวด" ออก เพื่อใช้เป็นชื่อเรียกของสิ่งที่เพิ่มในหมวดนั้น
  // เช่น "หมวดวิชาศึกษาทั่วไป" -> "วิชาศึกษาทั่วไป" (ถ้าไม่มีชื่อหมวดให้ใช้ "กลุ่มวิชา")
  getModuleLabel(cat?: any): string {
    const name = (cat?.category_name || '').trim().replace(/^หมวด\s*/, '');
    return name || 'กลุ่มวิชา';
  }

  get selectedCategory(): any {
    return this.curriculumData.find((c) => c.category_id === this.selectedCatId);
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

  openImportModal() {
    this.importRows = [];
    this.importErrors = [];
    this.importFileName = '';
    this.importYear = /^\d{4}$/.test(this.selectedYear) ? this.selectedYear : '';
    this.isImportModal = true;
  }

  closeImportModal() {
    this.isImportModal = false;
    this.isImporting = false;
  }

  // ดาวน์โหลดไฟล์ตัวอย่างให้อาจารย์กรอก
  downloadTemplate() {
    const example = [
      this.IMPORT_HEADERS,
      ['หมวดวิชาศึกษาทั่วไป', 27, 'โมดูลสมรรถนะทางภาษา', 9, '117-401', 'ภาษาอังกฤษพื้นฐาน', 3, 'ปกติ (A-F)'],
      ['', '', '', '', '117-402', 'ภาษาอังกฤษขั้นสูง', 3, 'ปกติ (A-F)'],
      ['หมวดวิชาเฉพาะ', 99, 'วิชาแกน', 21, '128-101', 'คณิตศาสตร์พื้นฐาน', 3, 'ผ่าน/ไม่ผ่าน (S/U)'],
    ];
    const ws = XLSX.utils.aoa_to_sheet(example);
    ws['!cols'] = [{ wch: 26 }, { wch: 14 }, { wch: 30 }, { wch: 14 }, { wch: 12 }, { wch: 40 }, { wch: 10 }, { wch: 20 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'โครงสร้างหลักสูตร');
    XLSX.writeFile(wb, 'curriculum-template.xlsx');
  }

  async onImportFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.importRows = [];
    this.importErrors = [];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      this.importErrors = ['ไฟล์ใหญ่เกิน 5 MB'];
      return;
    }
    this.importFileName = file.name;

    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' }); // รองรับ .xlsx .xls .csv
      const ws = wb.Sheets[wb.SheetNames[0]];
      // header:1 = อ่านเป็น array ของแถว, defval:'' = ช่องว่างเป็น string ว่าง
      const raw: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', blankrows: false });
      this.parseImportRows(raw);
    } catch (e) {
      console.error(e);
      this.importErrors = ['อ่านไฟล์ไม่สำเร็จ กรุณาตรวจสอบว่าเป็นไฟล์ .xlsx หรือ .csv'];
    } finally {
      input.value = ''; // ให้เลือกไฟล์เดิมซ้ำได้
    }
  }

  private parseImportRows(raw: any[][]) {
    const errors: string[] = [];
    if (raw.length < 2) {
      this.importErrors = ['ไม่พบข้อมูลในไฟล์'];
      return;
    }

    // map หัวคอลัมน์ → index (ไม่บังคับลำดับ ขอแค่ชื่อหัวตรง)
    const head = raw[0].map((h) => String(h).trim());
    const idx: Record<string, number> = {};
    for (const h of this.IMPORT_HEADERS) idx[h] = head.indexOf(h);
    const missing = this.IMPORT_HEADERS.filter((h) => idx[h] < 0);
    if (missing.length) {
      this.importErrors = [`ไม่พบคอลัมน์: ${missing.join(', ')} (กด "ดาวน์โหลดไฟล์ตัวอย่าง" เพื่อดูรูปแบบ)`];
      return;
    }

    const cell = (r: any[], h: string) => String(r[idx[h]] ?? '').trim();
    const num = (v: string) => (v === '' ? NaN : Number(v));

    const rows: ImportRow[] = [];
    // fill-down: เซลล์หมวด/กลุ่มที่ว่าง (เช่นจาก merged cells) ให้ใช้ค่าของแถวบน
    let curCat = '', curCatCredit = 0, curMod = '', curModCredit = 0;

    for (let i = 1; i < raw.length; i++) {
      const r = raw[i];
      const line = i + 1;
      if (r.every((c) => String(c).trim() === '')) continue;

      const cat = cell(r, 'หมวดวิชา');
      if (cat) {
        curCat = cat;
        curCatCredit = num(cell(r, 'หน่วยกิตหมวด')) || 0;
        curMod = ''; // เปลี่ยนหมวด → ต้องระบุกลุ่มใหม่
      }
      const mod = cell(r, 'กลุ่มวิชา');
      if (mod) {
        curMod = mod;
        curModCredit = num(cell(r, 'หน่วยกิตกลุ่ม')) || 0;
      }

      const code = cell(r, 'รหัสวิชา');
      const name = cell(r, 'ชื่อวิชา');
      const credit = num(cell(r, 'หน่วยกิต'));
      const gradeRaw = cell(r, 'ระบบเกรด');

      // แถวที่มีแต่หมวด/กลุ่ม ไม่มีวิชา → ยอมรับ (สร้างกลุ่มว่าง)
      const hasCourse = code !== '' || name !== '';
      if (!curCat) { errors.push(`แถว ${line}: ไม่มีชื่อหมวดวิชา`); continue; }
      if (!curMod) { errors.push(`แถว ${line}: ไม่มีชื่อกลุ่มวิชา`); continue; }

      if (hasCourse) {
        if (!code) errors.push(`แถว ${line}: ไม่มีรหัสวิชา`);
        if (!name) errors.push(`แถว ${line}: ไม่มีชื่อวิชา`);
        if (isNaN(credit) || credit < 0) errors.push(`แถว ${line}: หน่วยกิตไม่ถูกต้อง`);
      }

      const grade = /S\s*\/\s*U|ผ่าน\s*\/\s*ไม่ผ่าน/i.test(gradeRaw)
        ? 'ผ่าน/ไม่ผ่าน (S/U)'
        : 'ปกติ (A-F)';

      rows.push({
        line,
        category_name: curCat,
        category_credit: curCatCredit,
        module_name: curMod,
        module_credit: curModCredit,
        course_code: code,
        course_name: name,
        credit: isNaN(credit) ? 0 : credit,
        grade_system: grade,
      });
    }

    // รหัสวิชาซ้ำในกลุ่มเดียวกัน
    const seen = new Set<string>();
    for (const r of rows) {
      if (!r.course_code) continue;
      const k = `${r.category_name}|${r.module_name}|${r.course_code}`;
      if (seen.has(k)) errors.push(`แถว ${r.line}: รหัสวิชา ${r.course_code} ซ้ำในกลุ่มเดียวกัน`);
      seen.add(k);
    }

    if (rows.length > 2000) errors.push('ไฟล์มีมากกว่า 2,000 แถว');
    this.importRows = rows;
    this.importErrors = errors;
  }

  // สรุปสำหรับ preview
  get importSummary() {
    const cats = new Set(this.importRows.map((r) => r.category_name));
    const mods = new Set(this.importRows.map((r) => r.category_name + '|' + r.module_name));
    const courses = this.importRows.filter((r) => r.course_code).length;
    return { cats: cats.size, mods: mods.size, courses };
  }

  // แปลงแถวแบนๆ → โครงสร้างซ้อน หมวด > กลุ่ม > วิชา
  private buildImportPayload() {
    const cats: any[] = [];
    for (const r of this.importRows) {
      let cat = cats.find((c) => c.category_name === r.category_name);
      if (!cat) {
        cat = { category_name: r.category_name, required_credit: r.category_credit, modules: [] };
        cats.push(cat);
      }
      let mod = cat.modules.find((m: any) => m.module_name === r.module_name);
      if (!mod) {
        mod = { module_name: r.module_name, required_credit: r.module_credit, courses: [] };
        cat.modules.push(mod);
      }
      if (r.course_code) {
        mod.courses.push({
          course_code: r.course_code,
          course_name: r.course_name,
          credit: r.credit,
          grade_system: r.grade_system,
        });
      }
    }
    return {
      major_name: this.selectedMajor,
      curriculum_year: Number(this.importYear),
      categories: cats,
    };
  }

  confirmImport() {
    if (this.isImporting || !this.importRows.length || this.importErrors.length) return;
    if (!/^\d{4}$/.test(this.importYear)) {
      Swal.fire({ icon: 'warning', title: 'กรุณาระบุปีหลักสูตร (พ.ศ. 4 หลัก)' });
      return;
    }

    this.isImporting = true;
    this.http.post<any>(`${environment.apiUrl}/import_curriculum.php`, this.buildImportPayload()).subscribe({
      next: (res) => {
        this.isImporting = false;
        if (res.success) {
          Swal.fire({
            icon: 'success',
            title: 'นำเข้าสำเร็จ',
            html: `เพิ่มหมวด ${res.categories_added} · กลุ่มวิชา ${res.modules_added}<br>เพิ่มรายวิชา ${res.courses_added} · อัปเดต ${res.courses_updated}`,
          });
          this.closeImportModal();
          this.loadCurriculumData();
        } else {
          Swal.fire({ icon: 'warning', title: 'นำเข้าไม่สำเร็จ', text: res.message });
        }
      },
      error: (err) => {
        this.isImporting = false;
        Swal.fire({
          icon: 'error',
          title: 'นำเข้าไม่สำเร็จ',
          text: err?.error?.message || 'ไม่สามารถติดต่อเซิร์ฟเวอร์ได้',
        });
      },
    });
  }
}