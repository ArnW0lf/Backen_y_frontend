import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ParentService, Student, GradeRecord, AttendanceRecord } from '../../../services/parent.service'; // Adjust path

interface GroupedInfo<T> {
  [subjectName: string]: T[];
}

interface ChildInformation {
  student: Student;
  grades: GradeRecord[];
  attendance: AttendanceRecord[];
  groupedGrades?: GroupedInfo<GradeRecord>; // Optional: for per-subject grouping
  groupedAttendance?: GroupedInfo<AttendanceRecord>; // Optional
}

@Component({
  selector: 'app-view-childrens-info',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="container mt-4">
      <h2>My Children's Academic Information</h2>

      <div *ngIf="isLoading" class="alert alert-info">Loading information...</div>
      <div *ngIf="errorMessage && !isLoading" class="alert alert-danger">
        {{ errorMessage }}
      </div>

      <div *ngIf="!isLoading && !errorMessage">
        <div *ngIf="childrenInfo.length > 0; else noChildren">
          <div *ngFor="let childData of childrenInfo" class="mb-5 card">
            <div class="card-header bg-light">
                <h4>{{ childData.student.first_name }} {{ childData.student.last_name }} ({{childData.student.username}})</h4>
            </div>
            <div class="card-body">
                <!-- Grades Section -->
                <h5 class="mt-3">Grades</h5>
                <div *ngIf="childData.groupedGrades && objectKeys(childData.groupedGrades).length > 0; else noGrades">
                  <div *ngFor="let subjectName of objectKeys(childData.groupedGrades)" class="mb-3">
                    <h6>{{ subjectName }}</h6>
                    <table class="table table-sm table-striped">
                      <thead>
                        <tr>
                          <th>Exam Type</th>
                          <th>Grade</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr *ngFor="let record of childData.groupedGrades[subjectName]">
                          <td>{{ record.exam_type }}</td>
                          <td>{{ record.grade }}</td>
                          <td>{{ record.date | date:'shortDate' }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <ng-template #noGrades>
                  <p>No grade records found for {{childData.student.first_name}}.</p>
                </ng-template>

                <!-- Attendance Section -->
                <h5 class="mt-4">Attendance</h5>
                <div *ngIf="childData.groupedAttendance && objectKeys(childData.groupedAttendance).length > 0; else noAttendance">
                  <div *ngFor="let subjectName of objectKeys(childData.groupedAttendance)" class="mb-3">
                    <h6>{{ subjectName }}</h6>
                    <table class="table table-sm table-striped">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Status</th>
                          <th>Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr *ngFor="let record of childData.groupedAttendance[subjectName]">
                          <td>{{ record.date | date:'shortDate' }}</td>
                          <td>{{ getStatusDisplay(record.status) }}</td>
                          <td>{{ record.notes || '-' }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <ng-template #noAttendance>
                  <p>No attendance records found for {{childData.student.first_name}}.</p>
                </ng-template>
            </div>
          </div>
        </div>
        <ng-template #noChildren>
          <p>No children found or no information available. Please ensure your children are correctly linked to your account.</p>
        </ng-template>
      </div>
    </div>
  `,
  styles: []
})
export class ViewChildrensInfoComponent implements OnInit {
  children: Student[] = [];
  childrenInfo: ChildInformation[] = [];

  isLoading = true;
  errorMessage: string | null = null;
  objectKeys = Object.keys; // Helper for template

  constructor(private parentService: ParentService) {}

  ngOnInit(): void {
    this.loadAllChildrenInformation();
  }

  loadAllChildrenInformation(): void {
    this.isLoading = true;
    this.errorMessage = null;

    // Backend endpoints /parent/grades/ and /parent/attendance/ return all records for all children.
    // We first get the list of children, then the records, then map them.
    this.parentService.getMyChildren().subscribe({
      next: (children) => {
        this.children = children;
        if (this.children.length === 0) {
          this.isLoading = false;
          // this.errorMessage = "No children linked to this account."; // Or just show "No children found" template
          return;
        }

        this.parentService.getChildGradeRecords().subscribe({
          next: (allGrades) => {
            this.parentService.getChildAttendanceRecords().subscribe({
              next: (allAttendance) => {
                this.childrenInfo = this.children.map(child => {
                  const childGrades = allGrades.filter(gr => gr.student === child.id);
                  const childAttendance = allAttendance.filter(ar => ar.student === child.id);
                  return {
                    student: child,
                    grades: childGrades,
                    attendance: childAttendance,
                    groupedGrades: this.groupGradesBySubject(childGrades),
                    groupedAttendance: this.groupAttendanceBySubject(childAttendance)
                  };
                });
                this.isLoading = false;
              },
              error: (err) => this.handleError(err, 'children\'s attendance')
            });
          },
          error: (err) => this.handleError(err, 'children\'s grades')
        });
      },
      error: (err) => {
        // Check if it's a 404 for my-children, meaning the endpoint might not exist
        if (err.status === 404) {
             this.errorMessage = 'Could not load children list. The endpoint /api/parent/my-children/ might not be implemented on the backend.';
        } else {
            this.handleError(err, 'children list');
        }
        this.isLoading = false;
      }
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

  private handleError(err: any, type: string): void {
    console.error(`Error fetching ${type}:`, err);
    this.errorMessage = `Could not load ${type}. ` + (err.message || '');
    this.isLoading = false;
  }
}
