import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { RegisterDetails } from './register-details.model';
import { NgForm } from '@angular/forms';
import { Observable } from 'rxjs';
import { MessagesDetails } from './messages-details.model';

@Injectable({
  providedIn: 'root'
})
export class MessagesDetailsService{
  formMessage: MessagesDetails = new MessagesDetails();
  url: string = environment.apiBaseUrl + '/MessagesDetails';
  list: RegisterDetails[] = [];
  constructor(private http: HttpClient) { }

  postRegisterDetails() {
    return this.http.post(this.url, this.formMessage);
  }
  resetForm(form: NgForm) {
    form.form.reset();
    this.formMessage = new MessagesDetails();
  }
}

