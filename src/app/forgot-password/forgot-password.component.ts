import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {

  forgotpasswordEmail: string = '';
  emailValid: boolean = true; // Flag to track email validation status

  constructor(private router: Router) { }

  onCloseButtonClick(): void {
    this.router.navigate(['/loginPage']);
  }

  emailValidation(event: string) {
    const value = event.trim(); // Trim whitespace from input
    const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;

    // Perform validation
    if (value) {
      this.emailValid = emailPattern.test(value); // Validate email format
    } else {
      this.emailValid = false; // Empty input is invalid
    }

    this.forgotpasswordEmail = value; // Update bound variable with trimmed value
  }
}
