// post.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MessagesDetails } from '../share/messages-details.model';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = 'https://localhost:7123/api/PostMessages';

  constructor(private http: HttpClient) {}

  fetchUserPosts(userId: string): Observable<MessagesDetails[]> {
    return this.http.get<MessagesDetails[]>(`${this.apiUrl}/user/${userId}`).pipe(
      map(posts => posts.map(post => ({
        ...post,
        postedDate: new Date(post.postedDate) // Convert postedDate to Date object
      })))
    );
  }
}
