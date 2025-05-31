import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { StudentService, GradeRecord, AttendanceRecord } from '../../../services/student.service'; // Adjust path

interface GroupedInfo<T> {
  [subjectName: string]: T[];
}

@Component({
  selector: 'app-view-my-info',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="container mt-4">
      <h2>My Academic Information</h2>

      <div *ngIf="isLoading" class="alert alert-info">Loading information...</div>
      <div *ngIf="errorMessage && !isLoading" class="alert alert-danger">
        {{ errorMessage }}
      </div>

      <div *ngIf="!isLoading && !errorMessage">
        <!-- Grades Section -->
        <h3 class="mt-4">My Grades</h3>
        <div *ngIf="groupedGrades && objectKeys(groupedGrades).length > 0; else noGrades">
          <div *ngFor="let subjectName of objectKeys(groupedGrades)" class="mb-3">
            <h4>{{ subjectName }}</h4>
            <table class="table table-sm table-striped">
              <thead>
                <tr>
                  <th>Exam Type</th>
                  <th>Grade</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let record of groupedGrades[subjectName]">
                  <td>{{ record.exam_type }}</td>
                  <td>{{ record.grade }}</td>
                  <td>{{ record.date | date:'shortDate' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <ng-template #noGrades>
          <p>No grade records found.</p>
        </ng-template>

        <!-- Attendance Section -->
        <h3 class="mt-5">My Attendance</h3>
        <div *ngIf="groupedAttendance && objectKeys(groupedAttendance).length > 0; else noAttendance">
           <div *ngFor="let subjectName of objectKeys(groupedAttendance)" class="mb-3">
            <h4>{{ subjectName }}</h4>
            <table class="table table-sm table-striped">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let record of groupedAttendance[subjectName]">
                  <td>{{ record.date | date:'shortDate' }}</td>
                  <td>{{ getStatusDisplay(record.status) }}</td>
                  <td>{{ record.notes || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <ng-template #noAttendance>
          <p>No attendance records found.</p>
        </ng-template>
      </div>
    </div>
  `,
  styles: []
})
export class ViewMyInfoComponent implements OnInit {
  gradeRecords: GradeRecord[] = [];
  attendanceRecords: AttendanceRecord[] = [];

  groupedGrades: GroupedInfo<GradeRecord> = {};
  groupedAttendance: GroupedInfo<AttendanceRecord> = {};

  isLoading = true;
  errorMessage: string | null = null;

  // Helper to use Object.keys in the template
  objectKeys = Object.keys;


  constructor(private studentService: StudentService) {}

  ngOnInit(): void {
    this.loadInformation();
  }

  loadInformation(): void {
    this.isLoading = true;
    this.errorMessage = null;
    // Using a forkJoin might be better if there were more independent calls
    this.studentService.getMyGradeRecords().subscribe({
      next: (grades) => {
        this.gradeRecords = grades;
        this.groupedGrades = this.groupGradesBySubject(grades);
        // Chain the next call or use forkJoin
        this.studentService.getMyAttendanceRecords().subscribe({
          next: (attendance) => {
            this.attendanceRecords = attendance;
            this.groupedAttendance = this.groupAttendanceBySubject(attendance);
            this.isLoading = false;
          },
          error: (err) => this.handleError(err, 'attendance')
        });
      },
      error: (err) => this.handleError(err, 'grades')
    });
  }

  private groupGradesBySubject(records: GradeRecord[]): GroupedInfo<GradeRecord> {
    return records.reduce((acc, record) => {
      const subjectName = record.subject_details?.name || `Subject ID: ${record.subject}`;
      if (!acc[subjectName]) {
        acc[subjectName] = [];
      }
      acc[subjectName].push(record);
      return acc;
    }, {} as GroupedInfo<GradeRecord>);
  }

  private groupAttendanceBySubject(records: AttendanceRecord[]): GroupedInfo<AttendanceRecord> {
     return records.reduce((acc, record) => {
      const subjectName = record.subject_details?.name || `Subject ID: ${record.subject}`;
      if (!acc[subjectName]) {
        acc[subjectName] = [];
      }
      acc[subjectName].push(record);
      return acc;
    }, {} as GroupedInfo<AttendanceRecord>);
  }

  getStatusDisplay(status: 'P' | 'A' | 'J'): string {
    switch (status) {
      case 'P': return 'Presente';
      case 'A': return 'Ausente';
      case 'J': return 'Justificado';
      default: return status;
    }
  }

  private handleError(err: any, type: 'grades' | 'attendance'): void {
    console.error(`Error fetching my ${type}:`, err);
    this.errorMessage = `Could not load my ${type}. ` + (err.message || '');
    this.isLoading = false;
  }
}
