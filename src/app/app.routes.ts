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
        path: '**',
        redirectTo: 'home',
      },
    ],
  },
];
