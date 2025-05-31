import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminService, Teacher } from '../../../services/admin.service'; // Adjust path as needed

@Component({
  selector: 'app-teacher-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
import { forkJoin, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-teacher-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container mt-4">
      <h2>Edit Teacher</h2>
      <div *ngIf="isLoading" class="alert alert-info">Loading data...</div>
      <div *ngIf="errorMessage && !isLoading" class="alert alert-danger">
        {{ errorMessage }}
      </div>
      <div *ngIf="successMessage && !isLoading" class="alert alert-success">
        {{ successMessage }}
      </div>

      <form *ngIf="teacher && !isLoading" #teacherForm="ngForm" (ngSubmit)="onSubmit(teacherForm)">
        <div class="mb-3">
          <label for="username" class="form-label">Username</label>
          <input type="text" class="form-control" id="username" name="username" [(ngModel)]="teacher.username" required>
        </div>

        <div class="mb-3">
          <label for="email" class="form-label">Email</label>
          <input type="email" class="form-control" id="email" name="email" [(ngModel)]="teacher.email" required>
          <!-- Consider making email readonly if it's a sensitive/identifier field post-creation -->
        </div>
        <div class="mb-3">
          <label for="first_name" class="form-label">First Name</label>
          <input type="text" class="form-control" id="first_name" name="first_name" [(ngModel)]="teacher.first_name" required>
        </div>
        <div class="mb-3">
          <label for="last_name" class="form-label">Last Name</label>
          <input type="text" class="form-control" id="last_name" name="last_name" [(ngModel)]="teacher.last_name" required>
        </div>
        <div class="mb-3">
          <label for="specialty" class="form-label">Specialty</label>
          <input type="text" class="form-control" id="specialty" name="specialty" [(ngModel)]="teacher.specialty">
        </div>

        <div class="mb-3">
            <label for="assigned_subjects" class="form-label">Assigned Subjects</label>
            <select multiple class="form-select" id="assigned_subjects" name="assigned_subjects" [(ngModel)]="assignedSubjectIds">
                <option *ngFor="let subject of availableSubjects" [value]="subject.id">
                {{ subject.name }} ({{subject.code}})
                </option>
            </select>
            <small class="form-text text-muted">Hold Ctrl/Cmd to select multiple subjects.</small>
        </div>

        <div class="mb-3">
          <label for="password" class="form-label">New Password (Optional)</label>
          <input type="password" class="form-control" id="password" name="password" ngModel>
          <small class="form-text text-muted">Leave blank to keep the current password.</small>
        </div>

        <button type="submit" class="btn btn-primary me-2" [disabled]="teacherForm.invalid">Update Teacher</button>
        <a routerLink="/admin/teachers" class="btn btn-secondary">Cancel</a>
      </form>
    </div>
  `,
  styles: []
})
export class TeacherEditComponent implements OnInit {
  teacher: Teacher | null = null;
  teacherId: string | null = null;
  isLoading = true;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  availableSubjects: Subject[] = [];
  assignedSubjectIds: number[] = [];
  initialAssignedSubjectIds: number[] = []; // To track original assignments

  constructor(
    private adminService: AdminService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.teacherId = this.route.snapshot.paramMap.get('id');
    if (this.teacherId) {
      this.loadInitialData(this.teacherId);
    } else {
      this.errorMessage = 'Teacher ID not found in route.';
      this.isLoading = false;
    }
  }

  loadInitialData(teacherIdStr: string): void {
    this.isLoading = true;
    const teacherId = +teacherIdStr;

    forkJoin({
      teacher: this.adminService.getTeacher(teacherId),
      allSubjects: this.adminService.listSubjects(),
      currentAssignments: this.adminService.listTeacherAssignmentsForTeacher(teacherId)
    }).subscribe({
      next: ({ teacher, allSubjects, currentAssignments }) => {
        this.teacher = teacher;
        if (this.teacher) this.teacher.password = ''; // Don't prefill password

        this.availableSubjects = allSubjects;
        this.assignedSubjectIds = currentAssignments.map(assignment => assignment.subject);
        this.initialAssignedSubjectIds = [...this.assignedSubjectIds]; // Store initial state

        this.isLoading = false;
        this.errorMessage = null;
      },
      error: (err) => {
        console.error('Error fetching initial data for teacher edit:', err);
        this.errorMessage = 'Could not load data for editing teacher. ' + (err.message || '');
        this.isLoading = false;
      }
    });
  }

  onSubmit(form: NgForm): void {
    if (!this.teacher || !this.teacherId || form.invalid) {
      this.errorMessage = 'Form is invalid or teacher data is missing.';
      return;
    }
    this.errorMessage = null;
    this.successMessage = null;
    this.isLoading = true;


    const teacherProfileData: Partial<Teacher> = {
      username: form.value.username,
      email: form.value.email,
      first_name: form.value.first_name,
      last_name: form.value.last_name,
      specialty: form.value.specialty,
    };
    if (form.value.password) { // Only include password if provided
      teacherProfileData.password = form.value.password;
    }

    // First, update teacher profile
    this.adminService.updateTeacher(+this.teacherId, teacherProfileData).pipe(
      switchMap(() => {
        // After profile update, manage subject assignments
        const currentSelectedIds = new Set(this.assignedSubjectIds.map(id => +id));
        const initialIds = new Set(this.initialAssignedSubjectIds.map(id => +id));

        const assignmentsToAdd = this.assignedSubjectIds.filter(id => !initialIds.has(+id));
        const assignmentsToRemove = this.initialAssignedSubjectIds.filter(id => !currentSelectedIds.has(+id));

        const addOperations: Observable<any>[] = assignmentsToAdd.map(subjectId =>
          this.adminService.assignSubjectToTeacher(+this.teacherId!, +subjectId)
        );

        // For removal, we need assignment IDs. Fetch them first.
        // This part assumes listTeacherAssignmentsForTeacher returns objects with `id` (assignmentId) and `subject` (subjectId)
        return this.adminService.listTeacherAssignmentsForTeacher(+this.teacherId!).pipe(
          switchMap(currentFullAssignments => {
            const removeOperations: Observable<any>[] = [];
            assignmentsToRemove.forEach(subjectIdToRemove => {
              const assignment = currentFullAssignments.find(a => a.subject === subjectIdToRemove);
              if (assignment) {
                removeOperations.push(this.adminService.removeSubjectFromTeacher(assignment.id));
              }
            });
            return forkJoin([...addOperations, ...removeOperations].length > 0 ? [...addOperations, ...removeOperations] : [of(null)]);
          })
        );
      })
    ).subscribe({
      next: () => {
        this.successMessage = 'Teacher updated successfully, including subject assignments!';
        this.isLoading = false;
        this.loadInitialData(this.teacherId!); // Refresh data to show current state
        setTimeout(() => this.router.navigate(['/admin/teachers']), 2500);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error updating teacher:', err);
        if (err.error) {
          let errors = [];
          for (const key in err.error) {
            if (err.error.hasOwnProperty(key)) {
              errors.push(`${key}: ${err.error[key].join ? err.error[key].join(', ') : err.error[key]}`);
            }
          }
          this.errorMessage = `Error updating teacher: ${errors.join('; ')}`;
        } else {
          this.errorMessage = `Error updating teacher: ${err.message || 'An unknown error occurred.'}`;
        }
      }
    });
  }
}
