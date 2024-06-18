import { Component, OnDestroy, OnInit } from '@angular/core';
import { RegisterDetailsService } from '../share/register-details.service';
import { NavbarService } from '../services/navbar-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavBarComponent implements OnInit, OnDestroy {
  loggedinUser: string = ''; // Replace with actual user data if available
  showNavbar!: boolean;
  subscription: Subscription;
  constructor(private registerService: RegisterDetailsService, private navbarService : NavbarService) {
    this.subscription = this.navbarService.showNavbar.subscribe((value => {
      this.showNavbar = value;
    }));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit(){
  }

  loggedIn() {
    return this.loggedinUser !== '';
  }

  onLogout() {
    this.loggedinUser = '';
  }
}
