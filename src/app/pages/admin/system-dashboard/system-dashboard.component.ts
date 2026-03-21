import { Component } from '@angular/core';
import { StatCardsComponent } from '../../../shared/components/stat-cards/stat-cards';
import { ActionMenuComponent } from '../../../shared/components/stat-cards/action-menu/action-menu.component';

@Component({
  selector: 'app-system-dashboard',
  imports: [StatCardsComponent, ActionMenuComponent],
  templateUrl: './system-dashboard.component.html',
  styleUrl: './system-dashboard.component.css',
})
export class SystemDashboardComponent {}
