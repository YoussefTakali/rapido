import { Component, Input, OnInit } from '@angular/core';
import { DevisMailRequest, MailService } from 'src/app/services/mail.service';
import { PdfService } from 'src/app/services/pdf.service';
import { environment } from 'src/environments/environment';

export interface DevisData {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  date_livraison: string;
  pdf_path?: string;
  total_ttc: number;
}

export interface CompanyProfile {
  company_name: string;
  email: string;
  cgv_file_path: string;
}

@Component({
  selector: 'app-devis-mail',
  template: `
    <div class="mail-controls">
      <h3>Envoyer le devis par email</h3>
      
      <div class="button-group">
        <button 
          class="btn btn-primary"
          (click)="sendMail(false, false)"
          [disabled]="isLoading">
          <i class="fas fa-envelope"></i>
          Envoyer Devis Simple
        </button>
        
        <button 
          class="btn btn-success"
          (click)="sendMail(true, false)"
          [disabled]="isLoading">
          <i class="fas fa-credit-card"></i>
          Envoyer avec Paiement
        </button>
        
        <button 
          class="btn btn-info"
          (click)="sendMail(false, true)"
          [disabled]="isLoading"
          *ngIf="devisData.pdf_path">
          <i class="fas fa-list"></i>
          Envoyer avec Liste Mobilier
        </button>
        
        <button 
          class="btn btn-warning"
          (click)="sendMail(true, true)"
          [disabled]="isLoading"
          *ngIf="devisData.pdf_path">
          <i class="fas fa-star"></i>
          Envoyer Complet (Paiement + Mobilier)
        </button>
      </div>
      
      <div class="loading-indicator" *ngIf="isLoading">
        <i class="fas fa-spinner fa-spin"></i>
        Envoi en cours...
      </div>
    </div>
  `,
  styles: [`
    .mail-controls {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    
    .button-group {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 15px;
    }
    
    .btn {
      padding: 10px 15px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s ease;
    }
    
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .btn-primary {
      background-color: #007bff;
      color: white;
    }
    
    .btn-success {
      background-color: #28a745;
      color: white;
    }
    
    .btn-info {
      background-color: #17a2b8;
      color: white;
    }
    
    .btn-warning {
      background-color: #ffc107;
      color: #212529;
    }
    
    .btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }
    
    .loading-indicator {
      margin-top: 15px;
      color: #6c757d;
      font-style: italic;
    }
    
    @media (max-width: 768px) {
      .button-group {
        flex-direction: column;
      }
      
      .btn {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class DevisMailComponent implements OnInit {
  @Input() devisData!: DevisData;
  @Input() companyProfile!: CompanyProfile;
  @Input() devisContentElementId: string = 'devis-content';
  
  isLoading = false;

  constructor(
    private mailService: MailService,
    private pdfService: PdfService,
  ) {}

  ngOnInit() {
    if (!this.devisData || !this.companyProfile) {
      console.error('DevisData and CompanyProfile are required inputs');
    }
    else {
      console.log('DevisData:', this.devisData);
      console.log('CompanyProfile:', this.companyProfile);
    }
  }

  async sendMail(includePayment: boolean, includeMobilier: boolean) {
    if (this.isLoading) return;
    
    this.isLoading = true;
    
    try {
      // Generate PDF from devis content
      const devisPdf = await this.pdfService.generatePdfFromElement(this.devisContentElementId);
      
      // Fetch CGV PDF
      const cgvUrl = `${environment.apiBaseUrl}/uploads/profilesPDF/${this.companyProfile.cgv_file_path}`;
      const cgvPdf = await this.pdfService.fetchPdfBlob(cgvUrl);
      
      // Prepare files object
      const files: { pdf1: Blob; pdf2: Blob; pdf3?: Blob } = {
        pdf1: devisPdf,
        pdf2: cgvPdf
      };
      
      // Fetch mobilier PDF if needed
      if (includeMobilier && this.devisData.pdf_path) {
        const mobilierPath = this.devisData.pdf_path.replace(/^(\.\.\/)+/, '/');
        const mobilierUrl = `${window.location.origin}/assets-mobilier.php?file=${mobilierPath}`;
        
        try {
          files.pdf3 = await this.pdfService.fetchPdfBlob(mobilierUrl);
        } catch (error) {
          console.warn('Could not fetch mobilier PDF:', error);
        }
      }
      
      // Prepare mail data
      const mailData: DevisMailRequest = {
        clientName: `${this.devisData.nom} ${this.devisData.prenom}`,
        clientEmail: this.devisData.email,
        devisNumber: this.devisData.id,
        demDate: this.devisData.date_livraison,
        companyName: this.companyProfile.company_name,
        companyEmail: this.companyProfile.email,
        totalM: this.devisData.total_ttc,
        ...(includePayment && { totalTtc: this.devisData.total_ttc })
      };
      
      // Send email
      await this.mailService.sendDevisMail(mailData, files).toPromise();
      
      console.log('Email envoyé avec succès!', 'Succès');
      console.log('Mail data:', mailData);
    } catch (error) {
      console.error('Error sending email:', error);
    } finally {
      this.isLoading = false;
    }
  }
}