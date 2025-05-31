import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // Import RouterModule

@Component({
  selector: 'app-parent-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule], // Add RouterModule
  template: `
    <h2>Parent Dashboard</h2>
    <p>Welcome, Parent!</p>
    <nav class="nav flex-column">
      <a class="nav-link" routerLink="/parent/childrens-information">View Children's Information</a>
      <!-- Add more links as needed -->
    </nav>
  `,
})
export class ParentDashboardComponent {}
