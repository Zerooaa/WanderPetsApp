import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { RegisterDetailsService } from '../share/register-details.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register-details',
  templateUrl: './register-details.component.html',
  styleUrls: ['./register-details.component.css']
})
export class RegisterDetailsComponent implements OnInit {

  confirmPasswordValue: string = '';

  constructor(
    public service: RegisterDetailsService,
    private toastr: ToastrService
  ) { }

  ngOnInit() { }

  onSubmit(form: NgForm) {
    if (this.service.formData.userName &&
        this.service.formData.fullName &&
        this.service.formData.userEmail &&
        this.service.formData.userPhone &&
        this.service.formData.userPassword &&
        this.confirmPasswordValue === this.service.formData.userPassword &&
        form.valid) {
        this.service.postRegisterDetails().subscribe({
        next: (response) => {
          console.log('Registration successful', response);
          this.toastr.success('Registration successful!', 'Register Form');
          this.service.resetForm(form);
          this.service.refreshList(); // Optionally refresh the list after successful registration
        },
        error: (error) => {
          console.error('Registration failed', error);
          this.toastr.error('Failed to register.', 'Register Form');
        }
      });
    } else {
      this.toastr.error('Please fill out the form correctly', 'Register Form');
    }
  }
}
