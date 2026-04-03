import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html'
})
export class ButtonComponent {
  @Input() label: string = 'เพิ่มนักศึกษา'; // ข้อความบนปุ่ม
  @Input() icon: string = 'add';           // ชื่อไอคอนจาก Google Symbols
  
  @Output() btnClick = new EventEmitter<void>(); // Event เมื่อกดปุ่ม

  handleClick() {
    this.btnClick.emit();
  }
}