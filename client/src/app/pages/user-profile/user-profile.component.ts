import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserProfile } from 'src/app/models/User';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
    encapsulation: ViewEncapsulation.Emulated,  // make sure it's not None

})
export class UserProfileComponent implements OnInit {
  apiBaseUrl = environment.apiBaseUrl
  userId!: string;
  user!:UserProfile;
  isLoading = true
  errorMessage = '';
  showImage = false;
  isEditing = false;
  showDeleteConfirm = false;
  imageError = false;
  constructor(private route: ActivatedRoute,private userService : UserService,private router : Router) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id')!;
    this.fetchUser();
    this.test();
  }
  normalizeUserData(user: UserProfile): UserProfile {
  return {
    ...user,
    isOnline: user.isOnline ?? false,
    lastSeen: user.lastSeen ? new Date(user.lastSeen) : new Date(),  // fallback
    bio: user.bio ?? '',
    department: user.department ?? '',
    location: user.location ?? '',
    skills: user.skills ?? [],
    socialLinks: user.socialLinks ?? { linkedin: '', twitter: '', github: '' }
  };
}
fetchUser() { 
  this.isLoading = true;
  this.userService.getUserById(this.userId).subscribe({
    next: (data) => {
      console.log('User data received:', data); // DEBUG
      this.user = this.normalizeUserData(data);
      this.isLoading = false;
    },
    error: (error) => {
      console.error('API error:', error);  // DEBUG
      this.errorMessage = 'Failed to load user data.';
      this.isLoading = false;
    }
  });
}
test(){
  console.log(this.user)
}
  
  onImageError() {
    this.imageError = true
  }

  onImageLoad() {
    this.imageError = false
  }

  getInitials(name: string): string {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  getRoleBadgeClass(role: string): string {
    switch (role?.toLowerCase()) {
      case "admin":
        return "role-admin"
      case "moderator":
        return "role-moderator"
      default:
        return "role-user"
    }
  }

  onEditUser(user: UserProfile, event: Event) {
    event.stopPropagation()
    this.isEditing = true
    console.log("Edit user:", user)
  }

  onDeleteUser(user: UserProfile, event: Event) {
    event.stopPropagation()
    this.showDeleteConfirm = true
  }

  confirmDelete() {
    console.log("Delete confirmed for user:", this.user)
    this.showDeleteConfirm = false
    // Navigate back after deletion
    this.router.navigate(["/users"])
  }

  cancelDelete() {
    this.showDeleteConfirm = false
  }

  onMessageUser() {
    console.log("Message user:", this.user)
  }

  onCallUser() {
    if (this.user?.phoneNumber) {
      window.open(`tel:${this.user.phoneNumber}`)
    }
  }

  onEmailUser() {
    if (this.user?.email) {
      window.open(`mailto:${this.user.email}`)
    }
  }

  onSocialLink(platform: string) {
    const links = this.user?.socialLinks
    if (links) {
      const url = links[platform as keyof typeof links]
      if (url) {
        window.open(url, "_blank")
      }
    }
  }

  getLastSeenText(lastSeen: Date): string {
    const now = new Date()
    const diffMs = now.getTime() - lastSeen.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) return "Just now"
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return "Yesterday"
    return `${diffDays} days ago`
  }

  getAge(dateOfBirth: Date): number {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    return age
  }
  
}

