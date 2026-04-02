import { Component } from '@angular/core';
import { StatCardsComponent } from '../../../shared/components/stat-cards/stat-cards.component';
import { ActionMenuComponent } from '../../../shared/components/stat-cards/action-menu/action-menu.component';

@Component({
  selector: 'app-system-dashboard',
  imports: [StatCardsComponent, ActionMenuComponent],
  templateUrl: './system-dashboard.component.html',
  styleUrl: './system-dashboard.component.css',

})
export class SystemDashboardComponent {
  dashboardStats = [
    { label: 'จำนวนผู้ใช้งานทั้งหมด', value: 0, icon: 'group', bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
    { label: 'จำนวนนักศึกษา', value: 0, icon: 'school', bgColor: 'bg-green-50', textColor: 'text-green-600' },
    { label: 'จำนวนอาจารย์', value: 0, icon: 'person', bgColor: 'bg-yellow-50', textColor: 'text-yellow-600' },
    { label: 'ผู้ดูแลระบบ', value: 0, icon: 'assignment', bgColor: 'bg-red-50', textColor: 'text-red-600' }
  ];
}
