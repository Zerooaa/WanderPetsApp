import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { RegisterDetails } from './register-details.model';
import { NgForm } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class RegisterDetailsService {

  url: string = environment.apiBaseUrl + '/RegisterDetails';
  list: RegisterDetails[] = [];
  formData: RegisterDetails = new RegisterDetails();
  constructor(private http: HttpClient) { }

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
}
