import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: '<h2>Admin Dashboard</h2><p>Welcome, Administrator!</p>',
})
export class AdminDashboardComponent {}
