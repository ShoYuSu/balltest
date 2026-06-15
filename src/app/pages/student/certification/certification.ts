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
    'http://localhost:8080/api/delete_certificate.php',
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
      localStorage.getItem('user_id');

    this.http.get<any[]>(
      `http://localhost:8080/api/get_certificates.php?user_id=${userId}`
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

    this.showModal = true;

  }

  closeModal() {

    this.showModal = false;
    this.editingCertificate = null;
    this.certificateTitle = '';

    this.issueDate = '';

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
      'http://localhost:8080/api/update_certificate.php',
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
      localStorage.getItem('user_id') || ''
    );

    formData.append(
      'file',
      this.selectedFile
    );

    this.http.post(
      'http://localhost:8080/api/add_certificate.php',
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
    return url.startsWith('http') ? url : `http://localhost:8080/api/${url}`;
  }

  safeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.certFileUrl(url));
  }
}