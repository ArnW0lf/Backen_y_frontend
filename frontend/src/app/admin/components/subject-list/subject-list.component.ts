import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService, Subject, Grade } from '../../../services/admin.service'; // Adjust path

@Component({
  selector: 'app-subject-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2>Subject List</h2>
        <a routerLink="/admin/subjects/new" class="btn btn-primary">Create New Subject</a>
      </div>
      <div *ngIf="successMessage" class="alert alert-success">{{ successMessage }}</div>
      <div *ngIf="error" class="alert alert-danger mt-3">Error: {{ error }}</div>
      <table class="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Code</th>
            <th>Assigned Grades (IDs)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let subject of subjects">
            <td>{{ subject.id }}</td>
            <td>{{ subject.name }}</td>
            <td>{{ subject.code }}</td>
            <td>{{ subject.grades?.join(', ') || 'N/A' }}</td>
            <td>
              <a [routerLink]="['/admin/subjects/edit', subject.id]" class="btn btn-sm btn-outline-secondary me-2">Edit</a>
              <button (click)="deleteSubject(subject.id!)" class="btn btn-sm btn-outline-danger">Delete</button>
            </td>
          </tr>
          <tr *ngIf="!subjects || subjects.length === 0">
            <td colspan="5" class="text-center">No subjects found.</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: []
})
export class SubjectListComponent implements OnInit {
  subjects: Subject[] = [];
  error: string | null = null;
  successMessage: string | null = null;
  //gradesMap: { [id: number]: string } = {}; // To map grade IDs to names if needed for display

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadSubjects();
    // this.loadGradesMap(); // If displaying grade names directly in the list
  }

  loadSubjects(): void {
    this.error = null;
    this.adminService.listSubjects().subscribe({
      next: (data) => {
        this.subjects = data;
      },
      error: (err) => {
        console.error('Error fetching subjects:', err);
        this.error = err.message || 'Could not load subjects.';
        if (err.status === 401 || err.status === 403) {
            this.error = "You are not authorized to view this page.";
        }
      }
    });
  }

  // Example: If you want to show grade names instead of IDs in the list
  // loadGradesMap(): void {
  //   this.adminService.listGrades().subscribe(grades => {
  //     grades.forEach(grade => this.gradesMap[grade.id] = `${grade.name} ${grade.section}`);
  //   });
  // }
  // getGradeNames(gradeIds: number[]): string {
  //   if (!gradeIds || gradeIds.length === 0) return 'N/A';
  //   return gradeIds.map(id => this.gradesMap[id] || `ID: ${id}`).join(', ');
  // }


  deleteSubject(subjectId: number): void {
    if (confirm('Are you sure you want to delete this subject? This may also affect teacher assignments.')) {
      this.adminService.deleteSubject(subjectId).subscribe({
        next: () => {
          this.successMessage = 'Subject deleted successfully.';
          this.error = null;
          this.subjects = this.subjects.filter(s => s.id !== subjectId);
          setTimeout(() => this.successMessage = null, 3000);
        },
        error: (err) => {
          console.error('Error deleting subject:', err);
          this.error = err.error?.detail || err.message || 'Could not delete subject.';
          if (err.status === 401 || err.status === 403) {
            this.error = "You are not authorized to perform this action.";
          }
          this.successMessage = null;
          setTimeout(() => this.error = null, 5000);
        }
      });
    }
  }
}
