import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-modal.component.html',
  // ใช้ CSS เดิมที่คุณมีใน project หรือใส่เพิ่มตามต้องการ
})
export class ConfirmModalComponent {
  @Input() isOpen: boolean = false;           // ควบคุมการเปิด/ปิด
  @Input() title: string = 'ยืนยันการทำรายการ';    // หัวข้อ (default)
  @Input() message: string = 'คุณแน่ใจใช่ไหม?';     // ข้อความ (default)
  @Input() confirmText: string = 'ตกลง';        // ข้อความปุ่มตกลง
  @Input() cancelText: string = 'ยกเลิก';        // ข้อความปุ่มยกเลิก
  @Input() type: 'danger' | 'warning' | 'info' = 'warning'; // ประเภท modal เพื่อเปลี่ยนสีไอคอน

  // ส่ง Event กลับไปหา Component แม่เมื่อกดปุ่ม
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
}