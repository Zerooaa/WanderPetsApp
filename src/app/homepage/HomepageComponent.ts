import { Component, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { MessagesDetailsService } from '../share/messages-details.service';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
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

  resetPhotoSelection() {
    this.selectedFile = null;
    this.selectedFileName = null;
    this.photoPreview = null;
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
        this.service.resetForm(form);
        this.toastr.success('Submitted successfully', 'Post Details');
      },
      error: err => {
        console.log(err);
        this.toastr.error('Failed to submit post', 'Post Details');
      }
    });
  }
}
