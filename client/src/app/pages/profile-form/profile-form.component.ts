import { Component, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
  selector: 'app-profile-form',
  templateUrl: './profile-form.component.html',
  styleUrls: ['./profile-form.component.css'],
    encapsulation: ViewEncapsulation.Emulated,  // make sure it's not None

})
export class ProfileFormComponent {
  currentStep = 0;
  totalSteps = 4;

  companyFormGroup!: FormGroup;
  assuranceFormGroup!: FormGroup;
  billingFormGroup!: FormGroup;
  cgvFormGroup!: FormGroup;

  pdfCgv: File | null = null;
  logoFile: File | null = null;

  constructor(private _formBuilder: FormBuilder,private profileService: ProfileService ,private router:Router ) {}

  ngOnInit() {
    this.companyFormGroup = this._formBuilder.group({
      companyName: ['', Validators.required],
      formeJuridique: ['', Validators.required],
      capitalSocial: ['', [Validators.required, Validators.min(0)]],
      siret: ['', Validators.required],
      tva: ['', Validators.required],
      rcsOuRm: ['', Validators.required],
      adresse: ['', Validators.required],
      logo: ['']
    });

    this.assuranceFormGroup = this._formBuilder.group({
      nomAssurance: ['', Validators.required],
      montantMobilier: ['', [Validators.required, Validators.min(0)]],
      montantMaxParObjet: ['', [Validators.required, Validators.min(0)]],
      franchise: ['', [Validators.required, Validators.min(0)]]
    });

    this.billingFormGroup = this._formBuilder.group({
      pourcentageAcompte: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      bic: ['', Validators.required],
      iban: ['', Validators.required]
    });

    this.cgvFormGroup = this._formBuilder.group({
      pdfCgv: ['', Validators.required]
    });
  }

  get progressPercentage(): number {
    return ((this.currentStep + 1) / this.totalSteps) * 100;
  }

  goToStep(step: number) {
    this.currentStep = step;
  }

  handleLogoUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.type.startsWith('image/')) {
        this.logoFile = file;
        this.companyFormGroup.patchValue({ logo: file.name });
      } else {
        this.logoFile = null;
        this.companyFormGroup.patchValue({ logo: '' });
        alert('Veuillez sélectionner un fichier image valide.');
        input.value = '';
      }
    }
  }

  handleFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.type === 'application/pdf') {
        this.pdfCgv = file;
        this.cgvFormGroup.patchValue({ pdfCgv: file.name });
        this.cgvFormGroup.get('pdfCgv')?.setErrors(null);
      } else {
        this.pdfCgv = null;
        this.cgvFormGroup.patchValue({ pdfCgv: '' });
        this.cgvFormGroup.get('pdfCgv')?.setErrors({ required: true });
        alert('Veuillez sélectionner un fichier PDF valide.');
        input.value = '';
      }
    }
  }

  allFormsValid(): boolean {
    return (
      this.companyFormGroup.valid &&
      this.assuranceFormGroup.valid &&
      this.billingFormGroup.valid &&
      this.cgvFormGroup.valid &&
      this.pdfCgv !== null
    );
  }

submitForm() {
  if (this.allFormsValid()) {
    const formData = new FormData();

    // Append normal text fields (make sure to convert numbers to strings)
    formData.append('companyName', this.companyFormGroup.value.companyName); // added companyName
    formData.append('formeJuridique', this.companyFormGroup.value.formeJuridique);
    formData.append('capitalSocial', this.companyFormGroup.value.capitalSocial.toString());
    formData.append('siret', this.companyFormGroup.value.siret);
    formData.append('tva', this.companyFormGroup.value.tva);
    formData.append('rcsOuRm', this.companyFormGroup.value.rcsOuRm);
    formData.append('adresse', this.companyFormGroup.value.adresse);

    formData.append('nomAssurance', this.assuranceFormGroup.value.nomAssurance);
    formData.append('montantMobilier', this.assuranceFormGroup.value.montantMobilier.toString());
    formData.append('montantMaxParObjet', this.assuranceFormGroup.value.montantMaxParObjet.toString());
    formData.append('franchise', this.assuranceFormGroup.value.franchise.toString());

    formData.append('pourcentageAcompte', this.billingFormGroup.value.pourcentageAcompte.toString());
    formData.append('bic', this.billingFormGroup.value.bic);
    formData.append('iban', this.billingFormGroup.value.iban);

    // Append files
    if (this.pdfCgv) formData.append('pdfCgv', this.pdfCgv);
    if (this.logoFile) formData.append('logo', this.logoFile);

    this.profileService.submitProfile(formData).subscribe({
      next: (response) => {
        console.log('Form submitted successfully:', response);
        alert('Profile saved successfully!');
        this.router.navigate(['/profiles']);
      },
      error: (error) => {
        console.error('Error submitting form:', error);
        alert('Une erreur est survenue lors de la soumission du formulaire.');
      }
    });
  } else {
    alert('Veuillez remplir tous les champs obligatoires correctement.');
  }
}

}