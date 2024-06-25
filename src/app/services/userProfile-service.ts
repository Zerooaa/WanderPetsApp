import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

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

  loadProfilePictureUrl(userId: number) {
    // Fetch profile picture URL from the server or local storage
    const storedProfilePictureUrl = localStorage.getItem(`profilePictureUrl_${userId}`);
    if (storedProfilePictureUrl) {
      this.profilePictureUrlSubject.next(storedProfilePictureUrl);
    } else {
      this.http.get<{ profilePic: string }>(`/api/profile-picture/${userId}`).subscribe(
        (response) => {
          const base64Image = `data:image/jpeg;base64,${response.profilePic}`;
          localStorage.setItem(`profilePictureUrl_${userId}`, base64Image);
          this.profilePictureUrlSubject.next(base64Image);
        },
        (error) => console.error('Failed to fetch profile picture', error)
      );
    }
  }
}
