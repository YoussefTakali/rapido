import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  profilePicture: string | null;
}

interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  user?: User;
}
@Injectable({ providedIn: 'root' })
export class AuthService {
  private accessToken: string | null = null;
  constructor(private http: HttpClient) {}


login(email: string, password: string): Observable<LoginResponse> {
  return new Observable<LoginResponse>((observer) => {
    this.http.post<LoginResponse>(`${environment.apiBaseUrl}/auth/login`, { email, password }).subscribe({
      next: (response) => {
        this.setAccessToken(response.access_token);
        if (response.refresh_token) {
          this.setRefreshToken(response.refresh_token);
        }
        if (response.user) {
          // Save whole user object as JSON string
          localStorage.setItem('user', JSON.stringify(response.user));
        }
        observer.next(response);
        observer.complete();
      },
      error: (err) => {
        observer.error(err);
      }
    });
  });
}
getUser(): User | null {
  const userJson = localStorage.getItem('user');
  if (userJson) {
    return JSON.parse(userJson);
  }
  return null;
}
  isLoggedIn(): boolean {
    return !!localStorage.getItem('accessToken');
  }
logout(): Observable<any> {
  if (!this.accessToken) {
    return new Observable((observer) => {
      observer.error('No access token available');
    });
  }

  return this.http.post(
    'http://localhost:3000/auth/logout',
    {},
    {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    }
  );
}

  // Use localStorage only if you must for refresh token
  setRefreshToken(token: string) {
    localStorage.setItem('refreshToken', token);
  }
  setUser(loginResponse: LoginResponse) {
    this.setAccessToken(loginResponse.access_token);
    if (loginResponse.refresh_token) {
      this.setRefreshToken(loginResponse.refresh_token);
    }
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  setAccessToken(token: string) {
  this.accessToken = token;
  localStorage.setItem('accessToken', token);
}

getAccessToken(): string | null {
  if (!this.accessToken) {
    this.accessToken = localStorage.getItem('accessToken');
  }
  return this.accessToken;
}

removeTokens() {
  this.accessToken = null;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');

}
}