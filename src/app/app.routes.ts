import { Routes } from '@angular/router';
import { MainLayoutComponent } from './pages/layout/main-layout/main-layout.component';
import { authGuard } from './auth-guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
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
        loadComponent: () =>
          import('./pages/plo-assessment/plo-assessment').then((m) => m.PloAssessment),
      },
      {
        path: '**',
        redirectTo: 'home',
      },
    ],
  },
];
