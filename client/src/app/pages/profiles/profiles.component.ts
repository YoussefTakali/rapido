import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileDetails } from 'src/app/models/Profile';
import { ProfileService } from 'src/app/services/profile.service';

interface ProfileSummary {
  id: number;
  logo?: string; // Optional logo URL
  companyName: string;
  adresse: string;
  nomAssurance?: string;
  userCount: number;
  deviseCount: number;
  devisesByStatus: { [key: string]: number };
}

@Component({
  selector: 'app-profile-dashboard',
  templateUrl: './profiles.component.html',
  styleUrls: ['./profiles.component.css'],
    encapsulation: ViewEncapsulation.Emulated,  // make sure it's not None

})
export class ProfileDashboardComponent implements OnInit {
  profiles: ProfileDetails[] = [];
  profileSummaries: ProfileSummary[] = [];
  loading = true;
  error: string | null = null;

  constructor(private profileService: ProfileService,private router: Router) {}

  ngOnInit(): void {
    this.loadProfiles();
  }

  loadProfiles(): void {
    this.loading = true;
    this.profileService.getAllProfilesDetails().subscribe({
      next: (profiles) => {
        this.profiles = profiles;
        this.createProfileSummaries();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load profiles: ' + error.message;
        this.loading = false;
        console.error('Error loading profiles:', error);
      }
    });
  }

  createProfileSummaries(): void {
    this.profileSummaries = this.profiles.map(profile => {
      // Count devises by status
      const devisesByStatus: { [key: string]: number } = {};
      profile.devises.forEach(devise => {
        devisesByStatus[devise.etat] = (devisesByStatus[devise.etat] || 0) + 1;
      });

      return {
        id: profile.id,
        logo: profile.logo,
        companyName: profile.companyName,
        adresse: profile.adresse,
        nomAssurance: profile.nomAssurance,
        userCount: profile.userProfiles.length,
        deviseCount: profile.devises.length,
        devisesByStatus
      };
    });
  }

  getStatusBadgeClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'GAGNE': 'badge-success',
      'PERDU': 'badge-danger',
      'EN_COURS': 'badge-warning',
      'ENVOYEE': 'badge-info',
      'BROUILLON': 'badge-secondary',
      'ARCHIVE': 'badge-dark'
    };
    return statusClasses[status] || 'badge-light';
  }

  getTotalUsers(): number {
    return this.profileSummaries.reduce((total, profile) => total + profile.userCount, 0);
  }

  getTotalDevises(): number {
    return this.profileSummaries.reduce((total, profile) => total + profile.deviseCount, 0);
  }
  addProfile(): void {
    console.log('Add profile clicked');
    // TODO: Implement add profile functionality
    // This could open a modal, navigate to a form, etc.
    this.router.navigate(['/profiles/add']);
  }

  goToProfile(profileId: number) {
    this.router.navigate(['/profiles', profileId]);
  }

deleteProfile(profileId: number): void {
  if (confirm('Are you sure you want to delete this profile? This action cannot be undone.')) {
    this.profileService.deleteProfile(profileId).subscribe({
      next: () => {
        alert('Profile deleted successfully!');
        this.loadProfiles(); // Make sure you have a method to reload the profiles list
      },
      error: (error) => {
        console.error('Error deleting profile:', error);
        alert('An error occurred while deleting the profile.');
      }
    });
  }
}

}