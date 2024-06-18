import { Component } from '@angular/core';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.css'
})

export class HomepageComponent {
  postContent: string = '';
  isExpanded: boolean = false;

  handleInput() {
    this.isExpanded = this.postContent.trim() !== '';
  }
}
