import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router'; // Import Router & RouterModule
import { AuthService } from './services/auth.service'; // Adjust path as needed

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule // Add RouterModule for routerLink
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private authService: AuthService, private router: Router) {}

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  getUserRole(): string | null {
    return this.authService.getUserRole();
  }

  logout(): void {
    this.authService.logout();
    // Navigation to /login is handled by authService.logout()
  }

  getDashboardLink(): string {
    const role = this.authService.getUserRole();
    if (role === 'ADMIN') return '/admin/dashboard';
    if (role === 'TEACHER') return '/teacher/dashboard';
    if (role === 'STUDENT') return '/student/dashboard';
    if (role === 'PARENT') return '/parent/dashboard';
    // Fallback if logged in but role is weird, or for a generic link if desired
    return this.isLoggedIn() ? '/login' : '/login'; // Default to login if role unknown or not logged in
  }
}