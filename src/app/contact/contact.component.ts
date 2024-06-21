import { Component, OnInit } from '@angular/core';
import { FormBuilder, NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ContactDetailsService } from '../share/contact-details.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {

  constructor(
    public service: ContactDetailsService,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
  }

  onSubmit(form: NgForm) {
    if (this.service.formMessage.contactName && this.service.formMessage.contactEmail && this.service.formMessage.userMessage) {
      this.service.postContactDetails().subscribe(
        res => {
          this.toastr.success('Message Sent successfully', 'Contact Form');
          this.service.resetForm(form);
          console.log(res);
        },
        err => {
          console.log(err);
          this.toastr.error('Failed to Send Message', 'Contact Form');
        }
      );
    } else {
      this.toastr.error('Please fill out the form correctly', 'Contact Form');
    }
  }
}
