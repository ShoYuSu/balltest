import { Component, inject,ViewChild,ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-certification',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './certification.html',
  styleUrl: './certification.css'
})
export class CertificationComponent {
  @ViewChild('fileInput')
  fileInput!: ElementRef;
  private http = inject(HttpClient);

  totalCertificates = 0;

  showModal = false;

  certificateTitle = '';
  issueDate = '';

  selectedFile: File | null = null;

  openModal() {
    this.showModal = true;
  }

 closeModal() {

  this.showModal = false;

  // reset form
  this.certificateTitle = '';

  this.issueDate = '';

  // reset file
  this.selectedFile = null;

  // clear input file
  if (this.fileInput) {

    this.fileInput.nativeElement.value = '';

  }

}

 onFileSelected(event: any) {

  const file = event.target.files[0];

  if (file) {

    this.selectedFile = file;

    console.log(this.selectedFile);

  }

}

 saveCertificate() {

  console.log('SAVE CLICKED');

  if (!this.selectedFile) {

    alert('กรุณาเลือกไฟล์');

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

      alert('บันทึกสำเร็จ');

      this.closeModal();

    },

    error: (err) => {

      console.log(err);

      alert('เกิดข้อผิดพลาด');

    }

  });

}
}