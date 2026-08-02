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
    path: 'change-password',
    loadComponent: () =>
      import('./pages/change-password/change-password').then((m) => m.ChangePasswordComponent),
    canActivate: [authGuard],
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
          import('./pages/teacher/plo-assessment/plo-assessment.component').then(
            (m) => m.PloAssessmentComponent,
          ),
        canActivate: [authGuard],
        data: { role: 'teacher' },
      },
      {
        path: 'individual',
        loadComponent: () =>
          import('./pages/teacher/individual-consultation-appointments/individual-consultation-appointments').then(
            (m) => m.IndividualConsultationAppointments,
          ),
        canActivate: [authGuard],
        data: { role: 'teacher' },
      },
      {
        path: 'group',
        loadComponent: () =>
          import('./pages/teacher/group-consultation-appointments/group-consultation-appointments').then(
            (m) => m.GroupConsultationAppointments,
          ),
        canActivate: [authGuard],
        data: { role: 'teacher' },
      },
      {
        path: 'individual-record',
        loadComponent: () =>
          import('./pages/teacher/individual-record/individual-record').then(
            (m) => m.IndividualRecord,
          ),
        canActivate: [authGuard],
        data: { role: 'teacher' },
      },
      {
        path: 'group-record',
        loadComponent: () =>
          import('./pages/teacher/group-record/group-record').then((m) => m.GroupRecord),
        canActivate: [authGuard],
        data: { role: 'teacher' },
      },
      {
        path: 'student-result/:studentCode',
        loadComponent: () =>
          import('./pages/teacher/student-result-modal/student-result-modal.component').then(
            (m) => m.StudentResultModalComponent,
          ),
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
      {
        path: 'activity',
        loadComponent: () => import('./pages/student/activity/activity').then((m) => m.Activity),
        canActivate: [authGuard],
        data: { role: 'student' },
      },
      {
        path: 'certification',
        loadComponent: () =>
          import('./pages/student/certification/certification').then((m) => m.CertificationComponent),
        canActivate: [authGuard],
        data: { role: 'student' },
      },
      {
        path: 'advisor-record',
        loadComponent: () =>
          import('./pages/student/advisor-record/advisor-record').then((m) => m.AdvisorRecord),
        canActivate: [authGuard],
        data: { role: 'student' },
      },
      {
        path: 'advisor-information',
        loadComponent: () =>
          import('./pages/student/advisor-information/advisor-information').then(
            (m) => m.AdvisorInformation,
          ),
        canActivate: [authGuard],
        data: { role: 'student' },
      },
      {
        path: 'history-student-record',
        loadComponent: () =>
          import('./pages/student/history-student-record/history-student-record').then(
            (m) => m.HistoryStudentRecord,
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
          import('./pages/admin/users/users.component').then((m) => m.UsersComponent),
        canActivate: [authGuard],
        data: { role: 'admin' },
      },
      {
        path: 'students',
        loadComponent: () =>
          import('./pages/admin/students/students.component').then((m) => m.StudentsComponent),
        canActivate: [authGuard],
        data: { role: 'admin' },
      },
      {
        path: 'teachers',
        loadComponent: () =>
          import('./pages/admin/teachers/teachers.component').then((m) => m.TeachersComponent),
        canActivate: [authGuard],
        data: { role: 'admin' },
      },

      {
        path: 'reports',
        loadComponent: () =>
          import('./pages/admin/reports/reports.component').then((m) => m.ReportsComponent),
        canActivate: [authGuard],
        data: { role: 'admin' },
      },
      {
        path: 'plo',
        loadComponent: () => import('./pages/admin/plo/plo.component').then((m) => m.PloComponent),
        canActivate: [authGuard],
        data: { role: 'admin' },
      },
      {
        path: 'assign-advisor',
        loadComponent: () =>
          import('./pages/admin/assign-advisor/assign-advisor.component').then(
            (m) => m.AssignAdvisorComponent,
          ),
        canActivate: [authGuard],
        data: { role: 'admin' },
      },
      {
        path: 'advisor-history',
        loadComponent: () =>
          import('./pages/admin/advisor-history/advisor-history.component').then(
            (m) => m.AdvisorHistoryComponent,
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