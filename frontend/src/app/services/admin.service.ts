import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface Student {
  id?: number;
  username: string;
  password?: string; // Password might not always be returned or required for update
  email: string;
  first_name: string;
  last_name: string;
  dni: string;
  birth_date: string; // Assuming YYYY-MM-DD
  role?: string; // Should be 'STUDENT' when creating
}

export interface Teacher {
  id?: number;
  username: string;
  password?: string;
  email: string;
  first_name: string;
  last_name: string;
  specialty?: string;
  role?: string; // Should be 'TEACHER' when creating
  subject_ids?: number[]; // For updating teacher's subjects
}

export interface Grade {
  id: number;
  name: string;
  section: string;
}

export interface Subject {
  id?: number;
  name: string;
  code: string;
  grades: number[]; // Array of Grade IDs for create/update
  // For display, backend might send populated Grade objects or just IDs.
  // Let's assume for writing we send IDs, and for reading we might get more details.
  // If grades are returned as objects: grades_details?: Grade[];
}

export interface TeacherSubjectAssignment {
  id: number;
  teacher: number; // Teacher ID
  subject: number; // Subject ID
  // Potentially include teacher_details and subject_details if backend sends them
}


@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private apiService: ApiService) { }

  // Student Management
  listStudents(params?: any): Observable<Student[]> {
    return this.apiService.get('users/list_students/', params);
  }

  createStudent(studentData: Student): Observable<Student> {
    // Ensure role is set for creation
    const dataToCreate = { ...studentData, role: 'STUDENT' };
    // Backend expects /api/register/ for user creation including students
    return this.apiService.post('register/', dataToCreate);
  }

  getStudent(studentId: number): Observable<Student> {
    return this.apiService.get(`users/${studentId}/`);
  }

  updateStudent(studentId: number, studentData: Partial<Student>): Observable<Student> {
    // If role is part of studentData, ensure it's handled correctly by backend or stripped if needed
    return this.apiService.put(`users/${studentId}/`, studentData);
  }

  deleteStudent(studentId: number): Observable<any> {
    return this.apiService.delete(`users/${studentId}/`);
  }

  // Teacher Management
  listTeachers(params?: any): Observable<Teacher[]> {
    return this.apiService.get('users/list_teachers/', params);
  }

  createTeacher(teacherData: Teacher): Observable<Teacher> {
    const dataToCreate = { ...teacherData, role: 'TEACHER' };
    return this.apiService.post('register/', dataToCreate);
  }

  getTeacher(teacherId: number): Observable<Teacher> {
    return this.apiService.get(`users/${teacherId}/`);
  }

  updateTeacher(teacherId: number, teacherData: Partial<Teacher>): Observable<Teacher> {
    return this.apiService.put(`users/${teacherId}/`, teacherData);
  }

  deleteTeacher(teacherId: number): Observable<any> {
    return this.apiService.delete(`users/${teacherId}/`);
  }

  // Grade Management (primarily for listing when assigning to subjects)
  listGrades(): Observable<Grade[]> {
    return this.apiService.get('grades/');
  }

  // Subject Management
  listSubjects(): Observable<Subject[]> {
    return this.apiService.get('subjects/');
  }

  createSubject(subjectData: Partial<Subject>): Observable<Subject> {
    return this.apiService.post('subjects/', subjectData);
  }

  getSubject(subjectId: number): Observable<Subject> {
    // Assuming the backend returns grades as an array of IDs or populates them.
    // If grades are returned as objects, the Subject interface might need adjustment for display.
    return this.apiService.get(`subjects/${subjectId}/`);
  }

  updateSubject(subjectId: number, subjectData: Partial<Subject>): Observable<Subject> {
    return this.apiService.put(`subjects/${subjectId}/`, subjectData);
  }

  deleteSubject(subjectId: number): Observable<any> {
    return this.apiService.delete(`subjects/${subjectId}/`);
  }

  // Teacher-Subject Assignments
  listTeacherAssignmentsForTeacher(teacherId: number): Observable<TeacherSubjectAssignment[]> {
    return this.apiService.get(`teacher-subjects/?teacher_id=${teacherId}`);
  }

  listTeacherAssignmentsForSubject(subjectId: number): Observable<TeacherSubjectAssignment[]> {
    return this.apiService.get(`teacher-subjects/?subject_id=${subjectId}`);
  }

  assignSubjectToTeacher(teacherId: number, subjectId: number): Observable<TeacherSubjectAssignment> {
    return this.apiService.post('teacher-subjects/', { teacher_id: teacherId, subject_id: subjectId });
  }

  removeSubjectFromTeacher(assignmentId: number): Observable<any> {
    return this.apiService.delete(`teacher-subjects/${assignmentId}/`);
  }

}
