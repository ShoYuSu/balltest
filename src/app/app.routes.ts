import { Routes } from '@angular/router';
import { MainLayoutComponent } from './pages/layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'home',
        loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'all-students',
        loadComponent: () =>
          import('./pages/all-students/all-students.component').then((m) => m.AllStudentsComponent),

      },
      {
        path: 'plo-assessment',
        loadComponent: () => import('./pages/plo-assessment/plo-assessment').then((m) => m.PloAssessment)
      },
      {
        path: '**',
        redirectTo: 'home',
      },
    ],
  },
];
