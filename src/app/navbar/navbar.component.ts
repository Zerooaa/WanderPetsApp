import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavbarService } from '../services/navbar-service';
import { Subscription } from 'rxjs';

declare var $: any;  // Declare jQuery

@Component({
  selector: 'app-nav-bar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavBarComponent implements OnInit, OnDestroy {
  loggedinUser: string = ''; // Replace with actual user data if available
  showNavbar: boolean = false;
  subscription: Subscription;

  constructor(private navbarService: NavbarService) {
    this.subscription = this.navbarService.getNavbarState().subscribe((value: boolean) => {
      this.showNavbar = value;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit() {
    this.showNavbar = false;
  }

  onLogout() {
    this.loggedinUser = '';
    this.navbarService.hide();
  }

  openSettingsModal() {
    $('#settingsModal').modal('show');
  }
}
