import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
providedIn: 'root'
})
export class AuthService {
private apiUrl = environment.apiBaseUrl;
private currentUser: any;

constructor(private http: HttpClient) {}

login(userName: string, userPassword: string): Observable<any> {
return this.http.post<any>('${this.apiUrl}/RegisterDetails/login', { userName, userPassword });
}

getCurrentUserId(): number {
  return this.currentUser?.id; // Adjust according to your user data structure
}

isLoggedIn(): boolean {
  return !!this.currentUser; // Example: Check if a user is logged in
}

loggedin(user: any): void {
  // Example: Implement login logic to set currentUser upon successful login
  this.currentUser = user;
}

logout(): void {
  // Example: Implement logout logic to clear currentUser upon logout
  this.currentUser = null;
}
}
