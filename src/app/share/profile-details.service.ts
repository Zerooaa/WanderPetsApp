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
  private url: string = environment.apiBaseUrl + '/ProfilePictures';
  private baseUrl: string = environment.apiBaseUrl;
  constructor(private http: HttpClient) {}

  uploadImage(details: { ProfilePicture: File }): Observable<any> {
    const formData = new FormData();
    formData.append('ProfilePicture', details.ProfilePicture);
    return this.http.post(`${this.url}/upload`, formData).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(
        `Backend returned code ${error.status}, body was: ${error.error}`
      );
    }
    return throwError('Something bad happened; please try again later.');
  }

  getProfileDetails(userID: number): Observable<ProfileDetails> {
    return this.http.get<ProfileDetails>(`${this.baseUrl}/RegisterDetails/${userID}`);
  }

}
