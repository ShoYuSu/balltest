import {
  Component,
  inject,
  ViewChild,
  ElementRef,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../../environments/environment';
import { getAuthUser } from '../auth-user.util';

@Component({
  selector: 'app-certification',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './certification.html',
  styleUrl: './certification.css'
})

export class CertificationComponent implements OnInit {
  editingCertificate: any = null;
  showDeletePopup = false;

  selectedCertificate: any = null;
  @ViewChild('fileInput')
  fileInput!: ElementRef;

  private cdr       = inject(ChangeDetectorRef);
  private http      = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);
  private apiUrl    = environment.apiUrl;

  certificates: any[] = [];
  totalCertificates = 0;
  showModal = false;

  // View modal
  showViewModal = false;
  viewingCert: any = null;

  showSuccessPopup = false;

  certificateTitle = '';

  issueDate = '';

  selectedFile: File | null = null;

  // Calendar (date picker แบบเดียวกับหน้ากิจกรรม)
  showCalendar = false;
  calYear = new Date().getFullYear();
  calMonth = new Date().getMonth();
  dayNames = ['อา','จ','อ','พ','พฤ','ศ','ส'];
  monthNames = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
                'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];

  get calendarDays(): (number | null)[] {
    const first = new Date(this.calYear, this.calMonth, 1).getDay();
    const total = new Date(this.calYear, this.calMonth + 1, 0).getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < first; i++) days.push(null);
    for (let d = 1; d <= total; d++) days.push(d);
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }

  get displayDate(): string {
    if (!this.issueDate) return '';
    const d = new Date(this.issueDate);
    return `${d.getDate()} ${this.monthNames[d.getMonth()]} ${d.getFullYear() + 543}`;
  }

  isSelectedDay(day: number | null): boolean {
    if (!day || !this.issueDate) return false;
    const d = new Date(this.issueDate);
    return d.getFullYear() === this.calYear && d.getMonth() === this.calMonth && d.getDate() === day;
  }

  isToday(day: number | null): boolean {
    if (!day) return false;
    const t = new Date();
    return t.getFullYear() === this.calYear && t.getMonth() === this.calMonth && t.getDate() === day;
  }

  prevCal() { this.calMonth--; if (this.calMonth < 0) { this.calMonth = 11; this.calYear--; } this.cdr.detectChanges(); }
  nextCal() { this.calMonth++; if (this.calMonth > 11) { this.calMonth = 0; this.calYear++; } this.cdr.detectChanges(); }

  pickDay(day: number | null) {
    if (!day) return;
    this.issueDate = `${this.calYear}-${String(this.calMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    this.showCalendar = false;
    this.cdr.detectChanges();
  }

  // =========================
  // INIT
  // =========================

  ngOnInit(): void {

    this.loadCertificates();

  }
  openEditModal(item: any) {

  this.editingCertificate = item;

  this.certificateTitle = item.title;

  this.issueDate = item.issue_date;

  if (item.issue_date) {
    const d = new Date(item.issue_date);
    this.calYear = d.getFullYear();
    this.calMonth = d.getMonth();
  }
  this.showCalendar = false;

  this.showModal = true;

}
openDeleteConfirm(item:any){

  this.selectedCertificate = item;

  this.showDeletePopup = true;

}
deleteCertificate() {

  const formData = new FormData();

  formData.append(
    'id',
    this.selectedCertificate.certificate_id
  );

  this.http.post(
    `${this.apiUrl}/delete_certificate.php`,
    formData
  ).subscribe({

    next: () => {

      this.loadCertificates();

      this.showDeletePopup = false;

    }

  });

}
  // =========================
  // LOAD DATA
  // =========================

  loadCertificates() {

    const userId =
      getAuthUser().user_id;

    this.http.get<any[]>(
      `${this.apiUrl}/get_certificates.php?user_id=${userId}`
    ).subscribe({

     next: (res:any) => {

  console.log(res);

  this.certificates = res || [];

  this.totalCertificates =
    this.certificates.length;

  this.cdr.detectChanges();

},

      error: (err) => {

        console.log(err);

      }

    });

  }

  // =========================
  // MODAL
  // =========================

  openModal() {

    this.calYear = new Date().getFullYear();
    this.calMonth = new Date().getMonth();
    this.showCalendar = false;

    this.showModal = true;

  }

  closeModal() {

    this.showModal = false;
    this.editingCertificate = null;
    this.certificateTitle = '';

    this.issueDate = '';

    this.showCalendar = false;

    this.selectedFile = null;

    if (this.fileInput) {

      this.fileInput.nativeElement.value = '';

    }

  }

  closeSuccessPopup() {

    this.showSuccessPopup = false;

  }

  // =========================
  // FILE
  // =========================

  onFileSelected(event: any) {

    const file = event.target.files[0];

    if (file) {

      this.selectedFile = file;

      console.log(file);

    }

  }

  // =========================
  // SAVE
  // =========================

  
    saveCertificate() {
  console.log(
  'EDIT?',
  !!this.editingCertificate,
  'FILE:',
  this.selectedFile
);
  // EDIT MODE
  if (this.editingCertificate) {

    const formData = new FormData();

    formData.append(
      'id',
      this.editingCertificate.certificate_id
    );

    formData.append(
      'title',
      this.certificateTitle
    );

    formData.append(
      'issue_date',
      this.issueDate
    );
    if (this.selectedFile) {

  formData.append(
    'file',
    this.selectedFile
  );

}

    this.http.post(
      `${this.apiUrl}/update_certificate.php`,
      formData
    ).subscribe({

      next: (res:any) => {

        console.log(res);

        this.loadCertificates();

        this.closeModal();

        this.editingCertificate = null;

      },

      error: (err) => {

        console.log(err);

        alert('แก้ไขไม่สำเร็จ');

      }

    });

    return;
  }

  // ===== CREATE MODE เดิม =====
    if (!this.certificateTitle ||
        !this.issueDate ||
        !this.selectedFile) {

      alert('กรุณากรอกข้อมูลให้ครบ');

      return;

    }

    const formData = new FormData();

    formData.append(
      'title',
      this.certificateTitle
    );

    formData.append(
      'issue_date',
      this.issueDate
    );

    formData.append(
      'user_id',
      getAuthUser().user_id
    );

    formData.append(
      'file',
      this.selectedFile
    );

    this.http.post(
      `${this.apiUrl}/add_certificate.php`,
      formData
    ).subscribe({

      next: (res:any) => {

        console.log(res);

        // reload cards
        this.loadCertificates();

        // close upload modal
        this.closeModal();

        // show success popup
        this.showSuccessPopup = true;

      },

      error: (err) => {

        console.log(err);

        alert('เกิดข้อผิดพลาด');

      }

    });

  }

  openViewModal(item: any) { this.viewingCert = item; this.showViewModal = true; this.cdr.detectChanges(); }
  closeViewModal() { this.showViewModal = false; this.viewingCert = null; this.cdr.detectChanges(); }

  isPdf(url: string): boolean { return !!url?.toLowerCase().includes('.pdf'); }
  isImgUrl(url: string): boolean { return /\.(jpg|jpeg|png|gif|webp)$/i.test(url ?? ''); }

  certFileUrl(url: string): string {
    if (!url) return '';
    return url.startsWith('http') ? url : `${this.apiUrl}/${url}`;
  }

  safeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.certFileUrl(url));
  }
}