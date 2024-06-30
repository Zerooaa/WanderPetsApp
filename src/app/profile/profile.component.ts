import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ProfileDetailsService } from '../share/profile-details.service';
import { RegisterDetailsService } from '../share/register-details.service';
import { ToastrService } from 'ngx-toastr';
import { UserProfileService } from '../services/userProfile-service';
import { RegisterDetails } from '../share/register-details.model';
import { ProfileDetails } from '../share/profile-details.model';
import { UpdateProfileDTO } from '../services/UpdateProfileDTO';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MessagesDetails } from '../share/messages-details.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileData: RegisterDetails = new RegisterDetails();
  originalProfileData: RegisterDetails = new RegisterDetails(); // Updated to RegisterDetails
  defaultProfilePictureUrl: string = 'https://github.com/Zerooaa/WanderPetsApp/blob/master/public/pets.png?raw=true';
  isEditing: boolean = false;
  isPicturePopupVisible: boolean = false;
  newProfilePictureUrl: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  currentProfilePictureUrl: string = '';
  petListings: any;
  posts: MessagesDetails[] = [];
  private subscription: Subscription = new Subscription();
  userId: string | null = null;
  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private http: HttpClient,
    private registerDetailsService: RegisterDetailsService,
    private toastr: ToastrService,
    private profileDetailsService: ProfileDetailsService,
    private userProfileService: UserProfileService,
    private location: Location,
    private router: Router
  ) {}

  ngOnInit() {
    this.fetchProfileData();
    this.fetchUserPosts(); // Add this line to fetch user posts on initialization
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions to avoid memory leaks
    this.subscription.unsubscribe();
  }

  fetchProfileData() {
    const userIDString = localStorage.getItem('userId');
    if (!userIDString) {
      console.error('User ID not found in local storage');
      return;
    }

    const userID = parseInt(userIDString, 10);
    if (isNaN(userID)) {
      console.error('Invalid user ID in local storage');
      return;
    }

    this.registerDetailsService.getRegisterDetails(userID).subscribe(
      (userData: RegisterDetails) => {
        this.profileData = userData;
        this.originalProfileData = { ...userData }; // Copy the data to originalProfileData
        this.loadProfilePicture(userID);
      },
      error => {
        console.error('Error fetching user data', error);
        this.toastr.error('Error fetching user data', 'Profile');
      }
    );
  }

  loadProfilePicture(userID: number) {
    this.profileDetailsService.getProfilePicture(userID).subscribe(
      (response: { profilePic: string }) => {
        this.profileData.profilePictureUrl = `data:image/jpeg;base64,${response.profilePic}`;
        this.currentProfilePictureUrl = this.profileData.profilePictureUrl;
      },
      error => {
        console.error('Error loading profile picture', error);
        this.toastr.error('Error loading profile picture', 'Profile');
        this.profileData.profilePictureUrl = this.defaultProfilePictureUrl;
      }
    );
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.currentProfilePictureUrl = this.profileData.profilePictureUrl;
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
      if (!this.profileData.userId) {
        console.error('User ID not found in profile data');
        return;
      }

      this.profileDetailsService.uploadImage(this.selectedFile, this.profileData.userId).subscribe(
        (response: { profilePic: string }) => {
          const base64Image = `data:image/jpeg;base64,${response.profilePic}`;
          this.profileData.profilePictureUrl = base64Image;
          this.userProfileService.setProfilePictureUrl(base64Image);

          // Save profile picture URL to local storage
          localStorage.setItem('profilePictureUrl', base64Image);

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
    this.profileData.profilePictureUrl = this.currentProfilePictureUrl;
  }

  saveProfile() {
    if (!this.profileData.userId) {
      console.error('User ID is missing.');
      this.toastr.error('User ID is missing.', 'Profile');
      return;
    }

    // Create the DTO with the necessary fields for the update
    const updatedProfileData: UpdateProfileDTO = {
      userId: this.profileData.userId,
      userName: this.profileData.userName,
      fullName: this.profileData.fullName,
      userEmail: this.profileData.userEmail,
      userPhone: this.profileData.userPhone
    };

    // Call the service to update the profile
    this.registerDetailsService.updateRegisterDetails(updatedProfileData).subscribe(
      (response) => {
        this.toastr.success('Profile updated successfully', 'Profile');
        this.isEditing = false;
        // Update originalProfileData with the updated values
        this.originalProfileData = { ...this.profileData };
      },
      error => {
        console.error('Error updating profile', error);
        this.toastr.error('Error updating profile', 'Profile');
      }
    );
  }

  cancelEdit() {
    this.isEditing = false;
    this.resetProfileData();
  }

  resetProfileData() {
    this.profileData = { ...this.originalProfileData }; // Reset profileData with originalProfileData
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

  fetchUserPosts(): void {
    const postsApiUrl = `https://localhost:7123/api/PostMessages/user/${this.userId}`;

    this.subscription.add(
      this.http.get<MessagesDetails[]>(postsApiUrl).subscribe({
        next: (posts) => {
          this.posts = posts.map(post => {
            // Create a new post object with the correct type
            const postWithImages: MessagesDetails = {
              ...post,
              images: post.imageUrl ? [{ name: post.imageUrl }] as any : [],
              postedDate: new Date(post.postedDate)
            };
            // Log base64 string for debugging
            if (post.imageUrl) {
              console.log(`Base64 Image URL: ${post.imageUrl}`);
            }
            return postWithImages;
          });
          console.log('Fetched posts:', this.posts); // Debugging log
        },
        error: (err) => {
          console.error('Error fetching user posts:', err);
          this.toastr.error('Failed to fetch posts', 'Post Details');
          this.posts = [];
        }
      })
    );
  }
}
