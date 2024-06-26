import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProfileDetails } from './profile-details.model';
import { RegisterDetails } from './register-details.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileDetailsService {
  private profilePicturesUrl: string = `${environment.apiBaseUrl}/ProfilePictures`; // Updated URL
  private url: string = `${environment.apiBaseUrl}/ProfilePictures`;
  private baseUrl: string = `${environment.apiBaseUrl}/RegisterDetails`;

  constructor(private http: HttpClient) {}

  uploadImage(file: File, profileID: number): Observable<{ profilePic: string }> {
    const formData = new FormData();
    formData.append('ProfilePicture', file);
    formData.append('ProfileID', profileID.toString()); // Ensure ProfileID is sent as part of the form data

    return this.http.post<{ profilePic: string }>(`${this.profilePicturesUrl}/upload`, formData).pipe(
      catchError(this.handleError)
    );
  }

  getProfilePicture(userID: number): Observable<{ profilePic: string }> {
    return this.http.get<{ profilePic: string }>(`${this.url}/${userID}`).pipe(
      catchError(this.handleError)
    );
  }

  getRegisterDetails(userId: number): Observable<RegisterDetails> {
    return this.http.get<RegisterDetails>(`${this.baseUrl}/${userId}`).pipe(
      catchError(this.handleError)
    );
  }


  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(`Backend returned code ${error.status}, body was: ${error.error}`);
    }
    return throwError('Something went wrong; please try again later.');
  }
}
