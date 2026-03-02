import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineShellComponent } from './features/timeline/timeline-shell/timeline-shell.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, TimelineShellComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Work Order Schedule Timeline';
}
