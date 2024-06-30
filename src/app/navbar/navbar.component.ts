import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavbarService } from '../services/navbar-service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavBarComponent implements OnInit, OnDestroy {
  loggedinUser: string = '';
  showNavbar: boolean = false;
  subscription: Subscription;
  isChanging: any;

  constructor(private navbarService: NavbarService, private router: Router) {
    this.subscription = this.navbarService.getNavbarState().subscribe((value: boolean) => {
      this.showNavbar = value;
    });
  }

  ngOnInit() {
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');

    if (userId && userName) {
      this.loggedinUser = userName;
      this.navbarService.display();
    } else {
      this.navbarService.hide();
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  logout(): void {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('profilePictureUrl'); // Clear any profile picture URL stored

    // Optionally, clear any other local state or perform additional logout tasks
    // Redirect to login page or home page as necessary
    this.router.navigate(['/login']);
  }
}
