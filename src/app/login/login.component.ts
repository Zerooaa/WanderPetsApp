import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RegisterDetailsService } from '../share/register-details.service';
import { NgForm } from '@angular/forms';
import { AuthService } from '../services/auth-service';
import { RegisterDetails } from '../share/register-details.model';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { Router, Routes } from '@angular/router';
import { NavbarService } from '../services/navbar-service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit, OnDestroy {
  loginObj: Login;
  constructor(public service: RegisterDetailsService,
              private authService: AuthService,
              private toastr: ToastrService,
              private http: HttpClient,
              private router: Router,
              private navbarService: NavbarService) {
    this.loginObj = new Login();
  }
  ngOnDestroy(): void {
    this.navbarService.display();
  }

  ngOnInit(): void {
    this.navbarService.hide();
  }

  onSubmit(){
    this.http.post<any>('https://localhost:7123/api/RegisterDetails/login', this.loginObj).subscribe((res: any) => {
      if (res.user) {
        // If there's a 'user' property in the response, login is successful
        this.toastr.success('Login Successful', 'Login');
        this.router.navigate(['/homePage']);
        console.log(res);
      } else {
        // Otherwise, login failed
        this.toastr.error('Login Failed', 'Login');
        console.log(res);
      }
    }, (error) => {
      // Handle errors from the HTTP request itself
      this.toastr.error('An error occurred', 'Login');
      console.error(error);
    });
  }
}

export class Login{
  userName: string;
  userPassword: string;
  constructor(){
    this.userName = '';
    this.userPassword = '';
  }
}
