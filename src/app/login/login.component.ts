import { Component, OnDestroy, OnInit } from '@angular/core';
import { RegisterDetailsService } from '../share/register-details.service';
import { AuthService } from '../services/auth-service';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { NavbarService } from '../services/navbar-service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginObj: Login;

  constructor(
    public service: RegisterDetailsService,
    private authService: AuthService,
    private toastr: ToastrService,
    private http: HttpClient,
    private router: Router,
    private navbarService: NavbarService
  ) {
    this.loginObj = new Login();
  }

  ngOnInit(): void {
    this.navbarService.hide();
  }

  ngOnDestroy(): void {}

  onSubmit() {
    this.http.post<any>('https://localhost:7123/api/RegisterDetails/login', this.loginObj).subscribe(
      (res) => {
        if (res.user) {
          this.toastr.success('Login Successful', 'Login');
          this.navbarService.display();
          if (res.user.userId && res.user.userName) {
            localStorage.setItem('userId', res.user.userId.toString());
            localStorage.setItem('userName', res.user.userName);
            if (res.user.profilePictureUrl) {
              localStorage.setItem(`profilePictureUrl_${res.user.userId}`, res.user.profilePictureUrl);
            }
            this.router.navigate(['/homePage']);
          } else {
            console.error('UserId or UserName is missing in the response:', res.user);
          }
        } else {
          this.toastr.error('Login Failed', 'Login');
          console.log('Login failed response:', res);
        }
      },
      (error) => {
        this.toastr.error('An error occurred', 'Login');
        console.error('HTTP request error:', error);
      }
    );
  }
}

export class Login {
  userName: string;
  userPassword: string;

  constructor() {
    this.userName = '';
    this.userPassword = '';
  }
}
