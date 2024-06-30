import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserSessionService {
  private userIdKey = 'userId';
  private userNameKey = 'userName';
  private profilePictureUrlKey = (userId: string) => `profilePictureUrl_${userId}`;

  setUserSession(userId: string, userName: string, profilePictureUrl?: string): void {
    localStorage.setItem(this.userIdKey, userId);
    localStorage.setItem(this.userNameKey, userName);
    if (profilePictureUrl) {
      localStorage.setItem(this.profilePictureUrlKey(userId), profilePictureUrl);
    }
  }

  getUserId(): string | null {
    return localStorage.getItem(this.userIdKey);
  }

  getUserName(): string | null {
    return localStorage.getItem(this.userNameKey);
  }

  getProfilePictureUrl(userId: string): string | null {
    return localStorage.getItem(this.profilePictureUrlKey(userId));
  }

  clearUserSession(): void {
    localStorage.removeItem(this.userIdKey);
    localStorage.removeItem(this.userNameKey);
    // Optionally clear profile picture URL
  }
}
