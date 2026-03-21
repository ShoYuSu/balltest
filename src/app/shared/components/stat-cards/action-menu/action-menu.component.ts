import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-action-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './action-menu.component.html'
})
export class ActionMenuComponent {
  // ข้อมูลสำหรับปุ่มกด (ส่งไปที่ path: 'users' ตามที่คุณตั้งไว้)
  userActions = [
    { 
      label: 'เพิ่มผู้ใช้ใหม่', 
      icon: 'person_add', 
      link: '/users', 
      params: { mode: 'add' } 
    },
    { 
      label: 'แก้ไขข้อมูลผู้ใช้', 
      icon: 'edit', 
      link: '/users', 
      params: { mode: 'edit' } 
    },
    { 
      label: 'ลบผู้ใช้', 
      icon: 'delete', 
      link: '/users', 
      params: { mode: 'delete' }, 
      isDelete: true 
    },
  ];

  // กลุ่มเมนูการจัดการที่ปรึกษา
  advisorActions = [
    { label: 'กำหนดที่ปรึกษา', icon: 'person_search',link: '/assign-advisor', params: { mode: 'assign' } },
    { label: 'เปลี่ยนที่ปรึกษา', icon: 'sync', link: '/assign-advisor', params: { mode: 'change' } },
    { label: 'ดูประวัติที่ปรึกษา', icon: 'history', link: '/advisor-history', params: { mode: 'view-history' } },
  ];
}