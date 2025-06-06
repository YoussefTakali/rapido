import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service'; // adjust path as needed
import { Router } from '@angular/router';

@Component({

  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  showPassword = false; // for toggling password visibility
    isLoading = false

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.isLoading = true

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
    this.isLoading = false
  }
    togglePasswordVisibility() {
    this.showPassword = !this.showPassword
  }

  onForgotPassword() {
    console.log("Forgot password clicked")
  }

  onSignUp() {
    this.router.navigate(['/register']); // Navigate to the registration page
  }

}