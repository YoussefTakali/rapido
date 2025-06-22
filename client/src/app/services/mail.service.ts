import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

export interface DevisMailRequest {
  clientName: string;
  clientEmail: string;
  devisNumber: string;
  demDate: string;
  companyName: string;
  companyEmail: string;
  totalTtc?: number;
  totalM: number;
  additionalFileName?: string;  // Add this line
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
      pdf4?: Blob;  // Add this line for the additional file
    }
  ): Observable<any> {
    const formData = new FormData();
    
    // Append PDF files
    formData.append('pdf1', files.pdf1, 'devis.pdf');
    formData.append('pdf2', files.pdf2, 'cgv.pdf');
    
    if (files.pdf3) {
      formData.append('pdf3', files.pdf3, 'ListeMobilier.pdf');
    }
    
    if (files.pdf4) {
      // Use the original file name for the additional file
      const fileName = (files.pdf4 as File).name || 'DocumentSupplementaire.pdf';
      formData.append('pdf4', files.pdf4, fileName);
      mailData.additionalFileName = fileName;  // Send the file name in the form data
    }
    
    // Append form data
    Object.keys(mailData).forEach(key => {
      const value = mailData[key as keyof DevisMailRequest];
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });
    
    return this.http.post(`${this.apiUrl}/send-devis`, formData);
  }
}