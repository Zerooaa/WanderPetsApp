import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { RegisterDetails } from './register-details.model';
import { NgForm } from '@angular/forms';
import { Observable, catchError, throwError } from 'rxjs';
import { ProfileDetails } from './profile-details.model';
import { UpdateProfileDTO } from '../services/UpdateProfileDTO';

@Injectable({
  providedIn: 'root'
})
export class RegisterDetailsService {

  url: string = environment.apiBaseUrl + '/RegisterDetails';

  list: RegisterDetails[] = [];
  formData: RegisterDetails = new RegisterDetails();
  constructor(private http: HttpClient) { }

  getRegisterDetails(userId: number): Observable<RegisterDetails> {
    return this.http.get<RegisterDetails>(`${this.url}/${userId}`);
  }

  refreshList() {
    this.http.get(this.url)
    .subscribe({
      next: res => {
        this.list = res as RegisterDetails[]
      },
      error: err => { console.log(err); }
    });
    }

  postRegisterDetails() {
    return this.http.post(this.url, this.formData);
  }
  resetForm(form: NgForm) {
    form.form.reset();
    this.formData = new RegisterDetails();
  }

  updateRegisterDetails(updatedProfileData: UpdateProfileDTO): Observable<any> {
    return this.http.put(`${this.url}/update-profile/${updatedProfileData.userId}`, updatedProfileData);
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
