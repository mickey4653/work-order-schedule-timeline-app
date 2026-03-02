import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * TimelineBarComponent
 * 
 * Responsibility: Visual representation of a single work order on the timeline.
 * - Displays work order as a horizontal bar
 * - Shows work order details (name, duration, status)
 * - Handles bar-level interactions (click, drag, resize)
 * - Calculates position and width based on dates
 */
@Component({
  selector: 'app-timeline-bar',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="timeline-bar"></div>`,
  styles: [`
    .timeline-bar {
      // Work order bar styles
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineBarComponent {
  // @Input() workOrder: WorkOrder | null = null;
  // @Input() dateRange: DateRange | null = null;
  // @Input() columnWidth: number = 100;
  
  // @Output() clicked = new EventEmitter<WorkOrder>();
  // @Output() dragStarted = new EventEmitter<WorkOrder>();
  // @Output() dragEnded = new EventEmitter<WorkOrderDragEvent>();
}
