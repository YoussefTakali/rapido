import { Component } from "@angular/core"
import { Router } from "@angular/router"
import { AuthService, RegisterDto } from "src/app/services/auth.service"

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.css"],
})
export class RegisterComponent {
    constructor(private router : Router,private authService:AuthService) {}
  firstName = ""
  lastName = ""
  email = ""
  password = ""
  confirmPassword = ""
  acceptTerms = false
  errorMessage = ""
  successMessage = ""
  isLoading = false
  showPassword = false
  showConfirmPassword = false

onSubmit() {
  this.isLoading = true;
  this.errorMessage = "";
  this.successMessage = "";

  // Basic validation
  if (this.password !== this.confirmPassword) {
    this.errorMessage = "Passwords do not match. Please try again.";
    this.isLoading = false;
    return;
  }



  const name = `${this.firstName} ${this.lastName}`.trim();

  const registerDto: RegisterDto = {
    name,
    email: this.email,
    password: this.password,
  };

  this.authService.register(registerDto).subscribe({
    next: (res) => {
      this.successMessage = "Account created successfully! Please check your email to verify your account.";
      this.isLoading = false;
      this.resetForm();
    },
    error: (err) => {
      console.error(err);
      this.errorMessage =
        err.error?.message || "Registration failed. Please try again later.";
      this.isLoading = false;
    }
  });
}


  togglePasswordVisibility() {
    this.showPassword = !this.showPassword
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword
  }

  onSignIn() {
    this.router.navigate(["/login"]) // Navigate to the login page
  }

  onTermsClick() {
    console.log("Terms and conditions clicked")
  }

  onPrivacyClick() {
    console.log("Privacy policy clicked")
  }

  resetForm() {
    this.firstName = ""
    this.lastName = ""
    this.email = ""
    this.password = ""
    this.confirmPassword = ""
    this.acceptTerms = false
  }

  getPasswordStrength(): string {
    if (!this.password) return ""

    let strength = 0
    if (this.password.length >= 8) strength++
    if (/[A-Z]/.test(this.password)) strength++
    if (/[a-z]/.test(this.password)) strength++
    if (/[0-9]/.test(this.password)) strength++
    if (/[^A-Za-z0-9]/.test(this.password)) strength++

    if (strength <= 2) return "weak"
    if (strength <= 3) return "medium"
    return "strong"
  }

  getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength()
    switch (strength) {
      case "weak":
        return "Weak"
      case "medium":
        return "Medium"
      case "strong":
        return "Strong"
      default:
        return ""
    }
  }
}
