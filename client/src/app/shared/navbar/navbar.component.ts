import { Component, EventEmitter, Output, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/User';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
    encapsulation: ViewEncapsulation.Emulated,  // make sure it's not None

})
export class NavbarComponent {
  constructor(private authService: AuthService, private router: Router) {}

  user: User = JSON.parse(localStorage.getItem('user') || '{}');
imageUrl: string = this.user && this.user.profilePicture
  ? `${environment.apiBaseUrl}/uploads/profile-pictures/${this.user.profilePicture}`
  : 'assets/images/default-profile.png';  isSidebarVisible = false;

  @Output() sidebarToggled = new EventEmitter<boolean>();

  onHamburgerClick(event: Event) {
    // Stop event propagation to prevent multiple triggers
    event.preventDefault();
    event.stopPropagation();
    
    // Toggle the state
    this.isSidebarVisible = !this.isSidebarVisible;
    
    console.log('NavbarComponent: Emitting toggle request', this.isSidebarVisible);
    this.sidebarToggled.emit(this.isSidebarVisible);
  }
  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.authService.removeTokens();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Logout failed', err);
        this.authService.removeTokens();
        this.router.navigate(['/login']);
      },
    });
  }
  editProfile(): void {

  }

}
  
