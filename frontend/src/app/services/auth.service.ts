import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

interface AuthResponse {
  token: string;
  user_id: number; // Assuming user_id is returned as number
  role: string;
  message?: string; // For registration response
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Adjust apiUrl if your proxy.conf.json handles /api directly
  private apiUrl = '/api'; // Uses proxy to connect to http://localhost:8000/api

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login/`, { username, password })
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user_id', response.user_id.toString());
          localStorage.setItem('user_role', response.role);
        })
      );
  }

  register(userData: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register/`, userData);
    // No token storage here, user should login after registration typically
    // Or backend could return a token on registration too, then store it.
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_role');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserId(): string | null {
    return localStorage.getItem('user_id');
  }

  getUserRole(): string | null {
    return localStorage.getItem('user_role');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
    // Optionally, add token expiration check here if tokens expire
  }
}