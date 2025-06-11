// mail.service.ts (Angular Service)
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface DevisMailRequest {
  clientName: string;
  clientEmail: string;
  devisNumber: string;
  demDate: string;
  companyName: string;
  companyEmail: string;
  totalTtc?: number;
  totalM: number;
}

@Injectable({
  providedIn: 'root'
})
export class MailService {
  private apiUrl = `${environment.apiBaseUrl}/mail`;

  constructor(private http: HttpClient) {}

  sendDevisMail(
    mailData: DevisMailRequest,
    files: {
      pdf1: Blob;
      pdf2: Blob;
      pdf3?: Blob;
    }
  ): Observable<any> {
    const formData = new FormData();
    
    // Append PDF files
    formData.append('pdf1', files.pdf1, 'devis.pdf');
    formData.append('pdf2', files.pdf2, 'cgv.pdf');
    if (files.pdf3) {
      formData.append('pdf3', files.pdf3, 'ListeMobilier.pdf');
    }
    
    // Append form data
    Object.keys(mailData).forEach(key => {
      const value = mailData[key as keyof DevisMailRequest];
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });
    console.log('Mail data:', mailData);
formData.forEach((value, key) => {
  console.log(key, value);
});    return this.http.post(`${this.apiUrl}/send-devis`, formData);
  }
}