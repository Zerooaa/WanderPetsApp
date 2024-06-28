import { Component, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { MessagesDetailsService } from '../share/messages-details.service';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { PictureDetailsService } from '../share/picture-details.service';
import { PictureDetails } from '../share/picture-details.model';
import { AuthService } from '../services/auth-service';
import { RegisterDetailsService } from '../share/register-details.service';
import { UserProfileService } from '../services/userProfile-service';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent {
  isExpanded: boolean = false;
  isPopupVisible: boolean = false;
  selectedFiles: File[] = [];
  photoPreviews: string[] = [];
  posts: any[] = [];
  filteredPosts: any[] = [];
  filterType: string | null = null;
  userId: string | null = null;
  userName: string | null = null;
  defaultProfilePictureUrl: string = 'https://github.com/Zerooaa/WanderPetsApp/blob/master/public/pets.png?raw=true'; // Default picture URL
  profilePictureUrl: string | null = null;

  constructor(private eRef: ElementRef,
              private renderer: Renderer2,
              public service: MessagesDetailsService,
              private toastr: ToastrService,
              private http: HttpClient,
              public pictureserv: PictureDetailsService,
              public regserv: RegisterDetailsService,
              public userProfileService: UserProfileService) {}

  ngOnInit(): void {
    // Retrieve userId and userName from localStorage upon component initialization
    this.userId = localStorage.getItem('userId');
    this.userName = localStorage.getItem('userName');

    if (this.userId) {
      this.fetchUserPosts();
    } else {
      console.error('User is not logged in.');
      // Handle user not logged in scenario
    }

    const userId = localStorage.getItem('userId');
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
    const postDetails = {
      ...this.service.formMessage,
      photos: this.photoPreviews,
      userId: this.userId,
      username: this.userName,
      date: new Date()
    };
    this.http.post('https://localhost:7123/api/PostMessages', postDetails).subscribe({
      next: res => {
        this.addPost(postDetails);
        this.service.resetForm(form);
        this.toastr.success('Submitted successfully', 'Post Details');
        this.resetPhotos();
      },
      error: err => {
        console.log(err);
        this.toastr.error('Failed to submit post', 'Post Details');
      }
    });
  }

  addPost(post: any) {
    // Construct the new post object with necessary properties
    const newPost = {
      username: this.userName,
      date: new Date(),
      message: post.postMessage,
      photos: post.photos,
      tag: post.postTag,
      likes: 0,
      comments: [],
      showMenu: false,
      isEditing: false,
      reserved: false,
      adopted: false,
      showComments: false
    };
    // Add the new post to the posts array
    this.posts.unshift(newPost);
    this.applyFilter(); // Apply filters if any
  }

  likePost(post: any) {
    post.likes++;
  }

  toggleComments(post: any) {
    post.showComments = !post.showComments;
  }

  addComment(post: any) {
    if (post.newComment.trim() !== '') {
      post.comments.push({
        username: this.userName,
        text: post.newComment
      });
      post.newComment = '';
    }
  }

  adoptPet(post: any) {
    post.adopted = true;
  }

  filterPosts(filter: string) {
    this.filterType = filter;
    this.applyFilter();
  }

  applyFilter() {
    if (this.filterType) {
      this.filteredPosts = this.posts.filter(post => post.tag === this.filterType);
    } else {
      this.filteredPosts = [...this.posts];
    }
  }

  resetPhotos() {
    this.selectedFiles = [];
    this.photoPreviews = [];
  }

  togglePostMenu(post: any) {
    post.showMenu = !post.showMenu;
  }

  markAsReserved(post: any) {
    post.reserved = true;
  }

  markAsAdopted(post: any) {
    post.adopted = true;
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
