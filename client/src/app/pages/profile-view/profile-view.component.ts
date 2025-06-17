// profile-view.component.ts - Fixed version

import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { UserProfile } from '../../models/User';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-profile-view', 
  templateUrl: './profile-view.component.html',
  styleUrls: ['./profile-view.component.css'],
  providers: [DatePipe]
})
export class ProfileViewComponent implements OnInit {
  user: UserProfile | null = null;
  editMode = false;
  profileForm: FormGroup;
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  isLoading = true;
  errorMessage: string | null = null;

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private datePipe: DatePipe
  ) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      dateOfBirth: [''],
      bio: [''],
      department: [''],
      location: [''],
      socialLinks: this.fb.group({
        twitter: [''],
        linkedin: [''],
        github: ['']
      })
    });
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    this.isLoading = true;
    this.errorMessage = null;
    
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.user = user;
        this.patchFormValues(user);
        this.previewUrl = this.getProfilePictureUrl(user.profilePicture);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load user data', err);
        this.errorMessage = 'Failed to load profile data. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  patchFormValues(user: UserProfile): void {
    this.profileForm.patchValue({
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber || '',
      dateOfBirth: user.dateOfBirth ? this.formatDateForInput(user.dateOfBirth) : '',
      bio: user.bio || '',
      department: user.department || '',
      location: user.location || '',
      socialLinks: {
        twitter: user.socialLinks?.twitter || '',
        linkedin: user.socialLinks?.linkedin || '',
        github: user.socialLinks?.github || ''
      }
    });
  }

  getProfilePictureUrl(filename?: string): string {
    if (!filename) {
      return '/assets/default-avatar.png'; // Fallback image
    }
    return `${environment.apiBaseUrl}/uploads/profile-pictures/${filename}`;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        this.errorMessage = 'Please select a valid image file (JPEG, PNG, GIF)';
        return;
      }

      if (file.size > maxSize) {
        this.errorMessage = 'File size must be less than 5MB';
        return;
      }

      this.selectedFile = file;
      this.errorMessage = null;
      
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
    if (!this.editMode) {
      this.selectedFile = null;
      if (this.user) {
        this.previewUrl = this.getProfilePictureUrl(this.user.profilePicture);
        // Reset form to original values
        this.patchFormValues(this.user);
      }
    }
  }

  onSubmit(): void {
    if (this.profileForm.valid && this.user) {
      const formData = this.prepareFormData();
      
      // Log the form data for debugging
      // console.log('Submitting form data:');
      // for (let pair of formData.entries()) {
      //   console.log(pair[0] + ': ' + pair[1]);
      // }
      
      this.userService.updateUserWithProfilePicture(this.user.id, formData).subscribe({
        next: (updatedUser) => {
          console.log('User updated successfully:', updatedUser);
          this.user = updatedUser;
          this.editMode = false;
          this.selectedFile = null;
          this.previewUrl = this.getProfilePictureUrl(updatedUser.profilePicture);
          this.errorMessage = null;
        },
        error: (err) => {
          console.error('Failed to update user', err);
          this.errorMessage = 'Failed to update profile. Please try again.';
        }
      });
    } else {
      console.log('Form is invalid:', this.profileForm.errors);
      this.markFormGroupTouched(this.profileForm);
    }
  }

 prepareFormData(): FormData {
  const formValue = this.profileForm.value;
  const formData = new FormData();

  // Append only the fields we want to update
  formData.append('name', formValue.name || '');
  formData.append('email', formValue.email || '');
  
  // Phone number (only if provided)
  if (formValue.phoneNumber) {
    formData.append('phoneNumber', formValue.phoneNumber);
  }

  // Handle date of birth properly
  if (formValue.dateOfBirth) {
    try {
      const date = new Date(formValue.dateOfBirth);
      if (!isNaN(date.getTime())) { // Check if valid date
        formData.append('dateOfBirth', date.toISOString());
      }
    } catch (e) {
      console.error('Invalid date format', e);
      // Optionally handle the error or skip the date update
    }
  }

  // Append the file if selected
  if (this.selectedFile) {
    formData.append('profilePicture', this.selectedFile, this.selectedFile.name);
  }

  return formData;
}

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'Not specified';
    return this.datePipe.transform(dateString, 'mediumDate') || 'Invalid date';
  }

  formatDateTime(date: Date | string | undefined): string {
    if (!date) return 'Never';
    
    const dateString = typeof date === 'string' ? date : date.toISOString();
    return this.datePipe.transform(dateString, 'medium') || 'Invalid date';
  }

  formatDateForInput(dateString?: string): string {
    if (!dateString) return '';
    // Handle both ISO string and date object
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  getSocialLink(platform: string): string | undefined {
    return this.user?.socialLinks?.[platform];
  }

  hasSocialLinks(): boolean {
    if (!this.user?.socialLinks) return false;
    return !!(this.user.socialLinks.twitter || this.user.socialLinks.linkedin || this.user.socialLinks.github);
  }
}