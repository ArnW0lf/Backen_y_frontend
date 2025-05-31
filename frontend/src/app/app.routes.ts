import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
// AdminDashboardComponent is now routed within the lazy-loaded AdminModule
// import { AdminDashboardComponent } from './components/dashboards/admin-dashboard.component';
import { TeacherDashboardComponent } from './components/dashboards/teacher-dashboard.component';
import { StudentDashboardComponent } from './components/dashboards/student-dashboard.component';
import { ParentDashboardComponent } from './components/dashboards/parent-dashboard.component';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  // { path: 'register', component: RegisterComponent }, // Example if you have a register route

  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    canActivate: [authGuard]
    // Note: The route 'admin/dashboard' is now defined within admin-routing.module.ts
  },

  // Other role-specific dashboards (if not part of a larger module)
  // TeacherDashboardComponent will be routed via TeacherModule now
  // { path: 'teacher/dashboard', component: TeacherDashboardComponent, canActivate: [authGuard] },
  {
    path: 'teacher',
    loadChildren: () => import('./teacher/teacher.module').then(m => m.TeacherModule),
    canActivate: [authGuard]
  },
  // StudentDashboardComponent will be routed via StudentModule now
  // { path: 'student/dashboard', component: StudentDashboardComponent, canActivate: [authGuard] },
  {
    path: 'student',
    loadChildren: () => import('./student/student.module').then(m => m.StudentModule),
    canActivate: [authGuard]
  },
  // ParentDashboardComponent will be routed via ParentModule now
  // { path: 'parent/dashboard', component: ParentDashboardComponent, canActivate: [authGuard] },
  {
    path: 'parent',
    loadChildren: () => import('./parent/parent.module').then(m => m.ParentModule),
    canActivate: [authGuard]
  },

  // Fallback for the old generic '/dashboard' to redirect.
  { path: 'dashboard', redirectTo: '/login', pathMatch: 'full'},

  { path: '', redirectTo: '/login', pathMatch: 'full' }, // Default route
  // Example: { path: '**', component: PageNotFoundComponent }, // Wildcard for PageNotFound
];
