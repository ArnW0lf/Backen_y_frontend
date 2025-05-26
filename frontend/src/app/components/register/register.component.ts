import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <div class="card-header bg-success text-white">
        <h4>Registro</h4>
      </div>
      <div class="card-body">
        <form (submit)="onSubmit()">
          <div class="mb-3">
            <label class="form-label">Usuario</label>
            <input type="text" class="form-control" 
                   [(ngModel)]="userData.username" 
                   name="username"
                   required>
          </div>
          <div class="mb-3">
            <label class="form-label">Contraseña</label>
            <input type="password" class="form-control" 
                   [(ngModel)]="userData.password" 
                   name="password"
                   required>
          </div>
          <div class="mb-3">
            <label class="form-label">Rol</label>
            <select class="form-select" [(ngModel)]="userData.role" name="role">
              <option value="STUDENT">Estudiante</option>
              <option value="TEACHER">Docente</option>
              <option value="PARENT">Padre</option>
            </select>
          </div>
          <button type="submit" class="btn btn-success w-100">Registrarse</button>
        </form>
      </div>
    </div>
  `,
  styles: []
})
export class RegisterComponent {
  userData = {
    username: '',
    password: '',
    role: 'STUDENT',
    dni: '',
    first_name: '',
    last_name: ''
  };

  constructor(private authService: AuthService) {}

  onSubmit() {
    this.authService.register(this.userData)
      .then(response => {
        console.log('Registro exitoso', response);
      })
      .catch(error => {
        console.error('Error en registro', error);
      });
  }
}