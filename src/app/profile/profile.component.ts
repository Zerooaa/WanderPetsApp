import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  // Profile data
  loggedinUser: string = '';
  loggedinUserName: string = '';
  loggedinUserRole: string = '';
  loggedinUserAddress: string = '';
  loggedinUserEmail: string = '';
  loggedinUserContactNo: string = '';
  loggedinUserQuote: string = '';
  profilePictureUrl: string | undefined;
  defaultProfilePictureUrl: string = 'public/pets.png';

  // Pet Listings
  petListings: any[] = [];

  originalProfileData: any = {};
  isEditing: boolean = false;
  isPicturePopupVisible: boolean = false;
  newProfilePictureUrl: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const userID = params['id'];
      this.fetchProfile(userID);
      this.fetchPetListings();
  });
}

  fetchProfile(userID: string) {
    this.http.get('/api/profile').subscribe((data: any) => {
      this.loggedinUser = data.loggedinUser;
      this.loggedinUserName = data.loggedinUserName;
      this.loggedinUserRole = data.loggedinUserRole;
      this.loggedinUserAddress = data.loggedinUserAddress;
      this.loggedinUserEmail = data.loggedinUserEmail;
      this.loggedinUserContactNo = data.loggedinUserContactNo;
      this.loggedinUserQuote = data.loggedinUserQuote;
      this.profilePictureUrl = data.profilePictureUrl || this.defaultProfilePictureUrl;

      this.storeOriginalProfileData();
    });
  }

  fetchPetListings() {
    this.http.get<any[]>('/api/pet-listings').subscribe((data: any[]) => {
      this.petListings = data;
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

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
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
      const formData = new FormData();
      formData.append('profilePicture', this.selectedFile);

      this.http.post('/api/profile-picture', formData).subscribe((response: any) => {
        this.profilePictureUrl = response.profilePictureUrl;
        this.isPicturePopupVisible = false;
      }, error => {
        console.error('Error uploading profile picture', error);
        this.isPicturePopupVisible = false;
      });
    }
  }

  cancelNewProfilePicture() {
    this.newProfilePictureUrl = null;
    this.selectedFile = null;
    this.isPicturePopupVisible = false;
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

  // Pet listing functions
  adoptPet(pet: any) {
    pet.status = 'Reserved';
    this.http.post('/api/update-pet-status', { id: pet.id, status: 'Reserved' }).subscribe(response => {
      console.log('Pet status updated to Reserved', response);
    }, error => {
      console.error('Error updating pet status', error);
    });
  }

  markAsAdopted(pet: any) {
    pet.status = 'Adopted';
    this.http.post('/api/update-pet-status', { id: pet.id, status: 'Adopted' }).subscribe(response => {
      console.log('Pet status updated to Adopted', response);
    }, error => {
      console.error('Error updating pet status', error);
    });
  }
}
