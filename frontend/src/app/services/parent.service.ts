import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service'; // To get current parent's ID for context if needed by backend

// Re-using or re-defining interfaces. Ideally, share them.
export interface Student { // Simplified for parent's view of their children
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email?: string;
  // Add other fields if returned by /api/parent/my-children/
}

export interface GradeRecord {
  id?: number;
  student: number; // Student ID
  subject: number; // Subject ID
  exam_type: string;
  grade: number;
  date?: string;
  subject_details?: { id: number; name: string; code: string; };
  student_details?: { id: number; first_name: string; last_name: string; }; // For clarity if backend sends this
}

export interface AttendanceRecord {
  id?: number;
  student: number;
  subject: number;
  date: string;
  status: 'P' | 'A' | 'J';
  notes?: string;
  subject_details?: { id: number; name: string; code: string; };
  student_details?: { id: number; first_name: string; last_name: string; }; // For clarity
}


@Injectable({
  providedIn: 'root'
})
export class ParentService {

  constructor(private apiService: ApiService, private authService: AuthService) { }

  getMyChildren(): Observable<Student[]> {
    // This endpoint needs to be created on the backend.
    // It should return a list of CustomUser objects (students) linked to the authenticated parent.
    return this.apiService.get('parent/my-children/');
  }

  getChildGradeRecords(): Observable<GradeRecord[]> {
    // Backend's ChildGradesView at /api/parent/grades/ filters for all children of the authenticated parent.
    return this.apiService.get('parent/grades/');
  }

  getChildAttendanceRecords(): Observable<AttendanceRecord[]> {
    // Backend's ChildAttendanceView at /api/parent/attendance/ filters for all children.
    return this.apiService.get('parent/attendance/');
  }
}
