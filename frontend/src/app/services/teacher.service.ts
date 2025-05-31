import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service'; // To get current teacher's ID

// Interfaces (can be moved to a shared types file later)
export interface Subject {
  id: number;
  name: string;
  code: string;
  // grades: number[]; // Array of Grade IDs
}

export interface Student {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email?: string; // Optional based on what's needed
}

export interface GradeRecord {
  id?: number;
  student: number; // Student ID
  subject: number; // Subject ID
  exam_type: string;
  grade: number;
  date?: string; // Date is usually set by backend
  // For display, we might want student/subject details
  student_details?: Student;
  subject_details?: Subject;
}

// For TeacherSubject assignments from backend
interface TeacherSubjectAssignment {
  id: number;
  teacher: number;
  subject: Subject; // Assuming backend populates subject details here
}

export interface AttendanceRecord {
  id?: number;
  student: number; // student ID
  subject: number; // subject ID
  date: string; // YYYY-MM-DD
  status: 'P' | 'A' | 'J'; // Presente, Ausente, Justificado
  notes?: string;
}


@Injectable({
  providedIn: 'root'
})
export class TeacherService {

  constructor(private apiService: ApiService, private authService: AuthService) { }

  getAssignedSubjects(): Observable<Subject[]> {
    const userId = this.authService.getUserId();
    if (!userId) {
      return new Observable(observer => observer.error('User ID not found for teacher.'));
    }
    // This endpoint returns TeacherSubjectAssignment objects. We need to extract Subject from them.
    // The backend SubjectSerializer in TeacherSubjectSerializer should provide enough Subject details.
    return this.apiService.get(`teacher-subjects/?teacher_id=${userId}`).pipe(
      map((assignments: TeacherSubjectAssignment[]) => assignments.map(assignment => assignment.subject))
    );
  }

  // IMPORTANT: This endpoint /api/subjects/{subjectId}/enrolled_students/ is assumed to exist.
  // If not, this method will fail or needs an alternative implementation.
  getStudentsForSubject(subjectId: number): Observable<Student[]> {
    // This is a hypothetical endpoint. The actual implementation depends on the backend.
    // A common DRF pattern would be an action on SubjectViewSet.
    // If not available, this part will be a blocker.
    return this.apiService.get(`subjects/${subjectId}/enrolled_students/`);
  }

  getGradeRecords(subjectId: number, studentId: number): Observable<GradeRecord[]> {
    return this.apiService.get(`grades-records/`, { subject_id: subjectId, student_id: studentId });
  }

  createGradeRecord(gradeData: { student: number; subject: number; exam_type: string; grade: number }): Observable<GradeRecord> {
    // The backend should handle setting the teacher if necessary, possibly based on the subject
    // or by ensuring the authenticated user (teacher) has rights to create for this subject.
    // The GradeRecord model itself doesn't link directly to a teacher.
    return this.apiService.post('grades-records/', gradeData);
  }

  updateGradeRecord(recordId: number, gradeData: Partial<GradeRecord>): Observable<GradeRecord> {
    return this.apiService.put(`grades-records/${recordId}/`, gradeData);
  }

  deleteGradeRecord(recordId: number): Observable<any> {
    return this.apiService.delete(`grades-records/${recordId}/`);
  }

  // Attendance Management
  getAttendanceRecords(subjectId: number, date: string): Observable<AttendanceRecord[]> {
    return this.apiService.get(`attendances/`, { subject_id: subjectId, date: date });
  }

  bulkCreateAttendance(attendanceData: Partial<AttendanceRecord>[]): Observable<any> {
    // Ensure subject_id is part of each record in attendanceData if not already
    // The backend AttendanceViewSet.bulk_create expects a list of full attendance objects.
    return this.apiService.post('attendances/bulk_create/', attendanceData);
  }
}
