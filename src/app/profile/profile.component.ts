import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ProfileDetails } from '../share/profile-details.model';
import { ProfileDetailsService } from '../share/profile-details.service';
import { RegisterDetailsService } from '../share/register-details.service'; // Import RegisterDetailsService
import { ToastrService } from 'ngx-toastr';
import { RegisterDetails } from '../share/register-details.model';

import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileData: ProfileDetails = new ProfileDetails();
  defaultProfilePictureUrl: string = 'https://github.com/Zerooaa/WanderPetsApp/blob/master/public/pets.png?raw=true';

  isEditing: boolean = false;
  isPicturePopupVisible: boolean = false;
  newProfilePictureUrl: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  currentProfilePictureUrl: string = ''; // Added property to store current profile picture URL
  petListings: any;

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(private http: HttpClient,
              private registerDetailsService: RegisterDetailsService,
              private toastr: ToastrService,
              private profileDetailsService: ProfileDetailsService) {}

  ngOnInit() {
    this.fetchProfileData();
    this.petListings();
  }

  fetchProfileData() {
    const userIDString = localStorage.getItem('userID');
    if (!userIDString) {
      console.error('User ID not found in local storage');
      return;
    }

    const userID = parseInt(userIDString, 10); // Using radix 10
    if (isNaN(userID)) {
      console.error('Invalid user ID in local storage');
      return;
    }

    // Assuming you have a method in RegisterDetailsService to fetch user details by userID
    this.registerDetailsService.getRegisterDetails(userID).subscribe(
      (userData: any) => {
        // Use userData to populate profileData
        this.profileData.userName = userData.userName;
        this.profileData.fullName = userData.fullName;
        this.profileData.userEmail = userData.userEmail;
        this.profileData.userPhone = userData.userPhone;

        // Optionally, you can set other profileData properties if available in RegisterDetails
        // this.profileData.someOtherProperty = userData.someOtherProperty;

        // Now fetch profile details using userID
        this.profileDetailsService.getProfileDetails(userID).subscribe(
          (profileData: ProfileDetails) => {
            this.profileData = profileData;
            console.log('Fetched profile data:', this.profileData);
            if (this.profileData.ProfilePic) {
              this.profileData.profilePictureUrl = `data:image/jpeg;base64,${this.profileData.ProfilePic}`;
            } else {
              this.profileData.profilePictureUrl = this.defaultProfilePictureUrl;
            }
            this.currentProfilePictureUrl = this.profileData.profilePictureUrl; // Store initial profile picture URL
            console.log('Profile picture URL set to:', this.profileData.profilePictureUrl);

            // Optionally, check if there's a stored profile picture URL in local storage
            // this.loadStoredProfilePicture();
          },
          (          error: any) => {
            console.error('Error fetching profile data', error);
            // Handle error fetching profile data
            this.toastr.error('Error fetching profile data', 'Profile');
          }
        );
      },
      (      error: any) => {
        console.error('Error fetching user data', error);
        // Handle error fetching user data
        this.toastr.error('Error fetching user data', 'Profile');
      }
    );
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.currentProfilePictureUrl = this.profileData.profilePictureUrl; // Store current profile picture URL
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.newProfilePictureUrl = e.target.result;
        this.selectedFile = file;
        this.isPicturePopupVisible = true;
      };
      reader.readAsDataURL(file);
    }
  }

  saveNewProfilePicture() {
    if (this.selectedFile) {
      this.profileDetailsService.uploadImage({ ProfilePicture: this.selectedFile }).subscribe(
        (response: { profilePic: string; }) => {
          if (response.profilePic) {
            const userId = this.profileData.userId; // Assuming userId is available in profileData
            localStorage.setItem(`profilePictureUrl_${userId}`, `data:image/jpeg;base64,${response.profilePic}`);
            this.profileData.profilePictureUrl = `data:image/jpeg;base64,${response.profilePic}`;
          }
          this.isPicturePopupVisible = false;
          this.newProfilePictureUrl = null;
          console.log('Profile Picture Uploaded Successfully', response);
          console.log('Updated profile picture URL:', this.profileData.profilePictureUrl);
          this.selectedFile = null;
        },
        (        error: any) => {
          console.error('Error Uploading Profile Picture', error);
          this.isPicturePopupVisible = false;
        }
      );
    }
  }

  cancelNewProfilePicture() {
    this.newProfilePictureUrl = null;
    this.selectedFile = null;
    this.isPicturePopupVisible = false;
    this.profileData.profilePictureUrl = this.currentProfilePictureUrl; // Revert to current profile picture URL
  }

  loadStoredProfilePicture() {
    const userId = this.profileData.userId; // Assuming userId is available in profileData
    const storedProfilePictureUrl = localStorage.getItem(`profilePictureUrl_${userId}`);
    console.log('Stored profile picture URL:', storedProfilePictureUrl); // Log to check the retrieved URL
    if (storedProfilePictureUrl) {
      this.profileData.profilePictureUrl = storedProfilePictureUrl;
    }
  }

  saveProfile() {
    // Implement saveProfile logic here
  }

  cancelEdit() {
    this.isEditing = false;
    this.resetProfileData();
  }

  resetProfileData() {
    // Implement resetProfileData logic here
  }

  adoptPet(pet: any) {
    pet.status = 'Reserved';
    this.http.post('/api/update-pet-status', { id: pet.id, status: 'Reserved' }).subscribe(
      response => {
        console.log('Pet status updated to Reserved', response);
      },
      error => {
        console.error('Error updating pet status', error);
      }
    );
  }

  markAsAdopted(pet: any) {
    pet.status = 'Adopted';
    this.http.post('/api/update-pet-status', { id: pet.id, status: 'Adopted' }).subscribe(
      response => {
        console.log('Pet status updated to Adopted', response);
      },
      error => {
        console.error('Error updating pet status', error);
      }
    );
  }
}
