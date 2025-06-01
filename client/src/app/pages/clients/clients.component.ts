import { Component, OnInit } from '@angular/core';
import { ClientResponse } from 'src/app/models/ClientRespose';
import { ClientService } from 'src/app/services/client.service';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css']
})
export class ClientsComponent implements OnInit {
  clients: ClientResponse[] = [];
  filteredClients: ClientResponse[] = [];
  searchTerm: string = '';

  constructor(private clientService: ClientService) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user')!);
    if (user?.id) {
      this.clientService.getClientsByUser(user.id).subscribe({
        next: (data) => {
          this.clients = data;
          this.filteredClients = data;  // initialize filtered clients list
          console.log('Clients loaded:', this.clients);
        },
        error: (error) => {
          console.error('Erreur récupération clients', error);
        }
      });
    }
  }

  onSearchChange(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredClients = this.clients.filter(client =>
      client.nom.toLowerCase().includes(term) ||
      (client.email && client.email.toLowerCase().includes(term))
    );
  }

  goToClientDevises(clientId: number): void {
    // Navigate to the devis page for the selected client
    // this.router.navigate(['/devis', clientId]);
    console.log(`Navigating to devis for client ID: ${clientId}`);
  }
}
