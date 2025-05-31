import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TeacherDashboardComponent } from '../components/dashboards/teacher-dashboard.component';
import { ManageGradesComponent } from './components/manage-grades/manage-grades.component';
import { ManageAttendanceComponent } from './components/manage-attendance/manage-attendance.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: TeacherDashboardComponent },
  { path: 'grades/manage', component: ManageGradesComponent },
  { path: 'attendance/manage', component: ManageAttendanceComponent },
  // Add other teacher-specific routes here
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TeacherRoutingModule { }
