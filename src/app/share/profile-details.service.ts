import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProfileDetails } from './profile-details.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileDetailsService {

  private apiUrl = `${environment.apiBaseUrl}/profile`; // Ensure this is your API endpoint

  constructor(private http: HttpClient) { }

  getProfileDetails(userId: number): Observable<ProfileDetails> {
    return this.http.get<ProfileDetails>(`${this.apiUrl}/details/${userId}`)
      .pipe(catchError(this.handleError));
  }

  updateProfileDetails(profileData: ProfileDetails): Observable<any> {
    return this.http.put(`${this.apiUrl}/update`, profileData)
      .pipe(catchError(this.handleError));
  }

  uploadImage(formData: FormData): Observable<{ profilePic: string }> {
    return this.http.post<{ profilePic: string }>(`${this.apiUrl}/upload-image`, formData)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error.error);
    return throwError('Something bad happened; please try again later.');
  }
}
