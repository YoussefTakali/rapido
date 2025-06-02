import { Component, OnInit } from '@angular/core';
import { DevisService } from 'src/app/services/devis.service';
import { Options } from '@angular-slider/ngx-slider';
import { Router } from '@angular/router';
import { DevisFormData, EtatDevis } from 'src/app/models/Devis';
import { ProfileService } from 'src/app/services/profile.service';


@Component({
  selector: 'app-devis',
  templateUrl: './devis.component.html',
  styleUrls: ['./devis.component.css']
})
export class DevisComponent implements OnInit {
profiles: any[] = [];

  // Variable pour stocker la sélection multiple
  selectedProfileIds: number[] = [];
  devisList: any[] = [];
  filteredDevisList: any[] = [];
  searchTerm: string = '';
  itemsPerPageOptions = [5, 10, 25, 50];
  itemsPerPage = 10;
  currentPage = 1;

  filterMinPrice = 0;
  filterMaxPrice = 100000;
  priceSliderOptions: Options = {
    floor: 0,
    ceil: 100000,
    step: 100,
    noSwitching: true,
    translate: (value: number): string => value.toLocaleString('fr-FR') + ' €',
  };
loadProfiles(id: number): void {
  this.profileService.getProfilesByUser(id).subscribe({
    next: (data) => {
      this.profiles = data;
      console.log('Profiles loaded:', this.profiles);
    },
    error: (error) => {
      console.error('Erreur récupération profils', error);
    }
  });
}
  filterDepartFrom: string = '';
  filterDepartTo: string = '';

  filterLivraisonFrom: string = '';
  filterLivraisonTo: string = '';

  filterCreatedFrom: string = '';
  filterCreatedTo: string = '';

  showFilter = false;

  // Ajout pour gestion édition état
  editingEtatDevisId: number | null = null;
  etatValues = Object.values(EtatDevis);

  constructor(private devisService: DevisService, private router: Router, private profileService: ProfileService) {}

  ngOnInit(): void {
    const user = localStorage.getItem('user');
  const userJson = localStorage.getItem('user');
  if (userJson) {
    const user = JSON.parse(userJson);
    this.loadDevis(user.id);
    this.loadProfiles(user.id);

  }
  }
  toggleProfileSelection(profileId: number) {
  const index = this.selectedProfileIds.indexOf(profileId);
  if (index > -1) {
    this.selectedProfileIds.splice(index, 1);
  } else {
    this.selectedProfileIds.push(profileId);
  }
}

onProfileCheckboxChange(event: any, profileId: number) {
  if(event.target.checked) {
    if (!this.selectedProfileIds.includes(profileId)) {
      this.selectedProfileIds.push(profileId);
    }
  } else {
    this.selectedProfileIds = this.selectedProfileIds.filter(id => id !== profileId);
  }
  this.applyFilters();
}

  loadDevis(id : number) {
    this.devisService.getDevisById(id).subscribe({
      next: (data) => {
        this.devisList = data;
        this.filteredDevisList = [...this.devisList];
        this.applyFilterAndPagination();
      },
      error: (error) => {
        console.error('Error fetching devis:', error);
      }
    });
  }

  applyFilterAndPagination() {
    const term = this.searchTerm.toLowerCase();

    this.filteredDevisList = this.devisList.filter(devis => {
      return (
        devis.client.nom.toLowerCase().includes(term) ||
        devis.adresseDepart.toLowerCase().includes(term) ||
        devis.etat.toLowerCase().includes(term)
      );
    });

    const maxPage = Math.ceil(this.filteredDevisList.length / this.itemsPerPage);
    if (this.currentPage > maxPage) this.currentPage = 1;
  }

  onSearchChange() {
    this.currentPage = 1;
    this.applyFilterAndPagination();
  }

  onItemsPerPageChange() {
    this.currentPage = 1;
  }

  pagedDevisList(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredDevisList.slice(start, start + this.itemsPerPage);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString('fr-FR', options);
  }

  mapStatusToLabel(status: string): string {
    switch(status) {
      case 'BROUILLON': return 'Brouillon';
      case 'ARCHIVE': return 'Archivé';
      case 'GAGNE': return 'Gagné';
      case 'PERDU': return 'Perdu';
      case 'ENVOYEE': return 'Envoyé';
      case 'EN_COURS': return 'En cours';
      default: return status;
    }
  }

  selectDevis(devis: any) {
    console.log('Selected Devis:', devis);
  }

  editDevis(devis: any) {
    console.log('Edit Devis:', devis);
    // your edit logic here
  }

 confirmDelete(devis: any) {
  const confirmed = window.confirm(`Are you sure you want to delete the devis for client ${devis.client.prenom} ${devis.client.nom}?`);
  if (confirmed) {
    this.deleteDevis(devis);
  }
}

// Your existing delete service call, e.g.:

deleteDevis(devis: any) {
  this.devisService.deleteDevis(devis.id).subscribe({
    next: () => {
      // remove from list or refresh
      this.ngOnInit();
    },
    error: (err) => {
      console.error('Failed to delete devis:', err);
      alert('Error deleting devis');
    }
  });
}

  totalPages(): number {
    return Math.ceil(this.filteredDevisList.length / this.itemsPerPage);
  }

  goToPage(page: number) {
    if(page >= 1 && page <= this.totalPages()) {
      this.currentPage = page;
    }
  }

viewDevis(devis: any) {
  this.router.navigate(['/devis-details', devis.id]);
}

  toggleFilter() {
    this.showFilter = !this.showFilter;
  }

applyFilters() {
  const term = this.searchTerm.toLowerCase();

  this.filteredDevisList = this.devisList.filter(devis => {
    // Filtre texte (client.nom, adresseDepart, état)
    const matchesSearchTerm =
      devis.client.nom.toLowerCase().includes(term) ||
      devis.adresseDepart.toLowerCase().includes(term) ||
      devis.etat.toLowerCase().includes(term);

    // Filtre prix
    const prix = devis.prixDevis;
    const matchesPrice = prix >= this.filterMinPrice && prix <= this.filterMaxPrice;

    // Filtre dates
    const depart = devis.dateDepart ? new Date(devis.dateDepart).getTime() : 0;
    const livraison = devis.dateLivraison ? new Date(devis.dateLivraison).getTime() : 0;
    const created = devis.createdAt ? new Date(devis.createdAt).getTime() : 0;

    const matchesDepart =
      (!this.filterDepartFrom || depart >= new Date(this.filterDepartFrom).getTime()) &&
      (!this.filterDepartTo || depart <= new Date(this.filterDepartTo).getTime());

    const matchesLivraison =
      (!this.filterLivraisonFrom || livraison >= new Date(this.filterLivraisonFrom).getTime()) &&
      (!this.filterLivraisonTo || livraison <= new Date(this.filterLivraisonTo).getTime());

    const matchesCreated =
      (!this.filterCreatedFrom || created >= new Date(this.filterCreatedFrom).getTime()) &&
      (!this.filterCreatedTo || created <= new Date(this.filterCreatedTo).getTime());

    // Filtre profils (checkboxes)
    const matchesProfile =
      this.selectedProfileIds.length === 0 || // si rien sélectionné, on ne filtre pas
      this.selectedProfileIds.includes(devis.profileId);

    // Combine tous les filtres
    return (
      matchesSearchTerm &&
      matchesPrice &&
      matchesDepart &&
      matchesLivraison &&
      matchesCreated &&
      matchesProfile
    );
  });

  this.showFilter = false;
  this.currentPage = 1;
}


  onSliderChange() {
    this.applyFilterAndPagination();
  }

  goToAddDevis() {
    this.router.navigate(['/add-devis']);
  }

  resetFilters() {
    this.filterMinPrice = 0;
    this.filterMaxPrice = 100000;
    this.filterDepartFrom = '';
    this.filterDepartTo = '';
    this.filterLivraisonFrom = '';
    this.filterLivraisonTo = '';
    this.filterCreatedFrom = '';
    this.filterCreatedTo = '';
    this.filteredDevisList = [...this.devisList];
    this.currentPage = 1;
  }

  // --- Gestion modification état ---

startEditingEtat(devisId: number, event: MouseEvent) {
  event.stopPropagation();
  if (this.editingEtatDevisId !== devisId) {
    this.editingEtatDevisId = devisId;

    setTimeout(() => {
      const selectElement = document.getElementById(`etat-select-${devisId}`) as HTMLSelectElement;
      if (selectElement) {
        selectElement.focus();
        // Try to simulate click to open the dropdown (browser-dependent)
        const event = new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
          view: window,
        });
        selectElement.dispatchEvent(event);
      }
    }, 0);
  }
}

  cancelEditing() {
    this.editingEtatDevisId = null;
  }

onEtatChange(devis: any, newEtat: EtatDevis) {
  // Construire un nouvel objet DevisFormData complet avec la nouvelle valeur d'état
  const updatedDevis: DevisFormData = {
    userId: devis.userId,
    profileId: devis.profileId,
    clientId: devis.client.id, // ou devis.clientId selon ta structure
    volume: devis.volume,
    adresseDepart: devis.adresseDepart,
    typeLogementDepart: devis.typeLogementDepart,
    etageDepart: devis.etageDepart,
    ascenseurDepart: devis.ascenseurDepart,
    distancePortageDepart: devis.distancePortageDepart,
    dateDepart: devis.dateDepart,
    monteMeubleDepart: devis.monteMeubleDepart,
    adresseLivraison: devis.adresseLivraison,
    typeLogementLivraison: devis.typeLogementLivraison,
    etageLivraison: devis.etageLivraison,
    ascenseurLivraison: devis.ascenseurLivraison,
    distancePortageLivraison: devis.distancePortageLivraison,
    dateLivraison: devis.dateLivraison,
    monteMeubleLivraison: devis.monteMeubleLivraison,
    options: devis.options,
    etat: newEtat, // ici on met le nouvel état
  };

  this.devisService.updateDevis(devis.id, updatedDevis).subscribe({
    next: () => {
      devis.etat = newEtat; // Met à jour localement pour refléter immédiatement le changement
      this.editingEtatDevisId = null;
    },
    error: (err) => {
      console.error('Erreur lors de la mise à jour du devis', err);
      // optionnel : rollback ou afficher message d'erreur
    }
  });
}

}
