import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  changeEmail: string = ''; // Replace with your logic for actual user data
  changePassword: string = '';
  confirmPassword: string = '';
  isChanging: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  cancelSettings() {
    this.isChanging = false;
    this.errorMessage = '';
    // Optionally clear/reset form fields here if needed
  }

  saveSettings() {
    // Add your validation logic if required
    if (this.changeEmail === '' || this.changePassword === '' || this.confirmPassword === '') {
      this.errorMessage = 'Please fill all fields.';
      return;
    }

    // Example: Simulate saving settings
    setTimeout(() => {
      this.successMessage = 'Settings saved successfully.';
      this.isChanging = false;
      this.errorMessage = '';
      // Optionally reset form fields after successful save
    }, 1000);
  }
}
