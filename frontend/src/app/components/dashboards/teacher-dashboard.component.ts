import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // Import RouterModule

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule], // Add RouterModule
  template: `
    <h2>Teacher Dashboard</h2>
    <p>Welcome, Teacher!</p>
    <nav class="nav flex-column">
      <a class="nav-link" routerLink="/teacher/grades/manage">Manage Grades</a>
      <a class="nav-link" routerLink="/teacher/attendance/manage">Manage Attendance</a>
      <!-- Add more links as needed -->
    </nav>
  `,
})
export class TeacherDashboardComponent {}
