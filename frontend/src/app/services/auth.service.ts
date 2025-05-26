import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api/';

  async login(username: string, password: string) {
    try {
      const response = await axios.post(`${this.apiUrl}token-auth/`, { username, password });
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async register(userData: any) {
    try {
        const response = await axios.post(`${this.apiUrl}register/`, userData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}
}