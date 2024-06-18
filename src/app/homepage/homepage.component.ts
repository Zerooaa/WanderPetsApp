import { Component, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent {
  postContent: string = '';
  isExpanded: boolean = false;
  isPopupVisible: boolean = false;

  constructor(private eRef: ElementRef, private renderer: Renderer2) {}

  handleInput() {
    this.isExpanded = this.postContent.trim() !== '';
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
}
