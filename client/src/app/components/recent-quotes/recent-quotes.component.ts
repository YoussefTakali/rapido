import { Component, OnInit } from '@angular/core';
import { Devis } from 'src/app/models/DevisResponse';
import { AuthService } from 'src/app/services/auth.service';
import { DevisService } from 'src/app/services/devis.service';

@Component({
  selector: 'app-recent-quotes',
  templateUrl: './recent-quotes.component.html',
  styleUrls: ['./recent-quotes.component.css']
})
export class RecentQuotesComponent implements OnInit {
  quotes: Devis[] = [];
  isAdmin: boolean = false;

  constructor(
    private authService: AuthService,
    private devisService: DevisService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    this.isAdmin = user?.role === 'ADMIN';

    if (this.isAdmin) {
      this.devisService.getAllDevis().subscribe({
        next: (data) => this.quotes = data, 
        error: (err) => console.error('Failed to fetch all devis:', err)
      });
    } else if (user) {
      this.devisService.getDevisById(user.id).subscribe({
        next: (data) => this.quotes = data,
        error: (err) => console.error('Failed to fetch devis for user:', err)
      });
    }
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'GAGNE': 'status-won',
      'PERDU': 'status-lost',
      'ENVOYEE': 'status-sent',
      'EN_COURS': 'status-progress',
      'BROUILLON': 'status-draft',
      'ARCHIVE': 'status-archive'
    };
    return classes[status] || 'status-default';
  }
}
