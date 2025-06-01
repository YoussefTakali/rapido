import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClientService } from 'src/app/services/client.service';
import { ProfileService } from 'src/app/services/profile.service';
import { DevisService } from 'src/app/services/devis.service';
import { Client } from 'src/app/models/Client';
import { Profile } from 'src/app/models/Profile';
import { DevisFormData, EtatDevis, OptionType } from 'src/app/models/Devis';
import { User } from 'src/app/models/User';
import { Router } from '@angular/router';


@Component({
  selector: 'app-add-devis',
  templateUrl: './add-devis.component.html',
  styleUrls: ['./add-devis.component.css']
})
export class AddDevisComponent implements OnInit {
  currentStep = 1;
  totalSteps = 5;
  
  // Forms
  clientForm!: FormGroup;
  departForm!: FormGroup;
  livraisonForm!: FormGroup;
  optionsForm!: FormGroup;
  
  // Data
  clients: Client[] = [];
  profiles: Profile[] = [];
  availableOptions = ['REMONTAGE', 'DEBALLAGE', 'EMBALLAGE', 'DEMONTAGE'];
  selectedOptions: string[] = [];
  
  // State
  isAddingNewClient = false;
  isLoading = false;
  calculatedPrice = 0;
  
  // Form data
  formData: Partial<DevisFormData> = {};
  newClientData: Client | null = null;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private profileService: ProfileService,
    private devisService: DevisService,
    private router: Router
  ) {
    this.initializeForms();
  }

  ngOnInit() {
    this.loadClients();
    const user = localStorage.getItem('user');
  const userJson = localStorage.getItem('user');
  if (userJson) {
    const user = JSON.parse(userJson);
    this.loadProfilesByUser(user.id);
  }
}

  initializeForms() {
    // Step 1: Client and Volume
    this.clientForm = this.fb.group({
      clientId: ['', Validators.required],
      profileId: ['', Validators.required],
      volume: ['', [Validators.required, Validators.min(0.1)]],
      nom: [''],
      prenom: [''],
      email: ['', Validators.email],
      telephone: ['']
    });

    // Step 2: Departure details
    this.departForm = this.fb.group({
      adresseDepart: ['', Validators.required],
      typeLogementDepart: ['', Validators.required],
      etageDepart: ['', [Validators.required, Validators.min(0)]],
      ascenseurDepart: ['', Validators.required],
      distancePortageDepart: ['', Validators.required],
      dateDepart: ['', Validators.required],
      monteMeubleDepart: [false]
    });

    // Step 3: Delivery details
    this.livraisonForm = this.fb.group({
      adresseLivraison: ['', Validators.required],
      typeLogementLivraison: ['', Validators.required],
      etageLivraison: ['', [Validators.required, Validators.min(0)]],
      ascenseurLivraison: ['', Validators.required],
      distancePortageLivraison: ['', Validators.required],
      dateLivraison: ['', Validators.required],
      monteMeubleLivraison: [false]
    });

    // Step 4: Options
    this.optionsForm = this.fb.group({
      selectedOptions: [[]]
    });
  }

  loadClients() {
    this.clientService.getClients().subscribe({
      next: (clients) => this.clients = clients,
      error: (error) => console.error('Error loading clients:', error)
    });
  }

  loadProfilesByUser(id: number) {
    this.profileService.getProfilesByUser(id).subscribe({
      next: (profiles) => this.profiles = profiles,
      error: (error) => console.error('Error loading profiles:', error)
    });
  }

  getProgressPercentage(): number {
    return (this.currentStep / this.totalSteps) * 100;
  }

  toggleNewClient() {
    this.isAddingNewClient = !this.isAddingNewClient;
    
    if (this.isAddingNewClient) {
      this.clientForm.get('nom')?.setValidators([Validators.required]);
      this.clientForm.get('prenom')?.setValidators([Validators.required]);
      this.clientForm.get('email')?.setValidators([Validators.required, Validators.email]);
      this.clientForm.get('telephone')?.setValidators([Validators.required]);
    } else {
      this.clientForm.get('nom')?.clearValidators();
      this.clientForm.get('prenom')?.clearValidators();
      this.clientForm.get('email')?.clearValidators();
      this.clientForm.get('telephone')?.clearValidators();
    }
    
    this.clientForm.updateValueAndValidity();
  }

  toggleOption(option: string) {
    const index = this.selectedOptions.indexOf(option);
    if (index > -1) {
      this.selectedOptions.splice(index, 1);
    } else {
      this.selectedOptions.push(option);
    }
  }

  isOptionSelected(option: string): boolean {
    return this.selectedOptions.includes(option);
  }

  nextStep() {
    if (this.currentStep < this.totalSteps && this.validateCurrentStep()) {
      this.saveCurrentStepData();
      this.currentStep++;
      if (this.currentStep === 5) this.calculatePrice();
    }
  }

  previousStep() {
    if (this.currentStep > 1) this.currentStep--;
  }

  validateCurrentStep(): boolean {
    switch (this.currentStep) {
      case 1: return this.clientForm.valid;
      case 2: return this.departForm.valid;
      case 3: return this.livraisonForm.valid;
      default: return true; // Options step is optional
    }
  }

  saveCurrentStepData() {
    switch (this.currentStep) {
      case 1:
        if (this.isAddingNewClient) {
          this.newClientData = {
            nom: this.clientForm.get('nom')?.value,
            prenom: this.clientForm.get('prenom')?.value,
            email: this.clientForm.get('email')?.value,
            telephone: this.clientForm.get('telephone')?.value
          };
        } else {
          this.formData.clientId = this.clientForm.get('clientId')?.value;
        }
        this.formData.profileId = this.clientForm.get('profileId')?.value;
        this.formData.volume = this.clientForm.get('volume')?.value;
        break;
      case 2:
        Object.assign(this.formData, this.departForm.value);
        break;
      case 3:
        Object.assign(this.formData, this.livraisonForm.value);
        break;
      case 4:
  this.formData.options = this.selectedOptions.map(opt => OptionType[opt as keyof typeof OptionType]);
        break;
    }
  }

  calculatePrice() {
    // Simplified pricing logic (replace with actual business logic)
    const basePrice = (this.formData.volume || 0) * 50;
    const optionsPrice = this.selectedOptions.length * 25;
    this.calculatedPrice = basePrice + optionsPrice;
  }
  getSelectedClientName() {
    if (this.isAddingNewClient) {
      return `${this.newClientData?.prenom} ${this.newClientData?.nom}`;
    } else {
      const selectedClient = this.clients.find(client => client.id === this.formData.clientId);
      return selectedClient ? `${selectedClient.prenom} ${selectedClient.nom}` : '';
    }
  }
   getSelectedProfileName() {
    const selectedProfile = this.profiles.find(profile => profile.id === this.formData.profileId);
    return selectedProfile ? selectedProfile.name : '';
  }
  async submitForm() {
    if (this.isLoading) return;
    this.isLoading = true;
    
    try {
      // Create new client if needed
      if (this.isAddingNewClient && this.newClientData) {
  const newClient = await this.clientService.createClient(this.newClientData).toPromise();
  if (newClient && newClient.id) {
    this.formData.clientId = newClient.id;
  } else {
    // Handle case where client or ID is missing
    console.error('Failed to create client or retrieve ID.');
  }
}
      const user: User = JSON.parse(localStorage.getItem('user') || '{}');
      // Prepare final payload
      const payload: DevisFormData = {
        userId: user.id,
        profileId: Number(this.formData.profileId!),
        clientId: Number(this.formData.clientId!),
        volume: this.formData.volume!,
        adresseDepart: this.formData.adresseDepart!,
        typeLogementDepart: this.formData.typeLogementDepart!,
        etageDepart: this.formData.etageDepart!,
        ascenseurDepart: this.formData.ascenseurDepart!,
        distancePortageDepart: this.formData.distancePortageDepart!,
        dateDepart: new Date(this.formData.dateDepart!).toISOString(), // <-- sends string
        monteMeubleDepart: this.formData.monteMeubleDepart!,
        adresseLivraison: this.formData.adresseLivraison!,
        typeLogementLivraison: this.formData.typeLogementLivraison!,
        etageLivraison: this.formData.etageLivraison!,
        ascenseurLivraison: this.formData.ascenseurLivraison!,
        distancePortageLivraison: this.formData.distancePortageLivraison!,
        dateLivraison: new Date(this.formData.dateLivraison!).toISOString(),
        monteMeubleLivraison: this.formData.monteMeubleLivraison!,
        options: this.formData.options || [],
        etat: EtatDevis.BROUILLON
      };

      // Submit devis
      await this.devisService.createDevis(payload).toPromise();
      alert('Devis créé avec succès !');
      this.resetForm();
      this.router.navigate(['/devis']);
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      this.isLoading = false;
    }
  }

  resetForm() {
    this.currentStep = 1;
    this.clientForm.reset();
    this.departForm.reset();
    this.livraisonForm.reset();
    this.optionsForm.reset();
    this.selectedOptions = [];
    this.formData = {};
    this.newClientData = null;
    this.isAddingNewClient = false;
    this.calculatedPrice = 0;
  }
}