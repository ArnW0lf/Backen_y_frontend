import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    LoginComponent,
    RegisterComponent
  ],
  template: `
    <div class="container mt-5">
      <app-login *ngIf="!showRegister"></app-login>
      <app-register *ngIf="showRegister"></app-register>
      
      <div class="text-center mt-3">
        <button class="btn btn-link" (click)="showRegister = !showRegister">
          {{ showRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate' }}
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .container {
        max-width: 400px;
      }
    `
  ]
})
export class AppComponent {
  showRegister = false;
}