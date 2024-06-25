import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavbarService {
  private showNavbar: BehaviorSubject<boolean>;

  constructor() {
    this.showNavbar = new BehaviorSubject<boolean>(false);
  }

  hide() {
    this.showNavbar.next(false);
  }

  display() {
    this.showNavbar.next(true);
  }

  getNavbarState() {
    return this.showNavbar.asObservable();
  }

  getCurrentState(): boolean {
    return this.showNavbar.value;
  }
}
