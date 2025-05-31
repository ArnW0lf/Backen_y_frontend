import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router'; // Import Router

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <div class="card-header bg-primary text-white">
        <h4>Iniciar Sesión</h4>
      </div>
      <div class="card-body">
        <form (submit)="onSubmit()">
          <div class="alert alert-danger" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>
          <div class="mb-3">
            <label class="form-label">Usuario</label>
            <input type="text" class="form-control" 
                   [(ngModel)]="credentials.username" 
                   name="username"
                   required>
          </div>
          <div class="mb-3">
            <label class="form-label">Contraseña</label>
            <input type="password" class="form-control" 
                   [(ngModel)]="credentials.password" 
                   name="password"
                   required>
          </div>
          <button type="submit" class="btn btn-primary w-100">Ingresar</button>
        </form>
      </div>
    </div>
  `,
  styles: []
})
export class LoginComponent {
  credentials = { username: '', password: '' };
  errorMessage: string | null = null;

  constructor(private authService: AuthService, private router: Router) {} // Inject Router

  onSubmit() {
    this.errorMessage = null; // Reset error message
    this.authService.login(this.credentials.username, this.credentials.password)
      .subscribe({
        next: (response) => {
          console.log('Login exitoso', response);
          const role = this.authService.getUserRole();
          if (role === 'ADMIN') {
            this.router.navigate(['/admin/dashboard']);
          } else if (role === 'TEACHER') {
            this.router.navigate(['/teacher/dashboard']);
          } else if (role === 'STUDENT') {
            this.router.navigate(['/student/dashboard']);
          } else if (role === 'PARENT') {
            this.router.navigate(['/parent/dashboard']);
          } else {
            // Fallback if role is null or unrecognized
            // Potentially navigate to a generic authenticated page or show error
            console.warn('Unrecognized role or role not found, navigating to default.');
            this.router.navigate(['/login']); // Or a generic dashboard if one exists
          }
        },
        error: (error) => {
          console.error('Error en login', error);
          this.errorMessage = 'Error en el inicio de sesión. Verifique sus credenciales.';
          if (error.error && typeof error.error === 'object') {
            // Backend might send specific messages, e.g. {"non_field_errors": ["Unable to log in with provided credentials."]}
            const nonFieldErrors = error.error.non_field_errors;
            if (nonFieldErrors && Array.isArray(nonFieldErrors) && nonFieldErrors.length > 0) {
              this.errorMessage = nonFieldErrors.join(' ');
            }
          }
        }
      });
  }
}