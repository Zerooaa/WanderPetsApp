import { Component, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { MessagesDetailsService } from '../share/messages-details.service';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent {
  postContent: string = '';
  isExpanded: boolean = false;
  isPopupVisible: boolean = false;
  selectedFile!: File;
  imageToShow!: string | ArrayBuffer | null;
  dataService: any;

  constructor(private eRef: ElementRef,
    private renderer: Renderer2,
    public service: MessagesDetailsService,
    private toastr: ToastrService,
    private http: HttpClient) { }

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

    onSubmit(form: NgForm) {
      if (form.valid) {
        this.service.postRegisterDetails().subscribe({
          next: res => {
            console.log(res);
            this.service.resetForm(form);
            this.toastr.success('Submitted successfully', 'Register Details');
          },
          error: err => { console.log(err); }
        });
      }
    }
  }

