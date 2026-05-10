import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { StatCardsComponent } from '../../../shared/components/stat-cards/stat-cards.component';
import { ActionMenuComponent } from '../../../shared/components/stat-cards/action-menu/action-menu.component';


@Component({
  selector: 'app-system-dashboard',
  standalone: true,
  imports: [CommonModule, StatCardsComponent, ActionMenuComponent],
  templateUrl: './system-dashboard.component.html',
  styleUrl: './system-dashboard.component.css',
})
export class SystemDashboardComponent implements OnInit {
  
  dashboardStats = [
    { label: 'จำนวนผู้ใช้งานทั้งหมด', value: 0, icon: 'group', bgColor: 'bg-blue-100', textColor: 'text-blue-600', cardBg: 'bg-[#F3FBFF]' },
    { label: 'จำนวนนักศึกษา', value: 0, icon: 'school', bgColor: 'bg-green-100', textColor: 'text-green-600', cardBg: 'bg-[#F5FFFA]' },
    { label: 'จำนวนอาจารย์', value: 0, icon: 'person', bgColor: 'bg-yellow-100', textColor: 'text-yellow-600', cardBg: 'bg-[#FFF9E5]' },
    { label: 'ผู้ดูแลระบบ', value: 0, icon: 'assignment', bgColor: 'bg-red-200', textColor: 'text-red-600', cardBg: 'bg-[#FFE5E5]' }
  ];

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.http.get('http://localhost:8080/api/get_dashboard_stats.php').subscribe({
      next: (res: any) => {
        if (res.success) {
          // ใช้การ map เพื่อสร้าง Array ใหม่ ป้องกันปัญหาหน้าจอไม่ Refresh
          this.dashboardStats = this.dashboardStats.map(stat => {
            if (stat.label === 'จำนวนผู้ใช้งานทั้งหมด') return { ...stat, value: res.total };
            if (stat.label === 'จำนวนนักศึกษา') return { ...stat, value: res.student };
            if (stat.label === 'จำนวนอาจารย์') return { ...stat, value: res.teacher };
            if (stat.label === 'ผู้ดูแลระบบ') return { ...stat, value: res.admin };
            return stat;
          });
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('เรียก API Dashboard ไม่สำเร็จ:', err)
    });
  }
}