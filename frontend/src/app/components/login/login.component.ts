import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login', // <-- ¡Esto es clave!
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <div class="card-header bg-primary text-white">
        <h4>Iniciar Sesión</h4>
      </div>
      <div class="card-body">
        <form (submit)="onSubmit()">
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

  constructor(private authService: AuthService) {}

  onSubmit() {
    this.authService.login(this.credentials.username, this.credentials.password)
      .then(response => {
        console.log('Login exitoso', response);
      })
      .catch(error => {
        console.error('Error en login', error);
      });
  }
}