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
    { label: 'จำนวนผู้ใช้งานทั้งหมด', 
      value: 0, 
      icon: 'group', 
      bgColor: 'bg-blue-100', 
      textColor: 'text-blue-600',
       cardBg: 'bg-[#F3FBFF]' 
      },
    { label: 'จำนวนนักศึกษา',
       value: 0, 
       icon: 'school', 
       bgColor: 'bg-green-100', 
       textColor: 'text-green-600',
        cardBg: 'bg-[#F5FFFA]' 
      },
    { label: 'จำนวนอาจารย์',
       value: 0, 
       icon: 'person', 
       bgColor: 'bg-yellow-100', 
       textColor: 'text-yellow-600', 
       cardBg: 'bg-[#FFF9E5]' 
      },
    { label: 'ผู้ดูแลระบบ', 
       value: 0, 
       icon: 'assignment', 
       bgColor: 'bg-red-200', 
       textColor: 'text-red-600', 
       cardBg: 'bg-[#FFE5E5]' 
      }
  ];
}
