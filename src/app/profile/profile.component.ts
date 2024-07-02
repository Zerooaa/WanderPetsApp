import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
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
import { MessagesDetailsService } from '../share/messages-details.service';
import { MessagesDetails } from '../share/messages-details.model';
import { PostService } from '../services/postService-service';
import { UserSessionService } from '../services/userSession-service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  profileData: RegisterDetails = new RegisterDetails();
  originalProfileData: RegisterDetails = new RegisterDetails();
  defaultProfilePictureUrl: string = 'https://github.com/Zerooaa/WanderPetsApp/blob/master/public/pets.png?raw=true';
  isEditing: boolean = false;
  isPicturePopupVisible: boolean = false;
  newProfilePictureUrl: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  currentProfilePictureUrl: string = '';
  posts: MessagesDetails[] = [];
  private subscription: Subscription = new Subscription();
  userId: string | null = null;
  @ViewChild('fileInput') fileInput!: ElementRef;
  userName: string | null | undefined;
  adoptedPosts: MessagesDetails[] = [];

  constructor(
    private http: HttpClient,
    private registerDetailsService: RegisterDetailsService,
    private toastr: ToastrService,
    private profileDetailsService: ProfileDetailsService,
    private userProfileService: UserProfileService,
    private location: Location,
    private router: Router,
    private messagesService: MessagesDetailsService,
    private postService: PostService,
    private userSessionService: UserSessionService
  ) {}

  ngOnInit() {
    this.userId = this.userSessionService.getUserId();
    this.userName = this.userSessionService.getUserName();

    this.userId = this.userSessionService.getUserId();

    if (!this.userId) {
      console.error('User ID not found. Redirecting to login page.');
      this.router.navigate(['/login']);
      return;
    }

    this.fetchProfileData();
    this.fetchUserPosts();
    this.fetchAdoptedPosts();
}

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  fetchProfileData() {
    if (!this.userId) {
      console.error('User ID is null.');
      return;
    }

    const userID = parseInt(this.userId, 10);
    if (isNaN(userID)) {
      console.error('Invalid user ID');
      return;
    }

    this.registerDetailsService.getRegisterDetails(userID).subscribe(
      (userData: RegisterDetails) => {
        this.profileData = userData;
        this.originalProfileData = { ...userData };
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

  fetchUserPosts(): void {
    console.log('Fetching posts for User ID:', this.userId);
    if (!this.userId) {
      console.error('Cannot fetch posts. User ID is null.');
      return;
    }

    this.subscription.add(
      this.postService.fetchUserPosts(this.userId).subscribe({
        next: async (posts) => {
          this.posts = await Promise.all(posts.map(async post => {
            const files = post.imageUrl ? [await this.urlToFile(post.imageUrl, 'image.jpg')] : [];
            const imageUrls = post.imageUrl ? [post.imageUrl] : [];
            return {
              ...post,
              images: files,
              imageUrls: imageUrls
            };
          }));
        },
        error: (err) => {
          console.error('Error fetching user posts:', err);
          this.toastr.error('Failed to fetch posts', 'Post Details');
          this.posts = [];
        }
      })
    );
  }

  async urlToFile(url: string, filename: string, mimeType = 'image/jpeg'): Promise<File> {
    const res = await fetch(url);
    const blob = await res.blob();
    return new File([blob], filename, { type: mimeType });
  }
  // Function to convert data URI to Blob/File
  dataURItoBlob(dataURI: string): File {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeString });
    const file = new File([blob], 'filename.jpg');
    return file;
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
          localStorage.setItem('profilePictureUrl', base64Image);
          this.isPicturePopupVisible = false;
          this.newProfilePictureUrl = null;
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

    const updatedProfileData: UpdateProfileDTO = {
      userId: this.profileData.userId,
      userName: this.profileData.userName,
      fullName: this.profileData.fullName,
      userEmail: this.profileData.userEmail,
      userPhone: this.profileData.userPhone
    };

    this.registerDetailsService.updateRegisterDetails(updatedProfileData).subscribe(
      () => {
        this.toastr.success('Profile updated successfully', 'Profile');
        this.isEditing = false;
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
    this.profileData = { ...this.originalProfileData };
  }

  fetchAdoptedPosts(): void {
    const adoptedPostsApiUrl = `https://localhost:7123/api/PostMessages/adopted/${this.userId}`;

    this.http.get<MessagesDetails[]>(adoptedPostsApiUrl).subscribe({
      next: (posts) => {
        this.adoptedPosts = posts.map(post => ({
          ...post,
          imageUrls: post.imageUrl ? [post.imageUrl] : []  // Populate imageUrls from imageUrl
        }));
        console.log('Fetched adopted posts:', this.adoptedPosts); // Debugging log
      },
      error: (err) => {
        console.error('Error fetching adopted posts:', err);
      }
    });
}
}

