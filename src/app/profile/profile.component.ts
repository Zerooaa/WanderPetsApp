import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ProfileDetails } from '../share/profile-details.model';
import { ProfileDetailsService } from '../share/profile-details.service';
import { RegisterDetailsService } from '../share/register-details.service';
import { ToastrService } from 'ngx-toastr';
import { UserProfileService } from '../services/userProfile-service';
import { RegisterDetails } from '../share/register-details.model'; // Ensure this is imported

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileData: RegisterDetails = new RegisterDetails();
  originalProfileData: ProfileDetails = new ProfileDetails(); // To store original profile data
  defaultProfilePictureUrl: string = 'https://github.com/Zerooaa/WanderPetsApp/blob/master/public/pets.png?raw=true';
  isEditing: boolean = false;
  isPicturePopupVisible: boolean = false;
  newProfilePictureUrl: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  currentProfilePictureUrl: string = ''; // Added property to store current profile picture URL
  petListings: any;

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private http: HttpClient,
    private registerDetailsService: RegisterDetailsService,
    private toastr: ToastrService,
    private profileDetailsService: ProfileDetailsService,
    private userProfileService: UserProfileService
  ) {}

  ngOnInit() {
    this.fetchProfileData();
    this.petListings();
    this.initProfilePicture();
  }

  initProfilePicture() {
    const userId = parseInt(localStorage.getItem('userID')!, 10);
    this.userProfileService.loadProfilePictureUrl(userId);
    this.userProfileService.getProfilePictureUrl().subscribe(
      (url: string | null) => {
        this.currentProfilePictureUrl = url || this.defaultProfilePictureUrl;
        this.originalProfileData.profilePictureUrl = this.currentProfilePictureUrl;
      }
    );
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

    // Fetch register details
    this.registerDetailsService.getRegisterDetails(userID).subscribe(
      (userData: RegisterDetails) => {
        // Populate profileData
        this.originalProfileData.userName = userData.userName;
        this.originalProfileData.fullName = userData.fullName;
        this.originalProfileData.userEmail = userData.userEmail;
        this.originalProfileData.userPhone = userData.userPhone;
        this.originalProfileData.userId = userData.userID;

        // Fetch additional profile details
        this.profileDetailsService.getProfileDetails(userID).subscribe(
          (profileData: ProfileDetails) => {
            this.originalProfileData = profileData;
            this.originalProfileData = { ...profileData }; // Store original data
            console.log('Fetched profile data:', this.profileData);

            // Check if there's a stored profile picture URL in local storage
            const storedProfilePictureUrl = localStorage.getItem(`profilePictureUrl_${userID}`);
            if (storedProfilePictureUrl) {
              this.originalProfileData.profilePictureUrl = storedProfilePictureUrl;
            } else if (this.originalProfileData.ProfilePic) {
              this.originalProfileData.profilePictureUrl = `data:image/jpeg;base64,${this.originalProfileData.ProfilePic}`;
            } else {
              this.originalProfileData.profilePictureUrl = this.defaultProfilePictureUrl;
            }

            this.currentProfilePictureUrl = this.originalProfileData.profilePictureUrl;
            console.log('Profile picture URL set to:', this.originalProfileData.profilePictureUrl);
          },
          error => {
            console.error('Error fetching profile data', error);
            this.toastr.error('Error fetching profile data', 'Profile');
          }
        );
      },
      error => {
        console.error('Error fetching user data', error);
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
      this.currentProfilePictureUrl = this.originalProfileData.profilePictureUrl;
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

      const formData = new FormData();
      formData.append('ProfilePicture', this.selectedFile);

      this.profileDetailsService.uploadImage(formData).subscribe(
        (response: { profilePic: string }) => {
          if (response.profilePic) {
            const base64Image = `data:image/jpeg;base64,${response.profilePic}`;
            localStorage.setItem(`profilePictureUrl_${userID}`, base64Image);
            this.originalProfileData.profilePictureUrl = base64Image;
            this.userProfileService.setProfilePictureUrl(base64Image);
          }
          this.isPicturePopupVisible = false;
          this.newProfilePictureUrl = null;
          console.log('Profile Picture Uploaded Successfully', response);
          this.selectedFile = null;
        },
        error => {
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
    this.originalProfileData.profilePictureUrl = this.currentProfilePictureUrl;
  }

  saveProfile() {

  }

  cancelEdit() {
    this.isEditing = false;
    this.resetProfileData();
  }

  resetProfileData() {

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
