import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms'; // Import Validators for form validation

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  changeEmail: FormControl = new FormControl('', [Validators.required, Validators.email]); // Use FormControl for validation
  changePassword: FormControl = new FormControl('', [Validators.required, Validators.minLength(8)]); // Example: minimum length of 8 characters
  confirmPassword: FormControl = new FormControl('', [Validators.required, Validators.minLength(8)]); // Example: minimum length of 8 characters
  isChanging: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  cancelSettings() {
    this.isChanging = false;
    this.errorMessage = ''; // Clear error message
    this.changeEmail.reset(); // Reset form controls
    this.changePassword.reset();
  }

  saveSettings() {
    if (this.changeEmail.invalid || this.changePassword.invalid) {
      this.errorMessage = 'Please provide valid email and password.';
      return;
    }

    // Example: Simulate saving settings
    setTimeout(() => {
      this.successMessage = 'Settings saved successfully.';
      this.isChanging = false;
      this.errorMessage = ''; // Clear error message
    }, 1000);
  }
}
