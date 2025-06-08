import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserProfile } from '../models/User';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/users'; // Replace with your actual API

  constructor(private http: HttpClient) {}

  getUsers(): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>(this.apiUrl);
  }
  getUserById(id: string): Observable<UserProfile> {
  return this.http.get<UserProfile>(`${this.apiUrl}/${id}`);
}
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  assignProfiles(assignProfilesDto: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/assign`, assignProfilesDto);
  }
getCurrentUserId(): number | null {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;

  try {
    const user = JSON.parse(userStr);
    if (user && typeof user.id === 'number') {
      return user.id;
    }
    return null;
  } catch (e) {
    console.error('Error parsing user from localStorage', e);
    return null;
  }
}

}
