import { Component, OnDestroy, OnInit } from '@angular/core';
import { MessagesDetailsService } from '../share/messages-details.service';
import { ToastrService } from 'ngx-toastr';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PictureDetailsService } from '../share/picture-details.service';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { UserSessionService } from '../services/userSession-service';
import { UserProfileService } from '../services/userProfile-service';
import { NgForm } from '@angular/forms';
import { PictureDetails } from '../share/picture-details.model';
import { RegisterDetailsService } from '../share/register-details.service';
import { MessagesDetails } from '../share/messages-details.model';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit, OnDestroy {
  isExpanded: boolean = false;
  isPopupVisible: boolean = false;
  selectedFiles: File[] = [];
  photoPreviews: string[] = [];
  posts: any[] = [];
  userId: string | null = null;
  userName: string | null = null;
  defaultProfilePictureUrl: string = 'https://github.com/Zerooaa/WanderPetsApp/blob/master/public/pets.png?raw=true';
  profilePictureUrl: string | undefined = undefined;
  private subscription: Subscription = new Subscription();

  constructor(
    public service: MessagesDetailsService,
    private toastr: ToastrService,
    private http: HttpClient,
    public pictureserv: PictureDetailsService,
    public regserv: RegisterDetailsService,
    private userProfileService: UserProfileService,
    private userSessionService: UserSessionService,
    private router: Router,
  ) {}

  ngOnInit(): void {
   // Fetch user session data
   this.userId = this.userSessionService.getUserId();
   this.userName = this.userSessionService.getUserName();
   console.log('Retrieved userId:', this.userId); // Logging for debugging
   console.log('Retrieved userName:', this.userName); // Logging for debugging

   // Redirect to login if user is not authenticated
   if (!this.userId) {
     console.error('User is not logged in.');
     this.router.navigate(['/login']);
     return;
   }

    // Fetch user profile
    this.fetchUserProfile();

    // Fetch user posts
    this.fetchUserPosts();
    this.fetchAllPosts();
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions to avoid memory leaks
    this.subscription.unsubscribe();
  }

  fetchUserProfile(): void {
    const profilePictureUrl = localStorage.getItem('profilePictureUrl');
    if (profilePictureUrl) {
      this.profilePictureUrl = profilePictureUrl;
    } else {
      const profileApiUrl = `https://localhost:7123/api/UserProfile/${this.userId}`;
      this.subscription.add(
        this.http.get<any>(profileApiUrl).subscribe({
          next: (profile) => {
            this.profilePictureUrl = profile.pictureUrl || this.defaultProfilePictureUrl;
            this.userSessionService.setUserSession(this.userId as string, this.userName as string, this.profilePictureUrl);

            // Save profile picture URL to local storage
            if (this.profilePictureUrl) {
              localStorage.setItem('profilePictureUrl', this.profilePictureUrl);
            }

            console.log('Profile Picture URL:', this.profilePictureUrl); // Logging for debugging
          },
          error: (err) => {
            console.error('Failed to fetch profile', err);
            this.profilePictureUrl = this.defaultProfilePictureUrl;
          }
        })
      );
    }
  }

  navigateToUserProfile(userId: string) {
    this.router.navigate(['/profile', userId]);
  }

  fetchUserPosts(): void {
    const postsApiUrl = `https://localhost:7123/api/PostMessages/user/${this.userId}`;

    this.subscription.add(
      this.http.get<MessagesDetails[]>(postsApiUrl).subscribe({
        next: (posts) => {
          this.posts = posts.map(post => {
            const postWithImages = {
              ...post,
              images: post.imageUrl ? [post.imageUrl] : [],
              postedDate: new Date(post.postedDate).toLocaleString() // Format the date
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

  handleInput() {
    this.isExpanded = this.service.formMessage.postMessage.trim() !== '';
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
    const postDetails: MessagesDetails = {
      ...form.value,
      userId: this.userId as string,
      images: this.selectedFiles // Include images in the post
    };

    this.subscription.add(
      this.service.postMessageDetails(postDetails).subscribe({
        next: (res) => {
          this.addPost(res);
          this.toastr.success('Submitted successfully', 'Post Details');
          this.resetPhotos();
          form.resetForm(); // Reset the form after submission
        },
        error: (err) => {
          console.log(err);
          this.toastr.error('Failed to submit post', 'Post Details');
        }
      })
    );
  }

  addPost(post: MessagesDetails): void {
    const newPost = {
      ...post,
      username: this.userName,
      date: new Date(),
      images: this.createObjectURLs(this.selectedFiles) // Correctly map images to URLs
    };
    this.posts.unshift(newPost);
    console.log('Added post:', newPost); // Debugging log
  }

  // Create object URLs for the images
  createObjectURLs(images: File[]): string[] {
    return images.map(image => URL.createObjectURL(image));
  }

  likePost(post: any): void {
    if (!post.likes) {
      post.likes = 0; // Initialize if undefined
    }

    if (!post.likedBy) {
      post.likedBy = []; // Initialize if undefined
    }

    if (post.likedBy.includes(this.userId)) {
      // User has already liked the post, so remove their like
      post.likes--;
      post.likedBy = post.likedBy.filter((id: string) => id !== this.userId);
    } else {
      // User has not liked the post, so add their like
      post.likes++;
      post.likedBy.push(this.userId);
    }
  }

  toggleComments(post: any): void {
    post.showComments = !post.showComments;
  }

  addComment(post: any): void {
    if (post.newComment && post.newComment.trim() !== '') {
      const newComment = {
        username: this.userName,
        text: post.newComment
      };

      // Add the comment to the post
      if (!post.comments) {
        post.comments = [];
      }
      post.comments.push(newComment);

      // Reset the comment input field
      post.newComment = '';
    }
  }

  adoptPet(post: any): void {
    const adoptUrl = `https://localhost:7123/api/PostMessages/adopt/${post.id}/${this.userSessionService.getUserId()}`;
    this.subscription.add(
      this.http.put(adoptUrl, {}).subscribe({
        next: () => {
          this.toastr.success('Pet adopted successfully', 'Adopt Pet');
          post.reserved = true;
          post.adoptedByUserId = this.userSessionService.getUserId(); // Track who adopted the pet
          // No longer remove the post here
        },
        error: (err) => {
          console.error('Error adopting pet:', err);
          this.toastr.error('Failed to adopt pet', 'Adopt Pet');
        }
      })
    );
  }

  fetchAllPosts(): void {
    const postsApiUrl = `https://localhost:7123/api/PostMessages`;

    this.subscription.add(
      this.http.get<MessagesDetails[]>(postsApiUrl).subscribe({
        next: (posts) => {
          this.posts = posts.map(post => ({
            ...post,
            imageUrls: post.imageUrl ? [post.imageUrl] : []
          }));
          console.log('Fetched posts:', this.posts); // Debugging log
        },
        error: (err) => {
          console.error('Error fetching posts:', err);
          this.toastr.error('Failed to fetch posts', 'Post Details');
        }
      })
    );
  }

  resetPhotos() {
    this.selectedFiles = [];
    this.photoPreviews = [];
  }

  togglePostMenu(post: any) {
    post.showMenu = !post.showMenu;
  }

  markAsAdopted(post: any): void {
    post.adopted = true;
    // Remove the post from the homepage posts
    this.posts = this.posts.filter(p => p.id !== post.id);
  }

  startEditingPost(post: any) {
    post.isEditing = true;
    post.showMenu = false;
  }

  saveEdit(post: any) {
    const updatedPost = {
      id: post.id,
      postMessage: post.editMessage,
      postTag: post.editTag
    };

    this.http.put(`https://localhost:7123/api/PostMessages/${post.id}`, updatedPost)
      .subscribe({
        next: () => {
          post.postMessage = post.editMessage;
          post.postTag = post.editTag;
          post.isEditing = false;
          this.toastr.success('Post updated successfully', 'Edit Post');
        },
        error: (err) => {
          console.error('Error updating post:', err);
          this.toastr.error('Failed to update post', 'Edit Post');
        }
      });
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

  deletePost(post: any) {
    this.http.delete(`https://localhost:7123/api/PostMessages/${post.id}`)
      .subscribe({
        next: () => {
          this.posts = this.posts.filter(p => p.id !== post.id);
          this.toastr.success('Post deleted successfully', 'Delete Post');
        },
        error: (err) => {
          console.error('Error deleting post:', err);
          this.toastr.error('Failed to delete post', 'Delete Post');
        }
      });
  }
}
