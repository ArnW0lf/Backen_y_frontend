import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // For routerLink
import { AdminService, Student } from '../../../services/admin.service'; // Adjust path as necessary

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2>Student List</h2>
        <a routerLink="/admin/students/new" class="btn btn-primary">Create New Student</a>
      </div>
      <table class="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Name</th>
            <th>DNI</th>
            <th>Email</th>
            <th>Birth Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let student of students">
            <td>{{ student.id }}</td>
            <td>{{ student.username }}</td>
            <td>{{ student.first_name }} {{ student.last_name }}</td>
            <td>{{ student.dni }}</td>
            <td>{{ student.email }}</td>
            <td>{{ student.birth_date | date:'yyyy-MM-dd' }}</td>
            <td>
              <a [routerLink]="['/admin/students/edit', student.id]" class="btn btn-sm btn-outline-secondary me-2">Edit</a>
              <button (click)="deleteStudent(student.id!)" class="btn btn-sm btn-outline-danger">Delete</button>
            </td>
          </tr>
          <tr *ngIf="!students || students.length === 0">
            <td colspan="7" class="text-center">No students found.</td>
          </tr>
        </tbody>
      </table>
      <div *ngIf="error" class="alert alert-danger mt-3">
        Error fetching students: {{ error }}
      </div>
    </div>
  `,
  styles: []
})
export class StudentListComponent implements OnInit {
  students: Student[] = [];
  error: string | null = null;
  successMessage: string | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.adminService.listStudents().subscribe({
      next: (data) => {
        this.students = data;
        this.error = null;
      },
      error: (err) => {
        console.error('Error fetching students:', err);
        this.error = err.message || 'Could not load students.';
        if (err.status === 401 || err.status === 403) {
            this.error = "You are not authorized to view this page.";
        }
      }
    });
  }

  deleteStudent(studentId: number): void {
    if (confirm('Are you sure you want to delete this student?')) {
      this.adminService.deleteStudent(studentId).subscribe({
        next: () => {
          this.successMessage = 'Student deleted successfully.';
          this.error = null;
          this.students = this.students.filter(s => s.id !== studentId); // Optimistic update
          // OR: this.loadStudents(); // Re-fetch from server
          setTimeout(() => this.successMessage = null, 3000);
        },
        error: (err) => {
          console.error('Error deleting student:', err);
          this.error = err.error?.detail || err.message || 'Could not delete student.';
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
