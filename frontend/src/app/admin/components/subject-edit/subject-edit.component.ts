import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminService, Subject, Grade } from '../../../services/admin.service'; // Adjust path

@Component({
  selector: 'app-subject-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container mt-4">
      <h2>Edit Subject</h2>
      <div *ngIf="isLoading" class="alert alert-info">Loading subject data...</div>
      <div *ngIf="errorMessage && !isLoading" class="alert alert-danger">
        {{ errorMessage }}
      </div>
      <div *ngIf="successMessage && !isLoading" class="alert alert-success">
        {{ successMessage }}
      </div>

      <form *ngIf="subject && !isLoading" #subjectForm="ngForm" (ngSubmit)="onSubmit(subjectForm)">
        <div class="mb-3">
          <label for="name" class="form-label">Subject Name</label>
          <input type="text" class="form-control" id="name" name="name" [(ngModel)]="subject.name" required>
        </div>
        <div class="mb-3">
          <label for="code" class="form-label">Subject Code</label>
          <input type="text" class="form-control" id="code" name="code" [(ngModel)]="subject.code" required>
        </div>
        <div class="mb-3">
          <label for="grades" class="form-label">Assign to School Grades</label>
          <select multiple class="form-select" id="grades" name="grades" [(ngModel)]="subject.grades">
            <option *ngFor="let grade of availableGrades" [value]="grade.id">
              {{ grade.name }} - Section {{ grade.section }}
            </option>
          </select>
          <small class="form-text text-muted">Hold Ctrl/Cmd to select multiple grades.</small>
        </div>

        <button type="submit" class="btn btn-primary me-2" [disabled]="subjectForm.invalid">Update Subject</button>
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
export class SubjectEditComponent implements OnInit {
  subject: Subject | null = null;
  subjectId: string | null = null;
  isLoading = true;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  availableGrades: Grade[] = [];

  constructor(
    private adminService: AdminService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.subjectId = this.route.snapshot.paramMap.get('id');
    this.loadAvailableGrades(); // Load grades first or in parallel
    if (this.subjectId) {
      this.loadSubjectData(this.subjectId);
    } else {
      this.errorMessage = 'Subject ID not found in route.';
      this.isLoading = false;
    }
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

  loadSubjectData(id: string): void {
    this.isLoading = true;
    this.adminService.getSubject(+id).subscribe({ // Convert id to number
      next: (data) => {
        // Ensure 'grades' is an array of numbers (IDs) for ngModel with multiple select
        this.subject = {
          ...data,
          grades: data.grades || [] // Assuming backend sends grade IDs in 'grades' field
        };
        this.isLoading = false;
        this.errorMessage = null;
      },
      error: (err) => {
        console.error('Error fetching subject:', err);
        this.errorMessage = err.error?.detail || err.message || 'Could not load subject data.';
        this.isLoading = false;
      }
    });
  }

  onSubmit(form: NgForm): void {
    if (!this.subject || !this.subjectId || form.invalid) {
      this.errorMessage = 'Form is invalid or subject data is missing.';
      return;
    }
    this.errorMessage = null;
    this.successMessage = null;

    // Ensure grades are numbers
    const selectedGradeIds = (form.value.grades || []).map((id: string | number) => +id);

    const subjectDataToUpdate: Partial<Subject> = {
      name: form.value.name,
      code: form.value.code,
      grades: selectedGradeIds
    };

    this.adminService.updateSubject(+this.subjectId, subjectDataToUpdate).subscribe({
      next: (response) => {
        this.successMessage = 'Subject updated successfully!';
        setTimeout(() => this.router.navigate(['/admin/subjects']), 2000);
      },
      error: (err) => {
        console.error('Error updating subject:', err);
        if (err.error) {
          let errors = [];
          for (const key in err.error) {
            if (err.error.hasOwnProperty(key)) {
              errors.push(`${key}: ${Array.isArray(err.error[key]) ? err.error[key].join(', ') : err.error[key]}`);
            }
          }
          this.errorMessage = `Error updating subject: ${errors.join('; ')}`;
        } else {
          this.errorMessage = `Error updating subject: ${err.message || 'An unknown error occurred.'}`;
        }
      }
    });
  }
}
