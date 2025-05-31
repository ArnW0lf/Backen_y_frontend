import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TeacherService, Subject, Student, AttendanceRecord } from '../../../services/teacher.service'; // Adjust path

interface StudentAttendance extends Student {
  status: 'P' | 'A' | 'J'; // Default status for the form
  existingRecordId?: number; // To track if it's an update or new
}

@Component({
  selector: 'app-manage-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  template: `
    <div class="container mt-4">
      <h2>Manage Attendance</h2>

      <!-- Step 1 & 2: Subject and Date Selection -->
      <div class="row g-3 align-items-end mb-3">
        <div class="col-md-6">
          <label for="subjectSelect" class="form-label">Select Subject:</label>
          <select id="subjectSelect" class="form-select" [(ngModel)]="selectedSubjectId" (ngModelChange)="loadStudentsAndAttendance()">
            <option [value]="null" disabled>-- Select a Subject --</option>
            <option *ngFor="let subject of assignedSubjects" [value]="subject.id">
              {{ subject.name }} ({{ subject.code }})
            </option>
          </select>
        </div>
        <div class="col-md-4">
          <label for="dateSelect" class="form-label">Select Date:</label>
          <input type="date" id="dateSelect" class="form-control" [(ngModel)]="selectedDate" (ngModelChange)="loadStudentsAndAttendance()">
        </div>
      </div>
      <div *ngIf="subjectsError" class="alert alert-danger">{{ subjectsError }}</div>

      <!-- Step 3 & 4: Student Listing & Attendance Marking/Save -->
      <div *ngIf="selectedSubjectId && selectedDate && !studentsError && !isLoadingSubjects">
        <h4 class="mt-4">Students in {{ getSelectedSubjectName() }} for {{ selectedDate | date:'longDate' }}</h4>
        <div *ngIf="isLoadingStudentsOrAttendance" class="alert alert-info">Loading data...</div>

        <div *ngIf="!isLoadingStudentsOrAttendance && studentsForAttendance.length > 0">
          <table class="table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let student of studentsForAttendance; let i = index">
                <td>{{ student.first_name }} {{ student.last_name }} ({{student.username}})</td>
                <td>
                  <select class="form-select" [(ngModel)]="student.status" name="status-{{student.id}}">
                    <option value="P">Presente</option>
                    <option value="A">Ausente</option>
                    <option value="J">Justificado</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
          <button (click)="saveAllAttendance()" class="btn btn-primary mt-3" [disabled]="isLoadingStudentsOrAttendance">
            Save All Attendance
          </button>
          <div *ngIf="attendanceSaveSuccess" class="alert alert-success mt-2">Attendance saved successfully!</div>
          <div *ngIf="attendanceSaveError" class="alert alert-danger mt-2">{{ attendanceSaveError }}</div>
        </div>

        <div *ngIf="!isLoadingStudentsOrAttendance && studentsForAttendance.length === 0 && !studentsError" class="alert alert-warning mt-3">
          No students found for this subject. Please check enrollments or ensure the backend endpoint for students per subject is working.
        </div>
      </div>
      <div *ngIf="studentsError && !isLoadingSubjects" class="alert alert-danger mt-3">{{ studentsError }}</div>
    </div>
  `,
  styles: []
})
export class ManageAttendanceComponent implements OnInit {
  assignedSubjects: Subject[] = [];
  selectedSubjectId: number | null = null;
  selectedDate: string = new Date().toISOString().split('T')[0]; // Default to today

  studentsForAttendance: StudentAttendance[] = [];

  isLoadingSubjects = false;
  isLoadingStudentsOrAttendance = false;

  subjectsError: string | null = null;
  studentsError: string | null = null;
  attendanceSaveError: string | null = null;
  attendanceSaveSuccess = false;

  constructor(private teacherService: TeacherService) {}

  ngOnInit(): void {
    this.isLoadingSubjects = true;
    this.teacherService.getAssignedSubjects().subscribe({
      next: (subjects) => {
        this.assignedSubjects = subjects;
        this.isLoadingSubjects = false;
      },
      error: (err) => {
        console.error('Error fetching assigned subjects:', err);
        this.subjectsError = 'Could not load assigned subjects. ' + (err.message || '');
        this.isLoadingSubjects = false;
      }
    });
  }

  loadStudentsAndAttendance(): void {
    if (!this.selectedSubjectId || !this.selectedDate) {
      this.studentsForAttendance = [];
      return;
    }
    this.isLoadingStudentsOrAttendance = true;
    this.studentsError = null;
    this.attendanceSaveError = null;
    this.attendanceSaveSuccess = false;

    this.teacherService.getStudentsForSubject(this.selectedSubjectId).subscribe({
      next: (students) => {
        if (students.length === 0) {
          this.studentsForAttendance = [];
          this.isLoadingStudentsOrAttendance = false;
          // this.studentsError = 'No students enrolled in this subject.'; // Keep or remove based on preference
          return;
        }
        this.teacherService.getAttendanceRecords(this.selectedSubjectId!, this.selectedDate).subscribe({
          next: (attendanceRecords) => {
            this.studentsForAttendance = students.map(student => {
              const existingRecord = attendanceRecords.find(ar => ar.student === student.id);
              return {
                ...student,
                status: existingRecord ? existingRecord.status : 'P', // Default to Present
                existingRecordId: existingRecord ? existingRecord.id : undefined
              };
            });
            this.isLoadingStudentsOrAttendance = false;
          },
          error: (err) => {
            console.error('Error fetching attendance records:', err);
            this.studentsError = 'Could not load existing attendance records.';
            this.isLoadingStudentsOrAttendance = false;
          }
        });
      },
      error: (err) => {
        console.error('Error fetching students for subject:', err);
        this.studentsError = `Could not load students. Ensure backend endpoint is working. Error: ${err.status === 404 ? 'Endpoint not found or no students.' : (err.message || '')}`;
        this.isLoadingStudentsOrAttendance = false;
        this.studentsForAttendance = [];
      }
    });
  }

  getSelectedSubjectName(): string {
    return this.assignedSubjects.find(s => s.id === this.selectedSubjectId)?.name || '';
  }

  saveAllAttendance(): void {
    if (!this.selectedSubjectId || !this.selectedDate || this.studentsForAttendance.length === 0) {
      this.attendanceSaveError = "Please select a subject, date, and ensure there are students to mark.";
      return;
    }
    this.isLoadingStudentsOrAttendance = true; // Use this to disable button
    this.attendanceSaveError = null;
    this.attendanceSaveSuccess = false;

    const payload: Partial<AttendanceRecord>[] = this.studentsForAttendance.map(studentAtt => ({
      id: studentAtt.existingRecordId, // Include ID if it's an update (backend bulk might handle upsert)
      student: studentAtt.id,
      subject: this.selectedSubjectId!,
      date: this.selectedDate,
      status: studentAtt.status
    }));

    // The backend's bulk_create for Attendance is expected to handle
    // creating new records or updating existing ones based on (student, subject, date) uniqueness.
    // If it only creates, then frontend might need to pre-filter new vs existing.
    // For now, sending all, assuming backend handles it (e.g., via unique_together on model and custom bulk_create logic).
    this.teacherService.bulkCreateAttendance(payload).subscribe({
      next: () => {
        this.attendanceSaveSuccess = true;
        this.isLoadingStudentsOrAttendance = false;
        // Refresh data to show any new IDs or confirm changes
        this.loadStudentsAndAttendance();
        setTimeout(() => this.attendanceSaveSuccess = false, 3000);
      },
      error: (err) => {
        console.error('Error saving attendance:', err);
        this.attendanceSaveError = err.error?.detail || (Array.isArray(err.error) ? err.error.map(e => e.detail || e.non_field_errors?.join(', ')).join('; ') : err.message) || 'Could not save attendance.';
        this.isLoadingStudentsOrAttendance = false;
      }
    });
  }
}
