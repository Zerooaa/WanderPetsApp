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
    const userID = localStorage.getItem('userID');
    const userName = localStorage.getItem('userName');

    if (userID && userName) {
      this.loggedinUser = userName;
      this.navbarService.display();
    } else {
      this.navbarService.hide();
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onLogout() {
    const userIdString = localStorage.getItem('userId');
    if (userIdString) {
      const profilePictureUrl = localStorage.getItem(`profilePictureUrl_${userIdString}`);
      localStorage.clear();
      if (profilePictureUrl) {
        localStorage.setItem(`profilePictureUrl_${userIdString}`, profilePictureUrl);
      }
    } else {
      localStorage.clear();
    }
    this.router.navigate(['/login']);
  }
}
