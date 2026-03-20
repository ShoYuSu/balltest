import { Routes } from '@angular/router';
import { MainLayoutComponent } from './pages/layout/main-layout/main-layout.component';
import { authGuard } from './auth-guard';
import { loginGuard} from './login-guard';
import { StudyResultsComponent } from './pages/student/study-results/study-results.component';
import { PloEvaluationComponent } from './pages/student/plo-evaluation/plo-evaluation.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
    canActivate: [loginGuard],
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      //teacher
      {
        path: 'home',
        loadComponent: () =>
          import('./pages/teacher/home/home.component').then((m) => m.HomeComponent),
        canActivate: [authGuard],
        data: { role: 'teacher' },
      },
      {
        path: 'all-students',
        loadComponent: () =>
          import('./pages/teacher/all-students/all-students.component').then(
            (m) => m.AllStudentsComponent,
          ),
        canActivate: [authGuard],
        data: { role: 'teacher' },
      },
      {
        path: 'plo-assessment',
        loadComponent: () =>
          import('./pages/teacher/plo-assessment/plo-assessment').then((m) => m.PloAssessment),
        canActivate: [authGuard],
        data: { role: 'teacher' },
      },
      //student
      {
        path: 'personal-data',
        loadComponent: () =>
          import('./pages/student/personal-data/personal-data.component').then(
            (m) => m.PersonalDataComponent,
          ),
        canActivate: [authGuard],
        data: { role: 'student' },
      },
      {
        path: 'study-results',
        loadComponent: () =>
          import('./pages/student/study-results/study-results.component').then(
            (m) => m.StudyResultsComponent,
          ),
        canActivate: [authGuard],
        data: { role: 'student' },
      },
      {
        path: 'plo-evaluation',
        loadComponent: () =>
          import('./pages/student/plo-evaluation/plo-evaluation.component').then(
            (m) => m.PloEvaluationComponent,
          ),
        canActivate: [authGuard],
        data: { role: 'student' },
      },
      //admin
      {
        path: 'system-dashboard',
        loadComponent: () =>
          import('./pages/admin/system-dashboard/system-dashboard.component').then(
            (m) => m.SystemDashboardComponent,
          ),
        canActivate: [authGuard],
        data: { role: 'admin' },
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./pages/admin/users/users').then((m) => m.Users),
        canActivate: [authGuard],
        data: { role: 'admin' },
      },
      {
        path: 'students',
        loadComponent: () =>
          import('./pages/admin/students/students').then((m) => m.Students),
        canActivate: [authGuard],
        data: { role: 'admin' },
      },
      {
        path: 'teachers',
        loadComponent: () =>
          import('./pages/admin/teachers/teachers').then((m) => m.Teachers),
        canActivate: [authGuard],
        data: { role: 'admin' },
      },

      {
        path: 'reports',
        loadComponent: () =>
          import('./pages/admin/reports/reports').then((m) => m.Reports),
        canActivate: [authGuard],
        data: { role: 'admin' },
      },
      {
        path: 'plo',
        loadComponent: () =>
          import('./pages/admin/plo/plo').then((m) => m.Plo),
        canActivate: [authGuard],
        data: { role: 'admin' },
      },
      {
        path:'assign-advisor',
        loadComponent: () =>
          import('./pages/admin/assign-advisor/assign-advisor').then((m) => m.AssignAdvisor),
        canActivate: [authGuard],
        data: { role: 'admin' },
      },
      {
        path: 'advisor-history',
        loadComponent: () =>
          import('./pages/admin/advisor-history/advisor-history').then((m) => m.AdvisorHistory),
        canActivate: [authGuard],
        data: { role: 'admin' },
      },
      {
        path: '**',
        redirectTo: 'home',
      },
    ],
  },
];
