import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrl: './message.component.css'
})
export class MessageComponent {
  
  constructor(private location: Location) {}
  
  goBack(): void {
    this.location.back();
  }

}
