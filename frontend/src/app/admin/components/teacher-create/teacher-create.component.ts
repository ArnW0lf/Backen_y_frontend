import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AdminService, Teacher } from '../../../services/admin.service'; // Adjust path

@Component({
  selector: 'app-teacher-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container mt-4">
      <h2>Create New Teacher</h2>
      <div *ngIf="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
      </div>
      <div *ngIf="successMessage" class="alert alert-success">
        {{ successMessage }}
      </div>
      <form #teacherForm="ngForm" (ngSubmit)="onSubmit(teacherForm.value)">
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
          <label for="specialty" class="form-label">Specialty (Optional)</label>
          <input type="text" class="form-control" id="specialty" name="specialty" ngModel>
        </div>
        <!-- Role is implicitly 'TEACHER' through AdminService.createTeacher -->
        <button type="submit" class="btn btn-primary me-2" [disabled]="teacherForm.invalid">Create Teacher</button>
        <a routerLink="/admin/teachers" class="btn btn-secondary">Cancel</a>
      </form>
    </div>
  `,
  styles: []
})
export class TeacherCreateComponent {
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(private adminService: AdminService, private router: Router) {}

  onSubmit(formData: any): void {
    this.errorMessage = null;
    this.successMessage = null;

    const teacherData: Teacher = {
      username: formData.username,
      password: formData.password,
      email: formData.email,
      first_name: formData.first_name,
      last_name: formData.last_name,
      specialty: formData.specialty
      // role: 'TEACHER' is set by the service
    };

    this.adminService.createTeacher(teacherData).subscribe({
      next: (response) => {
        this.successMessage = 'Teacher created successfully! ID: ' + response.id;
        setTimeout(() => this.router.navigate(['/admin/teachers']), 2000);
      },
      error: (err) => {
        console.error('Error creating teacher:', err);
        if (err.error) {
          let errors = [];
          for (const key in err.error) {
            if (err.error.hasOwnProperty(key)) {
              errors.push(`${key}: ${err.error[key].join ? err.error[key].join(', ') : err.error[key]}`);
            }
          }
          this.errorMessage = `Error creating teacher: ${errors.join('; ')}`;
        } else {
          this.errorMessage = `Error creating teacher: ${err.message || 'An unknown error occurred.'}`;
        }
      }
    });
  }
}
