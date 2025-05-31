import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AdminService, Subject, Grade } from '../../../services/admin.service'; // Adjust path

@Component({
  selector: 'app-subject-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container mt-4">
      <h2>Create New Subject</h2>
      <div *ngIf="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
      </div>
      <div *ngIf="successMessage" class="alert alert-success">
        {{ successMessage }}
      </div>
      <form #subjectForm="ngForm" (ngSubmit)="onSubmit(subjectForm)">
        <div class="mb-3">
          <label for="name" class="form-label">Subject Name</label>
          <input type="text" class="form-control" id="name" name="name" ngModel required>
        </div>
        <div class="mb-3">
          <label for="code" class="form-label">Subject Code</label>
          <input type="text" class="form-control" id="code" name="code" ngModel required>
        </div>
        <div class="mb-3">
          <label for="grades" class="form-label">Assign to School Grades</label>
          <select multiple class="form-select" id="grades" name="grades" ngModel>
            <option *ngFor="let grade of availableGrades" [value]="grade.id">
              {{ grade.name }} - Section {{ grade.section }}
            </option>
          </select>
          <small class="form-text text-muted">Hold Ctrl/Cmd to select multiple grades.</small>
        </div>

        <button type="submit" class="btn btn-primary me-2" [disabled]="subjectForm.invalid">Create Subject</button>
        <a routerLink="/admin/subjects" class="btn btn-secondary">Cancel</a>
      </form>
    </div>
  `,
  styles: [`
    select[multiple] {
      min-height: 100px; /* Adjust as needed */
    }
  `]
})
export class SubjectCreateComponent implements OnInit {
  errorMessage: string | null = null;
  successMessage: string | null = null;
  availableGrades: Grade[] = [];

  // Ensure subjectData is initialized for ngModel if needed, or rely on form values directly
  subjectData: Partial<Subject> = { name: '', code: '', grades: [] };


  constructor(private adminService: AdminService, private router: Router) {}

  ngOnInit(): void {
    this.loadAvailableGrades();
  }

  loadAvailableGrades(): void {
    this.adminService.listGrades().subscribe({
      next: (data) => {
        this.availableGrades = data;
      },
      error: (err) => {
        console.error('Error fetching grades:', err);
        this.errorMessage = 'Could not load available school grades.';
      }
    });
  }

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      this.errorMessage = "Please fill all required fields.";
      return;
    }
    this.errorMessage = null;
    this.successMessage = null;

    // Ensure grades are numbers if they come as strings from select
    const selectedGradeIds = (form.value.grades || []).map((id: string | number) => +id);

    const newSubject: Partial<Subject> = {
      name: form.value.name,
      code: form.value.code,
      grades: selectedGradeIds
    };

    this.adminService.createSubject(newSubject).subscribe({
      next: (response) => {
        this.successMessage = 'Subject created successfully! ID: ' + response.id;
        setTimeout(() => this.router.navigate(['/admin/subjects']), 2000);
      },
      error: (err) => {
        console.error('Error creating subject:', err);
        if (err.error) {
          let errors = [];
          for (const key in err.error) {
            if (err.error.hasOwnProperty(key)) {
               errors.push(`${key}: ${Array.isArray(err.error[key]) ? err.error[key].join(', ') : err.error[key]}`);
            }
          }
          this.errorMessage = `Error creating subject: ${errors.join('; ')}`;
        } else {
          this.errorMessage = `Error creating subject: ${err.message || 'An unknown error occurred.'}`;
        }
      }
    });
  }
}
