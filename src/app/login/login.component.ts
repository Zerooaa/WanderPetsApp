import { Component, OnDestroy, OnInit } from '@angular/core';
import { RegisterDetailsService } from '../share/register-details.service';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { NavbarService } from '../services/navbar-service';
import { UserSessionService } from '../services/userSession-service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginObj: Login;

  constructor(
    public service: RegisterDetailsService,
    private toastr: ToastrService,
    private http: HttpClient,
    private router: Router,
    private navbarService: NavbarService,
    private userSessionService: UserSessionService
  ) {
    this.loginObj = new Login();
  }

  ngOnInit(): void {
    this.navbarService.hide();
  }

  ngOnDestroy(): void {}

  onSubmit() {
    // Validate input before making HTTP request
    if (!this.loginObj.userName || !this.loginObj.userPassword) {
      this.toastr.error('Please enter both username and password.', 'Login');
      return;
    }

    this.http.post<any>('https://localhost:7123/api/RegisterDetails/login', this.loginObj).subscribe(
      (res) => {
        if (res.user) {
          this.toastr.success('Login Successful', 'Login');
          this.navbarService.display();
          const { userId, userName, profilePictureUrl } = res.user;

          // Set session only if userId and userName are available
          if (userId && userName) {
            this.userSessionService.setUserSession(userId, userName, profilePictureUrl);
            this.router.navigate(['/homePage']);
          } else {
            console.error('UserId or UserName is missing in the response:', res.user);
            this.toastr.error('Invalid server response. Please try again later.', 'Login');
          }
        } else {
          this.toastr.error('Login Failed', 'Login');
          console.log('Login failed response:', res);
        }
      },
      (error) => {
        this.toastr.error('Incorrect Username/Password', 'Login');
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
