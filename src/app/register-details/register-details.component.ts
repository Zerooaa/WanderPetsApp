import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder, ValidationErrors, AbstractControl, NgForm} from '@angular/forms';
import { RegisterDetailsService } from '../share/register-details.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register-details',
  templateUrl: './register-details.component.html',
  styleUrls: ['./register-details.component.css']
})
export class RegisterDetailsComponent implements OnInit {

  constructor(
    public service: RegisterDetailsService,
    private toastr: ToastrService
  ) { }

  ngOnInit() {

  }
  onSubmit(form: NgForm) {
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
  }
}
