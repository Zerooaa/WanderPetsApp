import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MessagesDetailsService } from '../share/messages-details.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {

  contactForm!: FormGroup;

  constructor(private fb: FormBuilder, private service: MessagesDetailsService, private toastr: ToastrService) { }

  ngOnInit() {
    this.contactForm = this.fb.group({
      contactName: new FormControl(null, Validators.required),
      contactEmail: new FormControl(null, [Validators.required, Validators.email]),
      contactPhone: new FormControl(null, [Validators.required, Validators.minLength(10), Validators.pattern('^[0-9]*$')]),
      contactMessage: new FormControl(null, Validators.required)
    });
  }

  get contactName() {
    return this.contactForm.get('contactName') as FormControl;
  }

  get contactEmail() {
    return this.contactForm.get('contactEmail') as FormControl;
  }

  get contactPhone() {
    return this.contactForm.get('contactPhone') as FormControl;
  }

  get contactMessage() {
    return this.contactForm.get('contactMessage') as FormControl;
  }
  
  onSubmit() {
    if (this.contactForm.valid) {
      const response$: Observable<any> = this.service.postMessageDetails(this.contactForm.value);
      response$.subscribe({
        next: (res: any) => {
          console.log(res);
          this.contactForm.reset();
          this.toastr.success('Submitted Successfully', 'Messages Details');
        },
        error: (err: any) => { console.log(err); }
      });
    } else {
      this.toastr.error('Please Provide the Required Fields', 'Validation Error');
    }
  }
}
