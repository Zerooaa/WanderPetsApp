import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  loggedinUser: string = '';
  loggedinUserName: string = '';
  loggedinUserRole: string = '';
  loggedinUserAddress: string = '';
  loggedinUserEmail: string = '';
  loggedinUserContactNo: string = '';
  loggedinUserQuote: string = '';
  profilePictureUrl: string | undefined;

  originalProfileData: any = {};
  isEditing: boolean = false;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    // Fetch initial profile data
    this.fetchProfile();
  }

  fetchProfile() {
    this.http.get('/api/profile').subscribe((data: any) => {
      this.loggedinUser = data.loggedinUser;
      this.loggedinUserName = data.loggedinUserName;
      this.loggedinUserRole = data.loggedinUserRole;
      this.loggedinUserAddress = data.loggedinUserAddress;
      this.loggedinUserEmail = data.loggedinUserEmail;
      this.loggedinUserContactNo = data.loggedinUserContactNo;
      this.loggedinUserQuote = data.loggedinUserQuote;
      this.profilePictureUrl = data.profilePictureUrl;

      this.storeOriginalProfileData();
    });
  }

  storeOriginalProfileData() {
    this.originalProfileData = {
      loggedinUser: this.loggedinUser,
      loggedinUserName: this.loggedinUserName,
      loggedinUserRole: this.loggedinUserRole,
      loggedinUserAddress: this.loggedinUserAddress,
      loggedinUserEmail: this.loggedinUserEmail,
      loggedinUserContactNo: this.loggedinUserContactNo,
      loggedinUserQuote: this.loggedinUserQuote,
      profilePictureUrl: this.profilePictureUrl
    };
  }

  editProfile() {
    this.isEditing = true;
  }

  saveProfile() {
    const profileData = {
      loggedinUser: this.loggedinUser,
      loggedinUserName: this.loggedinUserName,
      loggedinUserRole: this.loggedinUserRole,
      loggedinUserAddress: this.loggedinUserAddress,
      loggedinUserEmail: this.loggedinUserEmail,
      loggedinUserContactNo: this.loggedinUserContactNo,
      loggedinUserQuote: this.loggedinUserQuote,
      profilePictureUrl: this.profilePictureUrl
    };

    this.http.post('/api/profile', profileData).subscribe(response => {
      console.log('Profile saved', response);
      this.storeOriginalProfileData();
      this.isEditing = false;
    }, error => {
      console.error('Error saving profile', error);
    });
  }

  cancelEdit() {
    this.isEditing = false;
    this.resetProfileData();
  }

  resetProfileData() {
    this.loggedinUser = this.originalProfileData.loggedinUser;
    this.loggedinUserName = this.originalProfileData.loggedinUserName;
    this.loggedinUserRole = this.originalProfileData.loggedinUserRole;
    this.loggedinUserAddress = this.originalProfileData.loggedinUserAddress;
    this.loggedinUserEmail = this.originalProfileData.loggedinUserEmail;
    this.loggedinUserContactNo = this.originalProfileData.loggedinUserContactNo;
    this.loggedinUserQuote = this.originalProfileData.loggedinUserQuote;
    this.profilePictureUrl = this.originalProfileData.profilePictureUrl;
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.profilePictureUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
}
