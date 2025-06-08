import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Devis, EtatDevis, OptionType, TypeLogement, AscenseurType, DistancePortageType, Profile } from 'src/app/models/DevisResponse';
import { DevisService } from 'src/app/services/devis.service';
import { Location } from '@angular/common';
import { DevisFormData, DevisFormUpdate } from 'src/app/models/DevisUpdate';

@Component({
  selector: 'app-devis-details',
  templateUrl: './devis-details.component.html',
  styleUrls: ['./devis-details.component.css']
})
export class DevisDetailsComponent implements OnInit {
  devisId!: number;
  devis?: Devis;
  originalDevis?: Devis; // Store original values for comparison
  loading = true;
  error = '';
  saving = false;
  optionsString: string = '';

  // Enum lists for selects
  etatDevisOptions = Object.values(EtatDevis);
  optionTypeOptions = Object.values(OptionType);
  typeLogementOptions = Object.values(TypeLogement);
  ascenseurOptions = Object.values(AscenseurType);
  distancePortageOptions = Object.values(DistancePortageType);
  distance= 0; // Default distance, can be updated later
  profiles: Profile[] = [];
  isEditing = false;

  // For binding ISO string dates to input[type=datetime-local]
  devisDateDepartString: string = '';
  devisDateLivraisonString: string = '';

  constructor(
    private route: ActivatedRoute,
    private devisService: DevisService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.devisId = +this.route.snapshot.paramMap.get('id')!;
    this.loadDevis();
  }



  loadDevis() {
    this.loading = true;
    this.devisService.getDevisByDevisId(this.devisId).subscribe({
      next: (data) => {
        this.devis = data;
        // Store original values for comparison
        this.originalDevis = JSON.parse(JSON.stringify(data));

        this.optionsString = this.devis.options.join(', ');
        this.devisDateDepartString = this.isoStringToDatetimeLocal(this.devis.dateDepart);
        this.devisDateLivraisonString = this.isoStringToDatetimeLocal(this.devis.dateLivraison);

        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load devis details.';
        this.loading = false;
      }
    });
  }

  toggleEdit() {
    if (this.isEditing) {
      // User clicked "Terminer" - check for changes and save
      if (this.hasChanges()) {
        this.saveChanges();
      } else {
        this.isEditing = false;
      }
    } else {
      // User clicked "Modifier" - enter edit mode
      this.isEditing = true;
    }
  }

  hasChanges(): boolean {
    if (!this.devis || !this.originalDevis) return false;

    // Prepare current devis data
    const currentDevis = this.prepareDevisForComparison();
    
    // Compare with original
    return JSON.stringify(currentDevis) !== JSON.stringify(this.prepareOriginalForComparison());
  }

  prepareDevisForComparison() {
    if (!this.devis) return null;

    // Parse options from string
    const options = this.optionsString
      ? this.optionsString.split(',').map(opt => opt.trim() as OptionType).filter(opt => opt.length > 0)
      : [];

    // Convert dates
    const dateDepart = this.devisDateDepartString ? new Date(this.devisDateDepartString).toISOString() : this.devis.dateDepart;
    const dateLivraison = this.devisDateLivraisonString ? new Date(this.devisDateLivraisonString).toISOString() : this.devis.dateLivraison;

    return {
      // Informations Générales
      volume: this.devis.volume,
      etat: this.devis.etat,
      prixDevis: this.devis.prixDevis,
      options: options,
      // Départ
      adresseDepart: this.devis.adresseDepart,
      typeLogementDepart: this.devis.typeLogementDepart,
      etageDepart: this.devis.etageDepart,
      ascenseurDepart: this.devis.ascenseurDepart,
      distancePortageDepart: this.devis.distancePortageDepart,
      monteMeubleDepart: this.devis.monteMeubleDepart,
      dateDepart: dateDepart,
      // Livraison
      adresseLivraison: this.devis.adresseLivraison,
      typeLogementLivraison: this.devis.typeLogementLivraison,
      etageLivraison: this.devis.etageLivraison,
      ascenseurLivraison: this.devis.ascenseurLivraison,
      distancePortageLivraison: this.devis.distancePortageLivraison,
      monteMeubleLivraison: this.devis.monteMeubleLivraison,
      dateLivraison: dateLivraison
    };
  }

  prepareOriginalForComparison() {
    if (!this.originalDevis) return null;

    return {
      // Informations Générales
      volume: this.originalDevis.volume,
      etat: this.originalDevis.etat,
      prixDevis: this.originalDevis.prixDevis,
      options: this.originalDevis.options,
      // Départ
      adresseDepart: this.originalDevis.adresseDepart,
      typeLogementDepart: this.originalDevis.typeLogementDepart,
      etageDepart: this.originalDevis.etageDepart,
      ascenseurDepart: this.originalDevis.ascenseurDepart,
      distancePortageDepart: this.originalDevis.distancePortageDepart,
      monteMeubleDepart: this.originalDevis.monteMeubleDepart,
      dateDepart: this.originalDevis.dateDepart,
      // Livraison
      adresseLivraison: this.originalDevis.adresseLivraison,
      typeLogementLivraison: this.originalDevis.typeLogementLivraison,
      etageLivraison: this.originalDevis.etageLivraison,
      ascenseurLivraison: this.originalDevis.ascenseurLivraison,
      distancePortageLivraison: this.originalDevis.distancePortageLivraison,
      monteMeubleLivraison: this.originalDevis.monteMeubleLivraison,
      dateLivraison: this.originalDevis.dateLivraison
    };
  }

  saveChanges() {
    if (!this.devis) return;

    this.saving = true;

    // Update devis object with form values
    this.devis.options = this.optionsString
      ? this.optionsString.split(',').map(opt => opt.trim() as OptionType).filter(opt => opt.length > 0)
      : [];

    if (this.devisDateDepartString) {
      this.devis.dateDepart = new Date(this.devisDateDepartString).toISOString();
    }
    if (this.devisDateLivraisonString) {
      this.devis.dateLivraison = new Date(this.devisDateLivraisonString).toISOString();
    }

const cleanDevis : DevisFormUpdate = {
  volume: this.devis.volume,
  adresseDepart: this.devis.adresseDepart,
  typeLogementDepart: this.devis.typeLogementDepart,
  etageDepart: this.devis.etageDepart,
  ascenseurDepart: this.devis.ascenseurDepart,
  distancePortageDepart: this.devis.distancePortageDepart,
  dateDepart: this.devis.dateDepart,
  monteMeubleDepart: this.devis.monteMeubleDepart,
  adresseLivraison: this.devis.adresseLivraison,
  typeLogementLivraison: this.devis.typeLogementLivraison,
  etageLivraison: this.devis.etageLivraison,
  ascenseurLivraison: this.devis.ascenseurLivraison,
  distancePortageLivraison: this.devis.distancePortageLivraison,
  dateLivraison: this.devis.dateLivraison,
  monteMeubleLivraison: this.devis.monteMeubleLivraison,
  prixDevis: Number(this.devis.prixDevis),  // convert string to number if needed
  options: this.devis.options,
  etat: this.devis.etat,
distance: this.distance ?? 0
};

// Send cleanDevis to backend instead of full devis
    this.devisService.updateDevis(this.devis.id,cleanDevis).subscribe({
      next: (updatedDevis) => {
        // Update local data
        this.devis = updatedDevis;
        this.originalDevis = JSON.parse(JSON.stringify(updatedDevis));
        
        // Update display strings
        this.optionsString = this.devis!.options.join(', ');
        this.devisDateDepartString = this.isoStringToDatetimeLocal(this.devis!.dateDepart);
        this.devisDateLivraisonString = this.isoStringToDatetimeLocal(this.devis!.dateLivraison);
        
        this.saving = false;
        this.isEditing = false;
        
        // Optional: Show success message
        console.log('Devis updated successfully');
      },
      error: (error) => {
        this.saving = false;
        this.error = 'Failed to save changes: ' + (error.message || 'Unknown error');
        console.error('Error updating devis:', error);
      }
    });
  }

  cancelEdit() {
    if (!this.originalDevis) return;

    // Restore original values
    this.devis = JSON.parse(JSON.stringify(this.originalDevis));
    this.optionsString = this.devis!.options.join(', ');
    this.devisDateDepartString = this.isoStringToDatetimeLocal(this.devis!.dateDepart);
    this.devisDateLivraisonString = this.isoStringToDatetimeLocal(this.devis!.dateLivraison);
    
    this.isEditing = false;
  }

  goBack() {
    if (this.isEditing && this.hasChanges()) {
      const confirmed = confirm('Vous avez des modifications non sauvegardées. Voulez-vous vraiment quitter sans sauvegarder ?');
      if (!confirmed) return;
    }
    this.location.back();
  }

  isoStringToDatetimeLocal(isoString: string): string {
    if (!isoString) return '';
    const d = new Date(isoString);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
}