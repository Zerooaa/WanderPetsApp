import { Component, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { MessagesDetailsService } from '../share/messages-details.service';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { PictureDetailsService } from '../share/picture-details.service';
import { PictureDetails } from '../share/picture-details.model';
import { AuthService } from '../services/auth-service';
import { RegisterDetailsService } from '../share/register-details.service';

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

  constructor(private eRef: ElementRef,
              private renderer: Renderer2,
              public service: MessagesDetailsService,
              private toastr: ToastrService,
              private http: HttpClient,
              public pictureserv: PictureDetailsService,
              public regserv: RegisterDetailsService) {}

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
  }

  addPost(post: any) {
    const newPost = {
      id: post.id,
      userProfilePic: 'path_to_profile_pic',
      username: 'User Name',
      date: new Date(),
      message: post.message,
      photos: [...this.photoPreviews],
      likes: 0,
      comments: [],
      reserved: false,
      adopted: false,
      showComments: false,
      showMenu: false,
      isEditing: false,
      newComment: '',
      tag: post.tag,
      editMessage: post.message,
      editTag: post.tag
    };
    this.posts.unshift(newPost);
    this.applyFilter();
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
        username: 'Current User',
        text: post.newComment.trim()
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
      this.filteredPosts = this.posts;
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
    post.showMenu = false;
  }

  markAsAdopted(post: any) {
    post.adopted = true;
    post.showMenu = false;
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
