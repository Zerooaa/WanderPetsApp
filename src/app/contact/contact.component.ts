import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { ContactDetailsService } from '../share/contact-details.service';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {

  constructor(private fb: FormBuilder,
              public service: ContactDetailsService,
              private toastr: ToastrService) { }

  ngOnInit() {
  }

  onSubmit() {
    this.service.postContactDetails().subscribe(
      res => {
        this.toastr.success('Message Sent successfully', 'Contact Form');
        console.log(res);
      },
      err => {
        console.log(err);
        this.toastr.error('Failed to Send Message', 'Contact Form');
      }
    );
  }
}
