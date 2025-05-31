import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TeacherService, Subject, Student, GradeRecord } from '../../../services/teacher.service'; // Adjust path

@Component({
  selector: 'app-manage-grades',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mt-4">
      <h2>Manage Grades</h2>

      <!-- Step 1: Subject Selection -->
      <div class="mb-3">
        <label for="subjectSelect" class="form-label">Select Subject:</label>
        <select id="subjectSelect" class="form-select" [(ngModel)]="selectedSubjectId" (ngModelChange)="onSubjectSelect()">
          <option [value]="null" disabled>-- Select a Subject --</option>
          <option *ngFor="let subject of assignedSubjects" [value]="subject.id">
            {{ subject.name }} ({{ subject.code }})
          </option>
        </select>
      </div>
      <div *ngIf="subjectsError" class="alert alert-danger">{{ subjectsError }}</div>

      <!-- Step 2: Student Listing & Grade Entry -->
      <div *ngIf="selectedSubjectId && !studentsError">
        <h4 class="mt-4">Students in {{ getSelectedSubjectName() }}</h4>
        <div *ngIf="isLoadingStudents" class="alert alert-info">Loading students...</div>

        <ul class="list-group" *ngIf="!isLoadingStudents && studentsOfSubject.length > 0">
          <li *ngFor="let student of studentsOfSubject" class="list-group-item">
            <h5>{{ student.first_name }} {{ student.last_name }} ({{student.username}})</h5>

            <!-- Grade Entry Form -->
            <form #gradeForm="ngForm" (ngSubmit)="onSaveGrade(gradeForm.value, student.id)">
              <input type="hidden" name="student" [ngModel]="student.id">
              <input type="hidden" name="subject" [ngModel]="selectedSubjectId">
              <div class="row gx-2 align-items-center">
                <div class="col-md-5">
                  <label for="exam_type-{{student.id}}" class="form-label visually-hidden">Exam Type</label>
                  <input type="text" class="form-control" id="exam_type-{{student.id}}" name="exam_type"
                         placeholder="Exam Type (e.g., Midterm)" ngModel required>
                </div>
                <div class="col-md-3">
                   <label for="grade-{{student.id}}" class="form-label visually-hidden">Grade</label>
                  <input type="number" class="form-control" id="grade-{{student.id}}" name="grade"
                         placeholder="Grade (0-100)" ngModel required min="0" max="100">
                </div>
                <div class="col-md-4">
                  <button type="submit" class="btn btn-success w-100" [disabled]="gradeForm.invalid">Save Grade</button>
                </div>
              </div>
            </form>
            <div *ngIf="gradeSaveSuccess?.[student.id]" class="alert alert-success mt-2 p-2">Grade saved!</div>
            <div *ngIf="gradeSaveError?.[student.id]" class="alert alert-danger mt-2 p-2">{{ gradeSaveError[student.id] }}</div>


            <!-- Display Existing Grades -->
            <div class="mt-3">
              <h6>Existing Grades:</h6>
              <div *ngIf="isLoadingGrades[student.id]" class="alert alert-info p-1">Loading grades...</div>
              <ul *ngIf="!isLoadingGrades[student.id] && studentGrades[student.id]?.length > 0" class="list-unstyled">
                <li *ngFor="let record of studentGrades[student.id]" class="border-bottom pb-1 mb-1">
                  {{record.exam_type}}: {{record.grade}}
                  <small>({{record.date | date:'shortDate'}})</small>
                  <!-- Add Edit/Delete for existing grades later if needed -->
                </li>
              </ul>
              <p *ngIf="!isLoadingGrades[student.id] && (!studentGrades[student.id] || studentGrades[student.id]?.length === 0)">
                No grades recorded yet for this student in this subject.
              </p>
            </div>
          </li>
        </ul>
        <div *ngIf="!isLoadingStudents && studentsOfSubject.length === 0" class="alert alert-warning">
          No students found for this subject. This might indicate an issue with student enrollment data or the backend endpoint for fetching students per subject.
        </div>
      </div>
      <div *ngIf="studentsError" class="alert alert-danger">{{ studentsError }}</div>

    </div>
  `
})
export class ManageGradesComponent implements OnInit {
  assignedSubjects: Subject[] = [];
  selectedSubjectId: number | null = null;
  studentsOfSubject: Student[] = [];
  studentGrades: { [studentId: number]: GradeRecord[] } = {};

  isLoadingSubjects = false;
  isLoadingStudents = false;
  isLoadingGrades: { [studentId: number]: boolean } = {};

  subjectsError: string | null = null;
  studentsError: string | null = null;
  gradeSaveError: { [studentId: number]: string | null } = {};
  gradeSaveSuccess: { [studentId: number]: boolean } = {};


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

  onSubjectSelect(): void {
    this.studentsOfSubject = [];
    this.studentGrades = {};
    this.studentsError = null;
    if (this.selectedSubjectId) {
      this.isLoadingStudents = true;
      // CRITICAL ASSUMPTION: getStudentsForSubject endpoint exists and works
      this.teacherService.getStudentsForSubject(this.selectedSubjectId).subscribe({
        next: (students) => {
          this.studentsOfSubject = students;
          this.isLoadingStudents = false;
          if (students.length > 0) {
            students.forEach(student => this.loadGradesForStudent(this.selectedSubjectId!, student.id));
          } else {
             this.studentsError = 'No students are enrolled in this subject, or the endpoint to fetch them is not implemented correctly.';
          }
        },
        error: (err) => {
          console.error('Error fetching students for subject:', err);
          this.studentsError = `Could not load students. Please ensure the backend endpoint for fetching students per subject is implemented. Error: ${err.status === 404 ? 'Endpoint not found or no students.' : (err.message || '')}`;
          this.isLoadingStudents = false;
        }
      });
    }
  }

  getSelectedSubjectName(): string {
    return this.assignedSubjects.find(s => s.id === this.selectedSubjectId)?.name || '';
  }

  loadGradesForStudent(subjectId: number, studentId: number): void {
    this.isLoadingGrades[studentId] = true;
    this.teacherService.getGradeRecords(subjectId, studentId).subscribe({
      next: (grades) => {
        this.studentGrades[studentId] = grades;
        this.isLoadingGrades[studentId] = false;
      },
      error: (err) => {
        console.error(`Error fetching grades for student ${studentId}:`, err);
        // Optionally display an error specific to this student's grades
        this.isLoadingGrades[studentId] = false;
      }
    });
  }

  onSaveGrade(formData: any, studentId: number): void {
    if (!this.selectedSubjectId) {
      this.gradeSaveError[studentId] = 'No subject selected.';
      return;
    }
    this.gradeSaveError[studentId] = null;
    this.gradeSaveSuccess[studentId] = false;

    const gradePayload = {
      student: studentId,
      subject: this.selectedSubjectId,
      exam_type: formData.exam_type,
      grade: formData.grade
    };

    this.teacherService.createGradeRecord(gradePayload).subscribe({
      next: (newRecord) => {
        this.gradeSaveSuccess[studentId] = true;
        // Add to existing grades list for immediate feedback
        if (!this.studentGrades[studentId]) {
          this.studentGrades[studentId] = [];
        }
        this.studentGrades[studentId].push(newRecord);
        // Reset form or clear success message after a delay
        setTimeout(() => this.gradeSaveSuccess[studentId] = false, 3000);
      },
      error: (err) => {
        console.error('Error saving grade:', err);
        this.gradeSaveError[studentId] = err.error?.detail || err.error?.grade?.[0] || err.message || 'Could not save grade.';
         setTimeout(() => this.gradeSaveError[studentId] = null, 5000);
      }
    });
  }
}
