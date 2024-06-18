import { Component, OnInit } from '@angular/core';
import { MessagesDetails } from '../share/messages-details.model';
import { MessagesDetailsService } from '../share/messages-details.service';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';


@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {


  constructor(public service: MessagesDetailsService, private toastr: ToastrService) { }

  ngOnInit() {
  }
  onSubmit(form: NgForm) {
    if(form.valid){
      this.service.postRegisterDetails().subscribe({
        next: res => {
          console.log(res);
          this.service.resetForm(form);
          this.toastr.success('Submitted Successfully', 'Messages Details');
        },
        error: err => { console.log(err); }
      });
      }
    }

}
