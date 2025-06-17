import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserProfile } from '../models/User';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiBaseUrl}/users`;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>(this.apiUrl);
  }

  getUserById(id: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/${id}`);
  }

  getCurrentUser(): Observable<UserProfile> {
    const userId = this.getCurrentUserId();
    if (!userId) throw new Error('No user logged in');
    return this.getUserById(userId.toString());
  }

  updateUser(id: number, userData: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.apiUrl}/${id}`, userData);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
updateUserWithProfilePicture(userId: number, formData: FormData): Observable<UserProfile> {
  return this.http.put<UserProfile>(`${this.apiUrl}/${userId}`, formData);
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