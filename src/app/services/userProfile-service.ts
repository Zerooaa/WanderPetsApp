import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private profilePictureUrlSubject = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient) {}

  getProfilePictureUrl(): Observable<string | null> {
    return this.profilePictureUrlSubject.asObservable();
  }

  setProfilePictureUrl(url: string) {
    this.profilePictureUrlSubject.next(url);
  }

  loadProfilePictureUrl(userId: number): Observable<string> {
    // Fetch profile picture URL from the server or local storage
    const storedProfilePictureUrl = localStorage.getItem(`profilePictureUrl_${userId}`);
    if (storedProfilePictureUrl) {
      this.profilePictureUrlSubject.next(storedProfilePictureUrl);
      return of(storedProfilePictureUrl);
    } else {
      return this.http.get<{ profilePic: string }>(`/api/profile-picture/${userId}`).pipe(
        map(response => {
          const base64Image = `data:image/jpeg;base64,${response.profilePic}`;
          localStorage.setItem(`profilePictureUrl_${userId}`, base64Image);
          this.profilePictureUrlSubject.next(base64Image);
          return base64Image;
        }),
        catchError(error => {
          console.error('Failed to fetch profile picture', error);
          return of(''); // Return an empty string or a default URL on error
        })
      );
    }
  }
}
