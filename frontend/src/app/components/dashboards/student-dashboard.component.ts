import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // Import RouterModule

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule], // Add RouterModule
  template: `
    <h2>Student Dashboard</h2>
    <p>Welcome, Student!</p>
    <nav class="nav flex-column">
      <a class="nav-link" routerLink="/student/my-information">View My Information</a>
      <!-- Add more links as needed -->
    </nav>
  `,
})
export class StudentDashboardComponent {}
