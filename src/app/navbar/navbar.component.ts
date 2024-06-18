import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavBarComponent implements OnInit {
  loggedinUser: string = ''; // Replace with actual user data if available

  constructor() { }

  ngOnInit(): void {
  }

  loggedIn() {
    return this.loggedinUser !== '';
  }

  onLogout() {
    this.loggedinUser = '';
  }
}
