import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms'; // For template-driven forms
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminService, Student } from '../../../services/admin.service'; // Adjust path as needed

@Component({
  selector: 'app-student-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container mt-4">
      <h2>Edit Student</h2>
      <div *ngIf="isLoading" class="alert alert-info">Loading student data...</div>
      <div *ngIf="errorMessage && !isLoading" class="alert alert-danger">
        {{ errorMessage }}
      </div>
      <div *ngIf="successMessage && !isLoading" class="alert alert-success">
        {{ successMessage }}
      </div>

      <form *ngIf="student && !isLoading" #studentForm="ngForm" (ngSubmit)="onSubmit(studentForm)">
        <div class="mb-3">
          <label for="username" class="form-label">Username</label>
          <input type="text" class="form-control" id="username" name="username" [(ngModel)]="student.username" required>
        </div>

        <div class="mb-3">
          <label for="email" class="form-label">Email</label>
          <input type="email" class="form-control" id="email" name="email" [(ngModel)]="student.email" required>
        </div>
        <div class="mb-3">
          <label for="first_name" class="form-label">First Name</label>
          <input type="text" class="form-control" id="first_name" name="first_name" [(ngModel)]="student.first_name" required>
        </div>
        <div class="mb-3">
          <label for="last_name" class="form-label">Last Name</label>
          <input type="text" class="form-control" id="last_name" name="last_name" [(ngModel)]="student.last_name" required>
        </div>
        <div class="mb-3">
          <label for="dni" class="form-label">DNI</label>
          <input type="text" class="form-control" id="dni" name="dni" [(ngModel)]="student.dni" required [readonly]="true">
          <!-- DNI is often an identifier, so consider making it readonly -->
        </div>
        <div class="mb-3">
          <label for="birth_date" class="form-label">Birth Date (YYYY-MM-DD)</label>
          <input type="date" class="form-control" id="birth_date" name="birth_date" [ngModel]="student.birth_date | date:'yyyy-MM-dd'" (ngModelChange)="student.birth_date = $event" required>
        </div>

        <div class="mb-3">
          <label for="password" class="form-label">New Password (Optional)</label>
          <input type="password" class="form-control" id="password" name="password" ngModel>
          <small class="form-text text-muted">Leave blank to keep the current password.</small>
        </div>

        <button type="submit" class="btn btn-primary me-2" [disabled]="studentForm.invalid">Update Student</button>
        <a routerLink="/admin/students" class="btn btn-secondary">Cancel</a>
      </form>
    </div>
  `,
  styles: []
})
export class StudentEditComponent implements OnInit {
  student: Student | null = null;
  studentId: string | null = null;
  isLoading = true;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private adminService: AdminService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.studentId = this.route.snapshot.paramMap.get('id');
    if (this.studentId) {
      this.loadStudentData(this.studentId);
    } else {
      this.errorMessage = 'Student ID not found in route.';
      this.isLoading = false;
    }
  }

  loadStudentData(id: string): void {
    this.isLoading = true;
    this.adminService.getStudent(+id).subscribe({ // Convert id to number
      next: (data) => {
        this.student = data;
        // Password should not be pre-filled from backend for security
        if (this.student) this.student.password = '';
        this.isLoading = false;
        this.errorMessage = null;
      },
      error: (err) => {
        console.error('Error fetching student:', err);
        this.errorMessage = err.error?.detail || err.message || 'Could not load student data.';
        this.isLoading = false;
      }
    });
  }

  onSubmit(form: NgForm): void {
    if (!this.student || !this.studentId || form.invalid) {
      this.errorMessage = 'Form is invalid or student data is missing.';
      return;
    }
    this.errorMessage = null;
    this.successMessage = null;

    let studentDataToUpdate: Partial<Student> = { ...form.value };

    // Remove password from payload if it's empty (user doesn't want to change it)
    if (!studentDataToUpdate.password) {
      delete studentDataToUpdate.password;
    }

    // Remove DNI if it's meant to be non-editable, or ensure backend handles it.
    // For this example, DNI is included, but was readonly in form.
    // If DNI is truly non-editable, it might be better to exclude it from the update payload.
    // delete studentDataToUpdate.dni;


    this.adminService.updateStudent(this.studentId, studentDataToUpdate).subscribe({
      next: (response) => {
        this.successMessage = 'Student updated successfully!';
        setTimeout(() => this.router.navigate(['/admin/students']), 2000);
      },
      error: (err) => {
        console.error('Error updating student:', err);
        if (err.error) {
          let errors = [];
          for (const key in err.error) {
            if (err.error.hasOwnProperty(key)) {
              errors.push(`${key}: ${err.error[key].join ? err.error[key].join(', ') : err.error[key]}`);
            }
          }
          this.errorMessage = `Error updating student: ${errors.join('; ')}`;
        } else {
          this.errorMessage = `Error updating student: ${err.message || 'An unknown error occurred.'}`;
        }
      }
    });
  }
}
