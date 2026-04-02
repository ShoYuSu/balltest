import { Component, OnInit } from '@angular/core';
import { NgClass, CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TableColumnModel } from '../../../shared/components/stat-cards/models/table-option';

@Component({
  standalone: true,
  selector: 'app-plo',
  imports: [NgClass, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './plo.html',
  styleUrls: ['./plo.css'],
})
export class PloComponent implements OnInit {
  public dataSource: any[] = [];
  public columns: TableColumnModel[] = [
    { columnDef: "id", header: "รหัสหลักสูตร", tag: "text", display: true, width: "small", cell: (el) => el.id },
    { columnDef: "name", header: "ชื่อหลักสูตร", tag: "text", display: true, width: "medium", cell: (el) => el.name },
    { columnDef: "department", header: "สาขา", tag: "text", display: true, width: "large", cell: (el) => el.department },
    { columnDef: "year", header: "ปี", tag: "text", align: "center", display: true, width: "small", cell: (el) => el.year },
    { columnDef: "ploCount", header: "PLO", tag: "text-color", color: "#6366f1", align: "center", display: true, width: "small", cell: (el) => el.ploDetails?.length || 0 },
    { columnDef: "view", header: "", tag: "icon", align: "center", display: true, width: "small", cell: (el) => 'visibility' },
    { columnDef: "edit", header: "", tag: "edit", align: "center", display: true, width: "small", cell: (el) => el },
    { columnDef: "delete", header: "", tag: "delete", align: "center", display: true, width: "small", cell: (el) => el },
  ];

  // Modals Visibility
  showCourseModal = false;
  showDetailModal = false;
  showPloModal = false;
  showYloModal = false;
  showDeleteModal = false;

  isEditMode = false;
  submitted = false; // ตัวแปรดัก Error

  // Form Groups
  courseForm!: FormGroup;
  ploForm!: FormGroup;
  yloForm!: FormGroup;

  selectedCourse: any = null;
  selectedPlo: any = null;
  selectedYlo: any = null;
  deleteTargetType: 'course' | 'plo' | 'ylo' = 'course';

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initForms();
  }

  initForms() {
    this.courseForm = this.fb.group({
      id: ['', Validators.required],
      name: ['', [Validators.required, Validators.minLength(2)]],
      department: ['', Validators.required],
      year: [2569, [Validators.required, Validators.min(2500)]]
    });

    this.ploForm = this.fb.group({
      id: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(5)]]
    });

    this.yloForm = this.fb.group({
      id: ['', Validators.required],
      year: [1, Validators.required],
      description: ['', Validators.required]
    });
  }

  // Helper สำหรับเช็ค Error ใน HTML
  isInvalid(form: FormGroup, controlName: string) {
    return this.submitted && form.get(controlName)?.invalid;
  }

  // --- Course Logic ---
  openAddCourse() {
    this.submitted = false;
    this.isEditMode = false;
    this.courseForm.reset({ year: 2569, department: '' });
    this.showCourseModal = true;
  }

  openEditCourse(course: any) {
    this.submitted = false;
    this.isEditMode = true;
    this.selectedCourse = course;
    this.courseForm.patchValue(course);
    this.showCourseModal = true;
  }

  saveCourse() {
    this.submitted = true;
    if (this.courseForm.invalid) return;

    if (this.isEditMode) {
      const index = this.dataSource.findIndex(c => c.id === this.selectedCourse.id);
      this.dataSource[index] = { ...this.dataSource[index], ...this.courseForm.value };
    } else {
      this.dataSource = [...this.dataSource, { ...this.courseForm.value, ploDetails: [] }];
    }
    this.closeModals();
  }

  // --- PLO Logic ---
  openAddPlo() {
    this.submitted = false;
    this.isEditMode = false;
    const nextId = `PLO${(this.selectedCourse.ploDetails?.length || 0) + 1}`;
    this.ploForm.reset({ id: nextId });
    this.showPloModal = true;
  }

  openEditPlo(plo: any) {
    this.submitted = false;
    this.isEditMode = true;
    this.selectedPlo = plo;
    this.ploForm.patchValue(plo);
    this.showPloModal = true;
  }

  savePlo() {
    this.submitted = true;
    if (this.ploForm.invalid) return;

    if (!this.selectedCourse.ploDetails) this.selectedCourse.ploDetails = [];

    if (this.isEditMode) {
      const index = this.selectedCourse.ploDetails.findIndex((p: any) => p.id === this.selectedPlo.id);
      this.selectedCourse.ploDetails[index] = { ...this.selectedCourse.ploDetails[index], ...this.ploForm.value };
    } else {
      this.selectedCourse.ploDetails.push({ ...this.ploForm.value, ylos: [] });
    }
    this.showPloModal = false;
  }

  // --- YLO Logic ---
  openAddYlo(plo: any) {
    this.submitted = false;
    this.isEditMode = false;
    this.selectedPlo = plo;
    const nextId = `${plo.id}.${(plo.ylos?.length || 0) + 1}`;
    this.yloForm.reset({ id: nextId, year: 1 });
    this.showYloModal = true;
  }

  openEditYlo(plo: any, ylo: any) {
    this.submitted = false;
    this.isEditMode = true;
    this.selectedPlo = plo;
    this.selectedYlo = ylo;
    this.yloForm.patchValue(ylo);
    this.showYloModal = true;
  }

  saveYlo() {
    this.submitted = true;
    if (this.yloForm.invalid) return;

    if (!this.selectedPlo.ylos) this.selectedPlo.ylos = [];

    if (this.isEditMode) {
      const index = this.selectedPlo.ylos.findIndex((y: any) => y.id === this.selectedYlo.id);
      this.selectedPlo.ylos[index] = { ...this.yloForm.value };
    } else {
      this.selectedPlo.ylos.push({ ...this.yloForm.value });
    }
    this.showYloModal = false;
  }

  // --- General Logic ---
  openDetail(course: any) {
    this.selectedCourse = course;
    this.showDetailModal = true;
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
    if (this.deleteTargetType === 'course') {
      this.dataSource = this.dataSource.filter(c => c.id !== this.selectedCourse.id);
    } else if (this.deleteTargetType === 'plo') {
      this.selectedCourse.ploDetails = this.selectedCourse.ploDetails.filter((p: any) => p.id !== this.selectedPlo.id);
    } else if (this.deleteTargetType === 'ylo') {
      this.selectedPlo.ylos = this.selectedPlo.ylos.filter((y: any) => y.id !== this.selectedYlo.id);
    }
    this.showDeleteModal = false;
  }

  closeModals() {
    this.showCourseModal = false;
    this.showDetailModal = false;
    this.showPloModal = false;
    this.showYloModal = false;
    this.showDeleteModal = false;
    this.submitted = false;
  }

  getDeleteModalTitle() {
    return this.deleteTargetType === 'course' ? 'ลบหลักสูตร' : this.deleteTargetType === 'plo' ? 'ลบ PLO' : 'ลบ YLO';
  }

  getDeleteModalMessage() {
    return `คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้? การกระทำนี้ไม่สามารถย้อนกลับได้`;
  }
}