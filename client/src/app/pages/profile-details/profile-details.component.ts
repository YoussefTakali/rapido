import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { ProfileService } from 'src/app/services/profile.service';
import { ProfileDetails } from 'src/app/models/Profile';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.css'],
    encapsulation: ViewEncapsulation.Emulated,  // make sure it's not None

})
export class ProfileDetailsComponent implements OnInit {
  apiBaseUrl = environment.apiBaseUrl; // Replace with your actual API base URL
  profileId!: number;
  profile?: ProfileDetails;
  originalProfile?: ProfileDetails; // Store original values for comparison
  loading = true;
  error = '';
  saving = false;
  isEditing = false;

  // For file uploads
  logoFile?: File;
  pdfCgvFile?: File;

  constructor(
    private route: ActivatedRoute,
    private profileService: ProfileService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.profileId = +this.route.snapshot.paramMap.get('id')!;
    this.loadProfile();
  }

  loadProfile() {
    this.loading = true;
    this.profileService.getProfileById(this.profileId).subscribe({
      next: (data) => {
        this.profile = data;
        this.originalProfile = JSON.parse(JSON.stringify(data));
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load profile details.';
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
    if (!this.profile || !this.originalProfile) return false;
    return JSON.stringify(this.prepareProfileForComparison()) !== 
           JSON.stringify(this.prepareOriginalForComparison());
  }

  prepareProfileForComparison() {
    if (!this.profile) return null;

    return {
      companyName: this.profile.companyName,
      formeJuridique: this.profile.formeJuridique,
      capitalSocial: this.profile.capitalSocial,
      siret: this.profile.siret,
      tva: this.profile.tva,
      rcsOuRm: this.profile.rcsOuRm,
      adresse: this.profile.adresse,
      nomAssurance: this.profile.nomAssurance,
      montantMobilier: this.profile.montantMobilier,
      montantMaxParObjet: this.profile.montantMaxParObjet,
      franchise: this.profile.franchise,
      pourcentageAcompte: this.profile.pourcentageAcompte,
      bic: this.profile.bic,
      iban: this.profile.iban
    };
  }

  prepareOriginalForComparison() {
    if (!this.originalProfile) return null;

    return {
      companyName: this.originalProfile.companyName,
      formeJuridique: this.originalProfile.formeJuridique,
      capitalSocial: this.originalProfile.capitalSocial,
      siret: this.originalProfile.siret,
      tva: this.originalProfile.tva,
      rcsOuRm: this.originalProfile.rcsOuRm,
      adresse: this.originalProfile.adresse,
      nomAssurance: this.originalProfile.nomAssurance,
      montantMobilier: this.originalProfile.montantMobilier,
      montantMaxParObjet: this.originalProfile.montantMaxParObjet,
      franchise: this.originalProfile.franchise,
      pourcentageAcompte: this.originalProfile.pourcentageAcompte,
      bic: this.originalProfile.bic,
      iban: this.originalProfile.iban
    };
  }

  onLogoChange(event: any) {
    this.logoFile = event.target.files[0];
  }

  onPdfCgvChange(event: any) {
    this.pdfCgvFile = event.target.files[0];
  }

  saveChanges() {
    if (!this.profile) return;

    this.saving = true;

    const formData = new FormData();
    
    // Add all fields to FormData
    formData.append('companyName', this.profile.companyName);
     formData.append('companyEmail', this.profile.companyEmail || ''); // Add this
    formData.append('companyPhone', this.profile.companyPhone || '');
    formData.append('formeJuridique', this.profile.formeJuridique);
    formData.append('capitalSocial', this.profile.capitalSocial.toString());
    formData.append('siret', this.profile.siret);
    formData.append('tva', this.profile.tva);
    formData.append('rcsOuRm', this.profile.rcsOuRm);
    formData.append('adresse', this.profile.adresse);
    formData.append('nomAssurance', this.profile.nomAssurance);
    formData.append('montantMobilier', this.profile.montantMobilier.toString());
    formData.append('montantMaxParObjet', this.profile.montantMaxParObjet.toString());
    formData.append('franchise', this.profile.franchise.toString());
    formData.append('pourcentageAcompte', this.profile.pourcentageAcompte.toString());
    formData.append('bic', this.profile.bic);
    formData.append('iban', this.profile.iban);

    if (this.logoFile) {
      formData.append('logo', this.logoFile);
    }
    if (this.pdfCgvFile) {
      formData.append('pdfCgv', this.pdfCgvFile);
    }
    console.log("-----formdata--------")
    const formDataEntries: any = {};
    for (let [key, value] of (formData as any).entries()) {
      if (value instanceof File) {
        formDataEntries[key] = `[File: ${value.name}, Size: ${value.size} bytes, Type: ${value.type}]`;
      } else {
        formDataEntries[key] = value;
      }
    }
    this.profileService.updateProfile(this.profileId, formData).subscribe({
      next: (updatedProfile) => { 
        this.profile = updatedProfile;
        this.originalProfile = JSON.parse(JSON.stringify(updatedProfile));
        this.saving = false;
        this.isEditing = false;
        console.log('Profile updated successfully');
      },
      error: (error) => {
        this.saving = false;
        this.error = 'Failed to save changes: ' + (error.message || 'Unknown error');
        console.error('Error updating profile:', error);
      }
    });
  }

  cancelEdit() {
    if (!this.originalProfile) return;

    this.profile = JSON.parse(JSON.stringify(this.originalProfile));
    this.isEditing = false;
    this.logoFile = undefined;
    this.pdfCgvFile = undefined;
  }

  goBack() {
    if (this.isEditing && this.hasChanges()) {
      const confirmed = confirm('Vous avez des modifications non sauvegardées. Voulez-vous vraiment quitter sans sauvegarder ?');
      if (!confirmed) return;
    }
    this.location.back();
  }
}