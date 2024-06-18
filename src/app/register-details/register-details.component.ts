import { Component, OnInit } from '@angular/core';
import { RegisterDetailsService } from '../share/register-details.service';
import { NgForm } from '@angular/forms';
import { RegisterDetails } from '../share/register-details.model';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-register-details',
  templateUrl: './register-details.component.html',
  styleUrls: ['./register-details.component.css']
})
export class RegisterDetailsComponent implements OnInit {

  constructor(public service: RegisterDetailsService, private toastr: ToastrService) { }

  ngOnInit() {
    this.service.refreshList();
  }
  onSubmit(form: NgForm) {
    if(form.valid){
      this.service.postRegisterDetails().subscribe({
        next: res => {
          console.log(res);
          this.service.list = res as RegisterDetails[];
          this.service.resetForm(form);
          this.toastr.success('Submitted successfully', 'Register Details');
        },
        error: err => { console.log(err); }
      });
      }
    }
}

