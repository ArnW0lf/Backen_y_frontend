import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from '../components/dashboards/admin-dashboard.component';
import { StudentListComponent } from './components/student-list/student-list.component';
import { StudentCreateComponent } from './components/student-create/student-create.component';
import { StudentEditComponent } from './components/student-edit/student-edit.component';
import { TeacherListComponent } from './components/teacher-list/teacher-list.component';
import { TeacherCreateComponent } from './components/teacher-create/teacher-create.component';
import { TeacherEditComponent } from './components/teacher-edit/teacher-edit.component';
import { SubjectListComponent } from './components/subject-list/subject-list.component';
import { SubjectCreateComponent } from './components/subject-create/subject-create.component';
import { SubjectEditComponent } from './components/subject-edit/subject-edit.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: AdminDashboardComponent },
  // Student Routes
  { path: 'students', component: StudentListComponent },
  { path: 'students/new', component: StudentCreateComponent },
  { path: 'students/edit/:id', component: StudentEditComponent },
  // Teacher Routes
  { path: 'teachers', component: TeacherListComponent },
  { path: 'teachers/new', component: TeacherCreateComponent },
  { path: 'teachers/edit/:id', component: TeacherEditComponent },
  // Subject Routes
  { path: 'subjects', component: SubjectListComponent },
  { path: 'subjects/new', component: SubjectCreateComponent },
  { path: 'subjects/edit/:id', component: SubjectEditComponent },
  // Add other admin routes here
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
