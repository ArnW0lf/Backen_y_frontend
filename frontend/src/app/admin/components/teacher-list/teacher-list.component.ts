import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService, Teacher } from '../../../services/admin.service'; // Adjust path as necessary

@Component({
  selector: 'app-teacher-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2>Teacher List</h2>
        <a routerLink="/admin/teachers/new" class="btn btn-primary">Create New Teacher</a>
      </div>
       <div *ngIf="successMessage" class="alert alert-success">{{ successMessage }}</div>
       <div *ngIf="error" class="alert alert-danger mt-3">
        Error: {{ error }}
      </div>
      <table class="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Name</th>
            <th>Email</th>
            <th>Specialty</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let teacher of teachers">
            <td>{{ teacher.id }}</td>
            <td>{{ teacher.username }}</td>
            <td>{{ teacher.first_name }} {{ teacher.last_name }}</td>
            <td>{{ teacher.email }}</td>
            <td>{{ teacher.specialty }}</td>
            <td>
              <a [routerLink]="['/admin/teachers/edit', teacher.id]" class="btn btn-sm btn-outline-secondary me-2">Edit</a>
              <button (click)="deleteTeacher(teacher.id!)" class="btn btn-sm btn-outline-danger">Delete</button>
            </td>
          </tr>
          <tr *ngIf="!teachers || teachers.length === 0">
            <td colspan="6" class="text-center">No teachers found.</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: []
})
export class TeacherListComponent implements OnInit {
  teachers: Teacher[] = [];
  error: string | null = null;
  successMessage: string | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadTeachers();
  }

  loadTeachers(): void {
    this.error = null;
    this.adminService.listTeachers().subscribe({
      next: (data) => {
        this.teachers = data;
      },
      error: (err) => {
        console.error('Error fetching teachers:', err);
        this.error = err.message || 'Could not load teachers.';
         if (err.status === 401 || err.status === 403) {
            this.error = "You are not authorized to view this page.";
        }
      }
    });
  }

  deleteTeacher(teacherId: number): void {
    if (confirm('Are you sure you want to delete this teacher?')) {
      this.adminService.deleteTeacher(teacherId).subscribe({
        next: () => {
          this.successMessage = 'Teacher deleted successfully.';
          this.error = null;
          this.teachers = this.teachers.filter(t => t.id !== teacherId);
          setTimeout(() => this.successMessage = null, 3000);
        },
        error: (err) => {
          console.error('Error deleting teacher:', err);
          this.error = err.error?.detail || err.message || 'Could not delete teacher.';
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
