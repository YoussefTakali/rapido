import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service'; // adjust path as needed
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.errorMessage = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (tokens) => {
        // Save tokens to AuthService
        this.authService.setAccessToken(tokens.access_token);
        if (tokens.refresh_token) {
          this.authService.setRefreshToken(tokens.refresh_token);
        }
        // Redirect after login
        this.router.navigate(['/']); // or your desired route
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Login failed';
      },
    });
  }
}
