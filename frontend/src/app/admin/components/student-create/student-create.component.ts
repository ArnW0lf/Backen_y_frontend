import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // For template-driven forms
import { Router, RouterModule } from '@angular/router';
import { AdminService, Student } from '../../../services/admin.service'; // Adjust path

@Component({
  selector: 'app-student-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container mt-4">
      <h2>Create New Student</h2>
      <div *ngIf="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
      </div>
      <div *ngIf="successMessage" class="alert alert-success">
        {{ successMessage }}
      </div>
      <form #studentForm="ngForm" (ngSubmit)="onSubmit(studentForm.value)">
        <div class="mb-3">
          <label for="username" class="form-label">Username</label>
          <input type="text" class="form-control" id="username" name="username" ngModel required>
        </div>
        <div class="mb-3">
          <label for="password" class="form-label">Password</label>
          <input type="password" class="form-control" id="password" name="password" ngModel required>
        </div>
        <div class="mb-3">
          <label for="email" class="form-label">Email</label>
          <input type="email" class="form-control" id="email" name="email" ngModel required>
        </div>
        <div class="mb-3">
          <label for="first_name" class="form-label">First Name</label>
          <input type="text" class="form-control" id="first_name" name="first_name" ngModel required>
        </div>
        <div class="mb-3">
          <label for="last_name" class="form-label">Last Name</label>
          <input type="text" class="form-control" id="last_name" name="last_name" ngModel required>
        </div>
        <div class="mb-3">
          <label for="dni" class="form-label">DNI</label>
          <input type="text" class="form-control" id="dni" name="dni" ngModel required>
        </div>
        <div class="mb-3">
          <label for="birth_date" class="form-label">Birth Date (YYYY-MM-DD)</label>
          <input type="date" class="form-control" id="birth_date" name="birth_date" ngModel required>
        </div>
        <!-- Role is implicitly 'STUDENT' through AdminService.createStudent -->
        <button type="submit" class="btn btn-primary me-2" [disabled]="studentForm.invalid">Create Student</button>
        <a routerLink="/admin/students" class="btn btn-secondary">Cancel</a>
      </form>
    </div>
  `,
  styles: []
})
export class StudentCreateComponent {
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(private adminService: AdminService, private router: Router) {}

  onSubmit(formData: any): void {
    this.errorMessage = null;
    this.successMessage = null;

    // Explicitly cast to Student type, ensuring all required fields are present
    const studentData: Student = {
      username: formData.username,
      password: formData.password,
      email: formData.email,
      first_name: formData.first_name,
      last_name: formData.last_name,
      dni: formData.dni,
      birth_date: formData.birth_date,
      // role: 'STUDENT' is set by the service
    };

    this.adminService.createStudent(studentData).subscribe({
      next: (response) => {
        this.successMessage = 'Student created successfully! ID: ' + response.id;
        // Optionally navigate away or reset form
        setTimeout(() => this.router.navigate(['/admin/students']), 2000);
      },
      error: (err) => {
        console.error('Error creating student:', err);
        if (err.error) {
          let errors = [];
          for (const key in err.error) {
            if (err.error.hasOwnProperty(key)) {
              errors.push(`${key}: ${err.error[key].join ? err.error[key].join(', ') : err.error[key]}`);
            }
          }
          this.errorMessage = `Error creating student: ${errors.join('; ')}`;
        } else {
          this.errorMessage = `Error creating student: ${err.message || 'An unknown error occurred.'}`;
        }
      }
    });
  }
}
