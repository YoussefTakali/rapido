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
  paginatedClients: ClientResponse[] = [];
  searchTerm: string = '';

  currentPage: number = 1;
  itemsPerPage: number = 6;
  totalPages: number = 0;

  constructor(private clientService: ClientService) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user')!);
    if (user?.id) {
      this.clientService.getClientsByUser(user.id).subscribe({
        next: (data) => {
          this.clients = data;
          this.filteredClients = data;
          this.updatePagination();
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
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    const data = this.filteredClients;
    this.totalPages = Math.ceil(data.length / this.itemsPerPage);
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedClients = data.slice(start, end);
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.updatePagination();
  }
toggleFilter(){}
goToAddClient(){}
  goToClientDevises(clientId: number): void {
    // Navigate to the devis page for the selected client
    // this.router.navigate(['/devis', clientId]);
    console.log(`Navigating to devis for client ID: ${clientId}`);
  }
  itemsPerPageOptions = [3, 6, 9, 12]; // options for dropdown

onItemsPerPageChange(): void {
  this.currentPage = 1;
  this.updatePagination();
}
}
