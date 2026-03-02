import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkOrderDocument } from '../../../core/models';

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
  template: `
    <div class="timeline-bar"
         [class]="'timeline-bar--' + workOrder.data.status"
         [style.left.px]="left"
         [style.width.px]="width">
      <div class="timeline-bar__content">
        <span class="timeline-bar__name">{{ workOrder.data.name }}</span>
        <span class="timeline-bar__status">{{ workOrder.data.status }}</span>
      </div>
    </div>
  `,
  styles: [`
    .timeline-bar {
      position: absolute;
      top: 10px;
      height: 40px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
      font-family: "Circular-Std", sans-serif;
    }

    .timeline-bar:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.12);
      z-index: 2;
    }

    .timeline-bar__content {
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 6px 12px;
      height: 100%;
      color: #fff;
    }

    .timeline-bar__name {
      font-size: 12px;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      letter-spacing: 0.2px;
    }

    .timeline-bar__status {
      font-size: 10px;
      text-transform: uppercase;
      opacity: 0.85;
      margin-top: 2px;
      font-weight: 500;
      letter-spacing: 0.5px;
    }

    // Status color variants
    .timeline-bar--open {
      background: #4a90e2;
      box-shadow: 0 2px 4px rgba(74, 144, 226, 0.2);
    }

    .timeline-bar--in-progress {
      background: #f5a623;
      box-shadow: 0 2px 4px rgba(245, 166, 35, 0.2);
    }

    .timeline-bar--complete {
      background: #7ed321;
      box-shadow: 0 2px 4px rgba(126, 211, 33, 0.2);
    }

    .timeline-bar--blocked {
      background: #e74c3c;
      box-shadow: 0 2px 4px rgba(231, 76, 60, 0.2);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineBarComponent {
  @Input({ required: true }) workOrder!: WorkOrderDocument;
  @Input({ required: true }) left!: number;
  @Input({ required: true }) width!: number;
}
