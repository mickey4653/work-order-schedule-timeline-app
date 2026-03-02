import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * TimelineShellComponent
 * 
 * Responsibility: Orchestration container for the entire timeline feature.
 * - Manages overall layout and composition of timeline sub-components
 * - Coordinates data flow between header, grid, and schedule panel
 * - Handles top-level state management and event coordination
 */
@Component({
  selector: 'app-timeline-shell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timeline-shell.component.html',
  styleUrl: './timeline-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineShellComponent {
  // @Input() workCenters: WorkCenter[] = [];
  // @Input() workOrders: WorkOrder[] = [];
  // @Input() dateRange: DateRange | null = null;
  
  // @Output() workOrderSelected = new EventEmitter<WorkOrder>();
  // @Output() workOrderCreated = new EventEmitter<WorkOrder>();
  // @Output() workOrderUpdated = new EventEmitter<WorkOrder>();
}
