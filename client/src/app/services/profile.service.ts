import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Profile } from '../models/ProfileScroll';
import { ProfileDetails } from '../models/Profile';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = `${environment.apiBaseUrl}/profiles`;

  constructor(private http: HttpClient) { }
  submitProfile(profileData: any): Observable<any> {
    return this.http.post(this.apiUrl, profileData);
  }
  getProfiles(): Observable<Profile[]> {
    return this.http.get<Profile[]>(this.apiUrl);
  }
    deleteProfile(profileId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${profileId}`);
  }
  getProfilesByUser(id: number): Observable<Profile[]> {
    return this.http.get<Profile[]>(`${this.apiUrl}/user/${id}`);
  }
    getAllProfilesDetails(): Observable<ProfileDetails[]> {
    return this.http.get<ProfileDetails[]>(this.apiUrl);
  }
    getProfileById(id: number): Observable<ProfileDetails> {
    return this.http.get<ProfileDetails>(`${this.apiUrl}/${id}`);
  }

  updateProfile(id: number, formData: FormData): Observable<ProfileDetails> {
    return this.http.put<ProfileDetails>(`${this.apiUrl}/${id}`, formData);
  }
}