import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service'; // May not be strictly needed if backend filters by authenticated user

// Assuming GradeRecord and AttendanceRecord interfaces are defined elsewhere (e.g., teacher.service.ts or a shared types file)
// For now, let's duplicate or import them if they were in teacher.service.ts
// Ideally, these would be in a `types.ts` or similar shared location.

export interface GradeRecord {
  id?: number;
  student: number; // Student ID
  subject: number; // Subject ID
  exam_type: string;
  grade: number;
  date?: string;
  // For display, backend often sends populated subject details
  subject_details?: { id: number; name: string; code: string; };
}

export interface AttendanceRecord {
  id?: number;
  student: number;
  subject: number;
  date: string;
  status: 'P' | 'A' | 'J';
  notes?: string;
  subject_details?: { id: number; name: string; code: string; };
}


@Injectable({
  providedIn: 'root'
})
export class StudentService {

  constructor(private apiService: ApiService, private authService: AuthService) { }

  getMyGradeRecords(): Observable<GradeRecord[]> {
    // Backend's GradeRecordViewSet.get_queryset filters for the current student if role is STUDENT
    return this.apiService.get('grades-records/');
  }

  getMyAttendanceRecords(): Observable<AttendanceRecord[]> {
    // Backend's AttendanceViewSet.get_queryset filters for the current student if role is STUDENT
    return this.apiService.get('attendances/');
  }
}
