import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClientService } from 'src/app/services/client.service';
import { ProfileService } from 'src/app/services/profile.service';
import { DevisService } from 'src/app/services/devis.service';
import { Client } from 'src/app/models/Client';
import { Profile } from 'src/app/models/ProfileScroll';
import { DevisFormData, EtatDevis, OptionType } from 'src/app/models/DevisUpdate';
import { User } from 'src/app/models/User';
import { Router } from '@angular/router';
import { HereMapsService } from 'src/app/services/here-maps.service';

@Component({
  selector: 'app-add-devis',
  templateUrl: './add-devis.component.html',
  styleUrls: ['./add-devis.component.css'],
  encapsulation: ViewEncapsulation.Emulated
})
export class AddDevisComponent implements OnInit {
  currentStep = 1;
  totalSteps = 5;
  
  // Forms
  clientForm!: FormGroup;
  departForm!: FormGroup;
  livraisonForm!: FormGroup;
  
  // Data
  clients: Client[] = [];
  profiles: Profile[] = [];
  availableOptions: OptionType[] = Object.values(OptionType).filter(value => typeof value === 'string') as OptionType[];
  selectedOptions: OptionType[] = [];
  
  // State
  isAddingNewClient = false;
  isLoading = false;
  calculatedPrice = 0;
  calculatedDistance = 0; // Will be calculated between addresses
  
  // Form data
  formData: Partial<DevisFormData> = {};
  newClientData: Client | null = null;

  // Pricing configuration
  private readonly BASE_DISCOUNT = 0.8; // 20% discount
  private readonly PRICE_TIERS = [
    { maxDistance: 100, basePrice: 45, increment: 0 },
    { maxDistance: 200, basePrice: 45, increment: 0.15 },
    { maxDistance: 300, basePrice: 60, increment: 0.15 },
    { maxDistance: 390, basePrice: 75, increment: 0.15 },
    { maxDistance: Infinity, basePrice: 90, increment: 0.15 }
  ];
  private readonly FLOOR_PRICES: {[key: number]: number} = {
    2: 2, 3: 4, 4: 5, 5: 7
  };
  private readonly OPTION_PRICES: Record<OptionType, number> = {
    [OptionType.PACK_CARTONS]: 200,
    [OptionType.REPORT_DE_DATE]: 179,
    [OptionType.FLEXIBILITE_SUR_DATE]: -400,
    [OptionType.DEBALLAGE_ET_REMONTAGE]: 150,
    [OptionType.EMBALLAGE_FRAGILE]: 150,
    [OptionType.EMBALLAGE_CARTONS]: 180,
    [OptionType.AUTORISATION_STATIONNEMENT]: 80,
    [OptionType.TRANSPORT_DES_VETEMENTS]: 25
  };

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private profileService: ProfileService,
    private devisService: DevisService,
    private router: Router,
      private hereMapsService: HereMapsService

  ) {
    this.initializeForms();
  }

  ngOnInit() {
    this.loadClients();
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
      email: ['', [Validators.email]],
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
  }

  loadClients() {
    const userJson = localStorage.getItem('user');
    if (!userJson) return;
    
    const user = JSON.parse(userJson);
    const serviceCall = user.role === 'ADMIN' 
      ? this.clientService.getClients() 
      : this.clientService.getClientsByUser(user.id);

    serviceCall.subscribe({
      next: (clients) => this.clients = clients,
      error: (err) => console.error('Failed to load clients:', err)
    });
  }

  loadProfilesByUser(userId: number) {
    const userJson = localStorage.getItem('user');
    if (!userJson) return;
    
    const user = JSON.parse(userJson);
    const serviceCall = user.role === 'ADMIN' 
      ? this.profileService.getProfiles() 
      : this.profileService.getProfilesByUser(userId);

    serviceCall.subscribe({
      next: (profiles) => this.profiles = profiles,
      error: (err) => console.error('Failed to load profiles:', err)
    });
  }

  getProgressPercentage(): number {
    return (this.currentStep / this.totalSteps) * 100;
  }

toggleNewClient() {
  this.isAddingNewClient = !this.isAddingNewClient;
  
  const fields = ['nom', 'prenom', 'email', 'telephone'];
  const clientIdControl = this.clientForm.get('clientId');
  
  if (this.isAddingNewClient) {
    // When switching to new client, clear and disable existing client validation
    clientIdControl?.clearValidators();
    clientIdControl?.setValue('');
    
    // Enable validation for new client fields
    fields.forEach(field => {
      const control = this.clientForm.get(field);
      control?.setValidators([Validators.required]);
      if (field === 'email') control?.addValidators([Validators.email]);
      control?.updateValueAndValidity();
    });
  } else {
    // When switching back to existing client, clear and disable new client fields
    fields.forEach(field => {
      const control = this.clientForm.get(field);
      control?.clearValidators();
      control?.setValue('');
      control?.updateValueAndValidity();
    });
    
    // Enable validation for existing client selection
    clientIdControl?.setValidators([Validators.required]);
  }
  
  // Update validity for all affected controls
  clientIdControl?.updateValueAndValidity();
  fields.forEach(field => this.clientForm.get(field)?.updateValueAndValidity());
}

  toggleOption(option: OptionType) {
    const index = this.selectedOptions.indexOf(option);
    index > -1 
      ? this.selectedOptions.splice(index, 1) 
      : this.selectedOptions.push(option);
  }

  isOptionSelected(option: OptionType): boolean {
    return this.selectedOptions.includes(option);
  }

  nextStep() {
    if (this.currentStep < this.totalSteps && this.validateCurrentStep()) {
      this.saveCurrentStepData();
      this.currentStep++;
      
      if (this.currentStep === this.totalSteps) {
        this.calculateDistanceAndPrice();
      }
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
      default: return true;
    }
  }

  saveCurrentStepData() {
    switch (this.currentStep) {
      case 1:
        if (this.isAddingNewClient) {
          this.newClientData = {
            nom: this.clientForm.value.nom,
            prenom: this.clientForm.value.prenom,
            email: this.clientForm.value.email,
            telephone: this.clientForm.value.telephone
          };
        } else {
          this.formData.clientId = this.clientForm.value.clientId;
        }
        this.formData.profileId = this.clientForm.value.profileId;
        this.formData.volume = this.clientForm.value.volume;
        break;

      case 2:
        Object.assign(this.formData, this.departForm.value);
        break;

      case 3:
        Object.assign(this.formData, this.livraisonForm.value);
        break;
    }
  }

// ...existing code...

async calculateDistanceAndPrice() {
  console.log('=== CALCULATE DISTANCE AND PRICE START ===');
  console.log('localStorage before calculation:', localStorage.getItem('user'));
  
  if (!this.formData.adresseDepart || !this.formData.adresseLivraison) {
    console.error('Departure and delivery addresses are required');
    return;
  }

  // Backup localStorage before making API calls
  const userBackup = localStorage.getItem('user');
  const tokenBackup = localStorage.getItem('token');
  
  try {
    console.log('About to call HERE Maps API...');
    console.log('Departure address:', this.formData.adresseDepart);
    console.log('Delivery address:', this.formData.adresseLivraison);
    
    // 1. Calculate distance using HERE Maps
    this.calculatedDistance = await this.hereMapsService.calculateDrivingDistance(
      this.formData.adresseDepart,
      this.formData.adresseLivraison
    );

    console.log('HERE Maps API completed. Distance:', this.calculatedDistance);
    console.log('localStorage after HERE Maps call:', localStorage.getItem('user'));

    // 2. Calculate base price
    const basePrice = this.calculateBasePrice(this.calculatedDistance, this.formData.volume || 0);
    
    // 3. Calculate floor charges
    const floorCharges = this.calculateFloorCharges();
    
    // 4. Calculate option prices
    const optionPrices = this.calculateOptionPrices();
    
    // 5. Calculate total price
    this.calculatedPrice = basePrice + floorCharges + optionPrices;

    console.log('Price calculation completed. Total:', this.calculatedPrice);

  } catch (error) {
    console.error('Calculation error:', error);
    console.log('localStorage after error:', localStorage.getItem('user'));
    
    // Fallback to default distance if API fails
    this.calculatedDistance = 100; // Default 100km
    this.calculatePriceWithFallback();
    
    console.log('Using fallback calculation. Price:', this.calculatedPrice);
  } finally {
    // Check if localStorage was cleared and restore it
    if (!localStorage.getItem('user') && userBackup) {
      console.log('🚨 localStorage was cleared! Restoring...');
      localStorage.setItem('user', userBackup);
      if (tokenBackup) {
        localStorage.setItem('token', tokenBackup);
      }
    }
    
    console.log('=== CALCULATE DISTANCE AND PRICE END ===');
    console.log('localStorage at end:', localStorage.getItem('user'));
  }
}

// ...existing code...

  private calculateBasePrice(distance: number, volume: number): number {
    const pricePerCubicMeter = this.getPricePerCubicMeter(distance);
    return pricePerCubicMeter * volume * this.BASE_DISCOUNT;
  }

  private getPricePerCubicMeter(distance: number): number {
    for (const tier of this.PRICE_TIERS) {
      if (distance <= tier.maxDistance) {
        const prevTier = this.PRICE_TIERS[this.PRICE_TIERS.indexOf(tier) - 1];
        const prevMax = prevTier?.maxDistance || 0;
        return tier.basePrice + (tier.increment * (distance - prevMax));
      }
    }
    return 90; // Default price
  }

private calculateFloorCharges(): number {
  let totalCharges = 0;
  const volume = this.formData.volume || 0;

  // Departure floor charges
  if (this.shouldChargeForFloor(
    this.formData.ascenseurDepart,
    this.formData.etageDepart || 0
  )) {
    totalCharges += this.getFloorPrice(this.formData.etageDepart || 0, volume);
  }

  // Delivery floor charges
  if (this.shouldChargeForFloor(
    this.formData.ascenseurLivraison,
    this.formData.etageLivraison || 0
  )) {
    totalCharges += this.getFloorPrice(this.formData.etageLivraison || 0, volume);
  }

  return totalCharges;
}
private shouldChargeForFloor(elevatorStatus: string | undefined, floor: number): boolean {
  // Charge if no elevator or if above 1st floor without full-service elevator
  return elevatorStatus === 'SANS_ASCENSEUR' || 
         (elevatorStatus !== 'TOUT_RENTRE' && floor > 1);
}

private getFloorPrice(floor: number, volume: number): number {
  const pricePerCubicMeter = this.FLOOR_PRICES[floor] || 0;
  return pricePerCubicMeter * volume;
}

private calculateOptionPrices(): number {
  return this.selectedOptions.reduce((total, option) => {
    return total + (this.OPTION_PRICES[option] || 0);
  }, 0);
}

private calculatePriceWithFallback() {
  const basePrice = this.calculateBasePrice(this.calculatedDistance, this.formData.volume || 0);
  const floorCharges = this.calculateFloorCharges();
  const optionPrices = this.calculateOptionPrices();
  this.calculatedPrice = basePrice + floorCharges + optionPrices;
}

// ...existing code...

// ...existing code...

// ...existing code...

// ...existing code...

async submitForm() {
  if (this.isLoading) return;
  this.isLoading = true;
  
  console.log('=== SUBMIT FORM START ===');
  console.log('localStorage at start:', localStorage.getItem('user'));
  
  // Backup localStorage at the start
  const userBackup = localStorage.getItem('user');
  const tokenBackup = localStorage.getItem('token');
  
  try {
    // Create client if new
    if (this.isAddingNewClient && this.newClientData) {
      console.log('Creating new client...');
      const newClient = await this.clientService.createClient(this.newClientData).toPromise();
      console.log('localStorage after client creation:', localStorage.getItem('user'));
      
      if (newClient?.id) {
        this.formData.clientId = newClient.id;
      }
    }

    // Ensure localStorage is available before parsing
    if (!localStorage.getItem('user') && userBackup) {
      console.log('Restoring localStorage before user parsing...');
      localStorage.setItem('user', userBackup);
      if (tokenBackup) localStorage.setItem('token', tokenBackup);
    }

    const userStr = localStorage.getItem('user');
    if (!userStr) {
      throw new Error('User session not found');
    }

    const user: User = JSON.parse(userStr);
    console.log('User object:', user);
    
    // Convert user.id to number more safely
    const userId = Number(user.id);
    
    if (!userId || isNaN(userId)) {
      console.error('Invalid user ID:', user.id);
      throw new Error(`Invalid user ID: ${user.id}`);
    }

    // Prepare final payload
    const payload: DevisFormData = {
      userId: userId,
      profileId: Number(this.formData.profileId!),
      clientId: Number(this.formData.clientId!),
      volume: this.formData.volume!,
      distance: this.calculatedDistance,
      prixDevis: this.calculatedPrice,
      adresseDepart: this.formData.adresseDepart!,
      typeLogementDepart: this.formData.typeLogementDepart!,
      etageDepart: this.formData.etageDepart!,
      ascenseurDepart: this.formData.ascenseurDepart!,
      distancePortageDepart: this.formData.distancePortageDepart!,
      dateDepart: new Date(this.formData.dateDepart!).toISOString(),
      monteMeubleDepart: this.formData.monteMeubleDepart!,
      adresseLivraison: this.formData.adresseLivraison!,
      typeLogementLivraison: this.formData.typeLogementLivraison!,
      etageLivraison: this.formData.etageLivraison!,
      ascenseurLivraison: this.formData.ascenseurLivraison!,
      distancePortageLivraison: this.formData.distancePortageLivraison!,
      dateLivraison: new Date(this.formData.dateLivraison!).toISOString(),
      monteMeubleLivraison: this.formData.monteMeubleLivraison!,
      options: this.selectedOptions,
      etat: EtatDevis.BROUILLON
    };

    console.log('About to call createDevis API...');
    console.log('localStorage before API call:', localStorage.getItem('user'));
    console.log('Final payload:', payload);

    const result = await this.devisService.createDevis(payload).toPromise();
    console.log('createDevis API completed successfully:', result);
    console.log('localStorage after API call:', localStorage.getItem('user'));

    // Check if localStorage was cleared after API call
    if (!localStorage.getItem('user') && userBackup) {
      console.log('🚨 localStorage cleared after API call! Restoring...');
      localStorage.setItem('user', userBackup);
      if (tokenBackup) localStorage.setItem('token', tokenBackup);
    }

    console.log('About to navigate to /devis...');
    console.log('localStorage before navigation:', localStorage.getItem('user'));
    
    await this.router.navigate(['/devis']);
    
    console.log('Navigation completed');
    
    // Check localStorage after navigation
    setTimeout(() => {
      console.log('localStorage 1 second after navigation:', localStorage.getItem('user'));
    }, 1000);
    
  } catch (error) {
    console.error('Error submitting devis:', error);
    console.log('localStorage on error:', localStorage.getItem('user'));
    
    // Restore localStorage on error
    if (!localStorage.getItem('user') && userBackup) {
      console.log('Restoring localStorage after error...');
      localStorage.setItem('user', userBackup);
      if (tokenBackup) localStorage.setItem('token', tokenBackup);
    }
  } finally {
    this.isLoading = false;
    console.log('=== SUBMIT FORM END ===');
    console.log('localStorage at end:', localStorage.getItem('user'));
  }
}

// ...existing code...

// ...existing code...

// ...existing code...

// ...existing code...

  getSelectedClientName(): string {
    if (this.isAddingNewClient) {
      return `${this.newClientData?.prenom} ${this.newClientData?.nom}`;
    }
    const client = this.clients.find(c => c.id === this.formData.clientId);
    return client ? `${client.prenom} ${client.nom}` : '';
  }

  getSelectedProfileName(): string {
    const profile = this.profiles.find(p => p.id === this.formData.profileId);
    return profile?.companyName || '';
  }

  resetForm() {
    this.currentStep = 1;
    this.clientForm.reset();
    this.departForm.reset();
    this.livraisonForm.reset();
    this.selectedOptions = [];
    this.formData = {};
    this.newClientData = null;
    this.isAddingNewClient = false;
    this.calculatedPrice = 0;
    this.calculatedDistance = 0;
  }
  // ...existing code...

  departureAddressSuggestions: any[] = [];
  deliveryAddressSuggestions: any[] = [];
  showDepartureSuggestions = false;
  showDeliverySuggestions = false;

  // ...existing code...

  // Address autocomplete methods
  async onDepartureAddressInput(event: any) {
    const query = event.target.value;
    if (query.length > 2) {
      try {
        this.departureAddressSuggestions = await this.hereMapsService.searchAddresses(query);
        this.showDepartureSuggestions = this.departureAddressSuggestions.length > 0;
      } catch (error) {
        console.error('Error fetching departure address suggestions:', error);
        this.showDepartureSuggestions = false;
      }
    } else {
      this.showDepartureSuggestions = false;
    }
  }

  async onDeliveryAddressInput(event: any) {
    const query = event.target.value;
    if (query.length > 2) {
      try {
        this.deliveryAddressSuggestions = await this.hereMapsService.searchAddresses(query);
        this.showDeliverySuggestions = this.deliveryAddressSuggestions.length > 0;
      } catch (error) {
        console.error('Error fetching delivery address suggestions:', error);
        this.showDeliverySuggestions = false;
      }
    } else {
      this.showDeliverySuggestions = false;
    }
  }

  selectDepartureAddress(suggestion: any) {
    this.departForm.patchValue({
      adresseDepart: suggestion.title || suggestion.address?.label
    });
    this.showDepartureSuggestions = false;
  }

  selectDeliveryAddress(suggestion: any) {
    this.livraisonForm.patchValue({
      adresseLivraison: suggestion.title || suggestion.address?.label
    });
    this.showDeliverySuggestions = false;
  }

  hideDepartureSuggestions() {
    // Delay hiding to allow click events to fire
    setTimeout(() => {
      this.showDepartureSuggestions = false;
    }, 200);
  }

  hideDeliverySuggestions() {
    // Delay hiding to allow click events to fire
    setTimeout(() => {
      this.showDeliverySuggestions = false;
    }, 200);
  }


}