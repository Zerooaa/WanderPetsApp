export class ProfileDetails {
  pictureID?: number;
  ProfilePic?: File;
  profilePictureUrl: any;
  userId: any;
  userName: string = '';
  fullName: string = '';
  userEmail: string = '';
  userPhone: number = 0; // Optional, use 0 or undefined based on your need
  userPassword: string = '';
  subscribe: any;

  constructor(init?: Partial<ProfileDetails>) {
    Object.assign(this, init);
  }
}
