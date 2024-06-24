export class ProfileDetails {
  pictureID?: number;
  ProfilePic?: File;
  profilePictureUrl: any;
  userId: any;
  userName?: string;
  fullName?: string;
  userEmail?: string;
  userPhone?: number | null; // Make userPhone nullable

  constructor() {
    // Initialize optional properties to avoid null errors
    this.userName = '';
    this.fullName = '';
    this.userEmail = '';
    this.userPhone = null; // or undefined, based on your preference
  }
}
