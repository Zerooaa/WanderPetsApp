import { Component, ElementRef, OnInit, HostListener, Renderer2 } from '@angular/core';
import { MessagesDetailsService } from '../share/messages-details.service';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { PictureDetailsService } from '../share/picture-details.service';
import { AuthService } from '../services/auth-service';
import { RegisterDetailsService } from '../share/register-details.service';
import { UserProfileService } from '../services/userProfile-service';
import { PictureDetails } from '../share/picture-details.model';
import { RegisterDetails } from '../share/register-details.model';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit {
  isExpanded: boolean = false;
  isPopupVisible: boolean = false;
  selectedFiles: File[] = [];
  photoPreviews: string[] = [];
  posts: any[] = [];
  filteredPosts: any[] = [];
  filterType: string | null = null;
  userId: string | null = null;
  userName: string | null = null;
  userEmail: string | null = null; // Added to store the user's email
  defaultProfilePictureUrl: string = 'https://github.com/Zerooaa/WanderPetsApp/blob/master/public/pets.png?raw=true';
  profilePictureUrl: string | null = null;
  postFilter: string| undefined;;
  postTag: string| undefined;;
  postLocation: string| undefined;;
  postMessage: string | undefined;

  constructor(
    private eRef: ElementRef,
    private renderer: Renderer2,
    public service: MessagesDetailsService,
    private toastr: ToastrService,
    private http: HttpClient,
    public pictureserv: PictureDetailsService,
    public regserv: RegisterDetailsService,
    public userProfileService: UserProfileService
  ) {}

  ngOnInit(): void {
    // Retrieve userId and userName from localStorage upon component initialization
    this.userId = localStorage.getItem('userID'); // Ensure consistent casing
    this.userName = localStorage.getItem('userName');
    this.userEmail = localStorage.getItem('userEmail'); // Retrieve user's email

    if (this.userId) {
      this.fetchUserPosts();
      this.loadProfilePicture();
    } else {
      console.error('User is not logged in.');
      // Handle user not logged in scenario
    }
  }

  fetchUserPosts() {
    // Adjust API endpoint to fetch posts for current userId
    this.http.get<any[]>(`https://localhost:7123/api/PostMessages/user/${this.userId}`).subscribe(
      posts => {
        this.posts = posts;
        this.applyFilter(); // If you have filters, apply them here
      },
      error => {
        console.error('Error fetching posts:', error);
        // Handle error
      }
    );
  }

  loadProfilePicture() {
    const userId = this.userId; // Ensure consistent casing
    if (userId) {
      const storedProfilePictureUrl = localStorage.getItem(`profilePictureUrl_${userId}`);
      if (storedProfilePictureUrl) {
        this.profilePictureUrl = storedProfilePictureUrl;
      } else {
        this.userProfileService.loadProfilePictureUrl(Number(userId));
        this.userProfileService.getProfilePictureUrl().subscribe(url => {
          this.profilePictureUrl = url;
        });
      }
    }
  }

  handleInput() {
    this.isExpanded = this.service.formMessage.postMessage.trim() !== '';
  }

  toggleFilterPopup() {
    this.isPopupVisible = !this.isPopupVisible;
  }

  @HostListener('document:click', ['$event'])
  onClick(event: Event) {
    if (this.isPopupVisible && !this.eRef.nativeElement.contains(event.target)) {
      this.isPopupVisible = false;
    }
  }

  onFilesSelected(event: any) {
    if (event.target.files.length > 0) {
      for (let file of event.target.files) {
        this.selectedFiles.push(file);
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.photoPreviews.push(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  onSubmit(form: NgForm) {
    if (this.selectedFiles.length > 0) {
      this.uploadPhotos().then(() => {
        this.submitForm(form);
      }).catch(err => {
        console.log(err);
        this.toastr.error('Failed to upload images', 'Image Upload');
      });
    } else {
      this.submitForm(form);
    }
  }

  async uploadPhotos() {
    const uploadPromises = this.selectedFiles.map(file => {
      const pictureDetails = new PictureDetails();
      pictureDetails.Images = file;
      return this.pictureserv.uploadImage(pictureDetails).toPromise();
    });
    await Promise.all(uploadPromises);
  }

  submitForm(form: NgForm) {
    // Convert userId to a number and provide a default value if null
    const userId = Number(this.userId) || 0; // Replace this.userId with your actual userId source

    // Ensure userId is a valid number
    if (isNaN(userId) || userId <= 0) {
        console.error('Invalid userId:', userId);
        this.toastr.error('Invalid userId', 'User Details');
        return;
    }

    // Fetch the username using the userId
    this.regserv.getRegisterDetails(userId).subscribe({
        next: (userDetails) => {
            const username = userDetails.userName || ''; // Use empty string if undefined

            // Upload images first
            this.uploadImage().then((uploadedImageUrls: string[]) => {
                // Prepare form data with fetched username and uploaded image URLs
                this.service.formMessage = {
                    ...this.service['formData'],
                    postMessage: this.postMessage || '',  // Ensure postMessage is a string
                    postTag: this.postTag || '',          // Ensure postTag is a string
                    postLocation: this.postLocation || '', // Ensure postLocation is a string
                    postFilter: this.postFilter || '',    // Ensure postFilter is a string
                    userName: username,                   // Use username from fetched details
                    photos: uploadedImageUrls             // Attach uploaded image URLs to the post
                };

                // Submit the form data
                this.service.postRegisterDetails().subscribe({
                    next: res => {
                        this.addPost(res);
                        this.service.resetForm(form);
                        this.toastr.success('Submitted successfully', 'Post Details');
                        this.resetPhotos();
                    },
                    error: err => {
                        console.log(err);
                        this.toastr.error('Failed to submit post', 'Post Details');
                    }
                });
            }).catch((err: any) => {
                console.log(err);
                this.toastr.error('Failed to upload images', 'Image Upload');
            });
        },
        error: err => {
            console.log(err);
            this.toastr.error('Failed to fetch user details', 'User Details');
        }
    });
}

// Modify uploadPhotos to return URLs of uploaded images
async uploadImage(): Promise<string[]> {
    const uploadPromises = this.selectedFiles.map(file => {
        const pictureDetails = new PictureDetails();
        pictureDetails.Images = file;
        return this.pictureserv.uploadImage(pictureDetails).toPromise();
    });

    // Wait for all uploads to complete and collect URLs
    const uploadedImageUrls = await Promise.all(uploadPromises);
    return uploadedImageUrls.map(uploadResponse => uploadResponse.imageUrl); // Adjust based on your actual response structure
}
// Modify uploadPhotos to return URLs of uploaded images
  addPost(post: any) {
    console.log('Adding post:', post);
    this.posts.unshift(post);
    console.log('Updated posts array:', this.posts);
    this.applyFilter();
}

  likePost(post: any) {
    post.likes = (post.likes || 0) + 1; // Increment like count
  }

  toggleComments(post: any) {
    post.showComments = !post.showComments;
  }

  addComment(post: any) {
    if (!post.comments) {
      post.comments = [];
    }
    post.comments.push({
      username: this.userName,
      text: post.newComment,
    });
    post.newComment = ''; // Clear the input field
  }

  adoptPet(post: any) {
    // Implementation for adopting a pet
  }

  filterPosts(filter: string) {
    this.filterType = filter;
    this.applyFilter();
  }

  applyFilter() {
    if (this.filterType) {
      this.filteredPosts = this.posts.filter(post => post.type === this.filterType);
    } else {
      this.filteredPosts = this.posts;
    }
  }

  resetPhotos() {
    this.selectedFiles = [];
    this.photoPreviews = [];
  }

  togglePostMenu(post: any) {
    // Implementation for toggling post menu
  }

  markAsReserved(post: any) {
    // Implementation for marking a post as reserved
  }

  markAsAdopted(post: any) {
    // Implementation for marking a post as adopted
  }

  startEditingPost(post: any) {
    post.isEditing = true;
    post.showMenu = false;
  }

  saveEdit(post: any) {
    post.message = post.editMessage;
    post.tag = post.editTag;
    post.isEditing = false;
  }

  cancelEdit(post: any) {
    post.editMessage = post.message;
    post.editTag = post.tag;
    post.isEditing = false;
  }

  deletePhoto(index: number) {
    this.selectedFiles.splice(index, 1);
    this.photoPreviews.splice(index, 1);
  }
}
