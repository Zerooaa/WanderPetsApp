import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const userID = localStorage.getItem('userID');
    if (userID) {
      return true;
    } else {
      this.router.navigate(['/loginPage']);
      return false;
    }
  }
}
