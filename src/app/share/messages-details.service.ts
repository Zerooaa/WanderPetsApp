import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { NgForm } from '@angular/forms';
import { Observable } from 'rxjs';
import { MessagesDetails } from './messages-details.model';

@Injectable({
  providedIn: 'root'
})
export class MessagesDetailsService {
  formMessage: MessagesDetails = new MessagesDetails();
  url: string = environment.apiBaseUrl + '/PostMessages';

  constructor(private http: HttpClient) { }

  postMessageDetails(messageDetails: MessagesDetails): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('postMessage', messageDetails.postMessage);
    formData.append('postTag', messageDetails.postTag);
    formData.append('postLocation', messageDetails.postLocation);
    formData.append('postFilter', messageDetails.postFilter);
    formData.append('userId', messageDetails.userId); // Add userId to form data
    messageDetails.images.forEach((file, index) => {
      formData.append('images', file, file.name);
    });

    return this.http.post(this.url, formData);
  }

  resetForm(form: NgForm) {
    form.form.reset();
    this.formMessage = new MessagesDetails();
  }
}
