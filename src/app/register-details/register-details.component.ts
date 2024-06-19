import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder, ValidationErrors, AbstractControl } from '@angular/forms';
import { RegisterDetailsService } from '../share/register-details.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register-details',
  templateUrl: './register-details.component.html',
  styleUrls: ['./register-details.component.css']
})
export class RegisterDetailsComponent implements OnInit {

  registerForm!: FormGroup;
  userSubmitted = false;

  constructor(
    private fb: FormBuilder, 
    public service: RegisterDetailsService, 
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.registerForm = this.fb.group({
      userName: ['', Validators.required],
      fullName: ['', Validators.required],
      userEmail: ['', [Validators.required, Validators.email]],
      userPhone: ['', [Validators.required, Validators.pattern('^[0-9]{11}$')]],
      userPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    this.service.refreshList();
  }

  passwordMatchValidator(fg: AbstractControl): ValidationErrors | null {
    const userPassword = fg.get('userPassword');
    const confirmPassword = fg.get('confirmPassword');
    return userPassword && confirmPassword && userPassword.value === confirmPassword.value ? null : { notmatched: true };
  }

  get userName() {
    return this.registerForm.get('userName') as FormControl;
  }

  get fullName() {
    return this.registerForm.get('fullName') as FormControl;
  }

  get userEmail() {
    return this.registerForm.get('userEmail') as FormControl;
  }

  get userPhone() {
    return this.registerForm.get('userPhone') as FormControl;
  }

  get userPassword() {
    return this.registerForm.get('userPassword') as FormControl;
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword') as FormControl;
  }

  onSubmit() {
    this.userSubmitted = true;
    if (this.registerForm.valid) {
      this.service.postRegisterDetails().subscribe({
        next: res => {
          console.log(res);
          this.service.list = res as any[];
          this.registerForm.reset();
          this.userSubmitted = false;
          this.toastr.success('Submitted successfully', 'Register Details');
        },
        error: err => { console.log(err); }
      });
    } else {
      this.toastr.error('Please Provide the Required Fields');
    }
  }
}
