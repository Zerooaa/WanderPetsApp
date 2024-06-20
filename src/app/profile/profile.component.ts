import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ElementRef, ViewChild } from '@angular/core';

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

  @ViewChild('fileInput') fileInput!: ElementRef;

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('profilePicture', file);

      this.http.post('/api/profile-picture', formData).subscribe((response: any) => {
        this.profilePictureUrl = response.profilePictureUrl;
      }, error => {
        console.error('Error uploading profile picture', error);
      });
    }
  }

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
}
