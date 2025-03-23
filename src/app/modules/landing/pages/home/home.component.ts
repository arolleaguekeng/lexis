import { Component } from '@angular/core';
import { CreateProjectComponent } from '../../../project/pages/create-project/create-project.component';
import { ViewportScroller } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CreateProjectComponent, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate(
          '1000ms ease-in-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
  ],
})
export class HomeComponent {
  constructor(private viewportScroller: ViewportScroller) {}

  scrollToSection(sectionId: string) {
    setTimeout(() => {
      this.viewportScroller.scrollToAnchor(sectionId);
    }, 300);
  }
}
