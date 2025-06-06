import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { DevisFormData, DevisFormUpdate, EtatDevis } from '../models/DevisUpdate';
import { Devis } from '../models/DevisResponse';

@Injectable({
  providedIn: 'root'
})
export class DevisService {
  private apiUrl = `${environment.apiBaseUrl}/devis`;

  constructor(private http: HttpClient) {}

  getAllDevis(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
  getDevisByClient(clientId: number): Observable<Devis[]> {
  return this.http.get<Devis[]>(`${this.apiUrl}/client/${clientId}`);
}
  getDevisById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/${id}`);
  }
  getDevisByDevisId(devisId: number): Observable<Devis> {
    return this.http.get<Devis>(`${this.apiUrl}/${devisId}`);
  }
  createDevis(devis: DevisFormData): Observable<any> {
    console.log('Creating Devis:', devis);
    return this.http.post(this.apiUrl, devis);
  }
  updateDevis(id: number, updatedDevis: DevisFormUpdate): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, updatedDevis);
  }
  deleteDevis(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
