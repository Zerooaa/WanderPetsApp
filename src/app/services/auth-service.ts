import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
providedIn: 'root'
})
export class AuthService {
private apiUrl = environment.apiBaseUrl;

constructor(private http: HttpClient) {}

login(userName: string, userPassword: string): Observable<any> {
return this.http.post<any>('${this.apiUrl}/RegisterDetails/login', { userName, userPassword });
}
}