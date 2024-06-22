import { Component, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { MessagesDetailsService } from '../share/messages-details.service';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { PictureDetailsService } from '../share/picture-details.service';
import { PictureDetails } from '../share/picture-details.model';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent {
  isExpanded: boolean = false;
  isPopupVisible: boolean = false;
  selectedFile: File | null = null;
  selectedFileName: string | null = null;
  photoPreview: string | null = null;
  posts: any[] = []; // Initialize an array to hold posts
  filteredPosts: any[] = []; // Array to hold filtered posts
  filterType: string | null = null; // Variable to hold the current filter type

  constructor(private eRef: ElementRef,
    private renderer: Renderer2,
    public service: MessagesDetailsService,
    private toastr: ToastrService,
    private http: HttpClient,
    public pictureserv: PictureDetailsService) { }

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

  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      this.selectedFileName = this.selectedFile ? this.selectedFile.name : null;

      // Generate a preview of the selected image
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.photoPreview = e.target.result;
      };
      if (this.selectedFile) {
        reader.readAsDataURL(this.selectedFile);
      }
    }
  }

  deletePhoto() {
    this.selectedFile = null;
    this.selectedFileName = null;
    this.photoPreview = null;
    // Reset the file input field
    const fileInput = this.eRef.nativeElement.querySelector('#add-photo');
    if (fileInput) {
      fileInput.value = '';
    }
  }

  onSubmit(form: NgForm) {
    if (form.valid) {
      if (this.selectedFile) {
        const pictureDetails = new PictureDetails();
        pictureDetails.Images = this.selectedFile;

        this.pictureserv.uploadImage(pictureDetails).subscribe({
          next: res => {
            this.submitForm(form);
          },
          error: err => {
            console.log(err);
            this.toastr.error('Failed to upload image', 'Image Upload');
          }
        });
      } else {
        this.submitForm(form);
      }
    }
  }

  submitForm(form: NgForm) {
    this.service.postRegisterDetails().subscribe({
      next: res => {
        console.log(res);
        this.addPost(res); // Add the post to the posts array
        this.service.resetForm(form);
        this.toastr.success('Submitted successfully', 'Post Details');
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
      userProfilePic: 'path_to_profile_pic', // Replace with actual profile pic path
      username: 'User Name', // Replace with actual username
      date: new Date(),
      message: post.message,
      photo: this.photoPreview,
      likes: 0,
      comments: [],
      adopted: false,
      showComments: false,
      newComment: '',
      tag: post.tag // Assuming the tag is part of the post details
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
        username: 'Current User', // Replace with actual current user
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
}
