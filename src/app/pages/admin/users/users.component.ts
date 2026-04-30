import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';


@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  templateUrl: './users.html',
})
export class UsersComponent implements OnInit {
  userForm!: FormGroup;
  isModalOpen: boolean = false;
  isEditMode: boolean = false;
  submitted: boolean = false;
  imagePreview: string | null = null;

  // ประกาศตัวแปรสำหรับรับข้อมูลจาก API (คุณนำไปดึงค่าใส่ที่นี่)
  users: any[] = []; 

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['', Validators.required],
      profileImage: [null]
    });
  }

  // จัดการการเลือกรูปภาพ
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.userForm.patchValue({ profileImage: file });
      
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.submitted = false;
    this.imagePreview = null;
    this.userForm.reset({ role: '' });
    this.userForm.get('email')?.enable();
    this.userForm.get('role')?.enable();
    this.isModalOpen = true;
  }

  // ส่งข้อมูลไปบันทึก (คุณสามารถเขียนคำสั่งยิง API ตรงนี้)
  saveUser(): void {
    this.submitted = true;
    if (this.userForm.valid) {
      const data = this.userForm.getRawValue();
      console.log('ข้อมูลที่พร้อมส่งไป API:', data);
      
      // เมื่อบันทึกสำเร็จ:
      // this.isModalOpen = false;
    }
  }

  closeModal(): void {
    this.isModalOpen = false;
  }
}