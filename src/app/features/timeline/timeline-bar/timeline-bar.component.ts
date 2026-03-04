import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
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
  imports: [CommonModule, NgbTooltipModule],
  template: `
    <div class="timeline-bar"
         [class]="'timeline-bar--' + workOrder.data.status"
         [style.left.px]="left"
         [style.width.px]="width"
         [ngbTooltip]="tooltipContent"
         tooltipClass="work-order-tooltip"
         placement="bottom"
         container="body">
      <div class="timeline-bar__content">
        <span class="timeline-bar__name">{{ workOrder.data.name }}</span>
        <span class="timeline-bar__status" [class]="'timeline-bar__status--' + workOrder.data.status">
          {{ getStatusLabel(workOrder.data.status) }}
        </span>
      </div>
      
      <!-- Three-dot menu button -->
      <button 
        class="timeline-bar__menu-btn"
        (click)="toggleMenu($event)"
        type="button">
        ⋯
      </button>
      
      <!-- Dropdown menu -->
      <div class="timeline-bar__menu" *ngIf="isMenuOpen" (click)="$event.stopPropagation()">
        <button class="timeline-bar__menu-item" (click)="onEdit($event)" type="button">
          Edit
        </button>
        <button class="timeline-bar__menu-item timeline-bar__menu-item--delete" (click)="onDelete($event)" type="button">
          Delete
        </button>
      </div>
    </div>
  `,
  styles: [`
    .timeline-bar {
      position: absolute;
      top: 10px;
      height: 38px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: visible;
      font-family: "Circular-Std-Book", sans-serif;
      z-index: 10;
      pointer-events: all;
    }

    .timeline-bar:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      z-index: 20;
    }

    .timeline-bar__content {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      padding: 0 32px 0 12px;
      height: 100%;
      overflow: hidden;
      gap: 8px;
    }

    .timeline-bar__name {
      font-size: 14px;
      font-weight: 400;
      color: rgba(3, 9, 41, 1);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
    }

    .timeline-bar__status {
      font-size: 14px;
      font-weight: 500;
      padding: 4px 10px;
      border-radius: 6px;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .timeline-bar__menu-btn {
      position: absolute;
      right: 4px;
      top: 50%;
      transform: translateY(-50%);
      width: 24px;
      height: 22px;
      border: none;
      background: rgba(0, 0, 0, 0.05);
      color: #666;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s ease;
      padding: 0;
      line-height: 1;
    }

    .timeline-bar__menu-btn:hover {
      background-color: rgba(241, 243, 248, 1);

    }

    .timeline-bar__menu {
      position: absolute;
      right: -170px;
      top: 100%;
      margin-top: 4px;
      background-color: rgba(255, 255, 255, 1);
      border-radius: 6px;
      box-shadow: 0 0 0 1px rgba(104, 113, 150, 0.1) , 0 2.5px 3px -1.5px rgba(200, 207, 233, 1) , 0 4.5px 5px -1px rgba(216, 220, 235, 1);
      width: 200px;
      height: 80px;

      z-index: 100;
      overflow: hidden;
    }

    .timeline-bar__menu-item {
      display: block;
      width: 100%;
      padding: 10px 16px;
      border: none;
      background: #fff;
      color: #333;
      text-align: left;
      font-size: 13px;
      font-family: "Circular-Std", sans-serif;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .timeline-bar__menu-item:hover {
      background: #f5f5f5;
    }

    .timeline-bar__menu-item--delete {
      color: rgba(62, 64, 219, 1);


    }

    .timeline-bar__menu-item--delete:hover {
      background-color: rgba(237, 238, 255, 1);

    }

    // Status color variants - Light pastel backgrounds with subtle borders
    .timeline-bar--open {
      box-shadow: 0 0 0 1px rgba(206, 251, 255, 1);
      background-color: rgba(228, 253, 255, 1);
    }

    .timeline-bar__status--open {
      background-color: rgba(206, 251, 255, 1);
      color: rgba(0, 176, 191, 1);
    }

    .timeline-bar--in-progress {
      box-shadow: 0 0 0 1px rgba(222, 224, 255, 1);
     background-color: rgba(237, 238, 255, 1);
    }

    .timeline-bar__status--in-progress {
      background-color: rgba(214, 216, 255, 1);
      color: rgba(62, 64, 219, 1);
    }

    .timeline-bar--complete {
      box-shadow: 0 0 0 1px rgba(209, 250, 179, 1);
      background-color: rgba(248, 255, 243, 1);
    }

    .timeline-bar__status--complete {
      background-color: rgba(225, 255, 204, 1);
     color: rgba(8, 162, 104, 1);
    }

    .timeline-bar--blocked {
      box-shadow: 0 0 0 1px rgba(255, 245, 207, 1);
      background-color: rgba(255, 252, 241, 1);

    }

    .timeline-bar__status--blocked {
     background-color: rgba(252, 238, 181, 1);
      color: rgba(177, 54, 0, 1);


    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineBarComponent {
  @Input({ required: true }) workOrder!: WorkOrderDocument;
  @Input({ required: true }) left!: number;
  @Input({ required: true }) width!: number;

  @Output() edit = new EventEmitter<WorkOrderDocument>();
  @Output() delete = new EventEmitter<WorkOrderDocument>();

  isMenuOpen = false;

  toggleMenu(event: Event): void {
    event.stopPropagation();
    this.isMenuOpen = !this.isMenuOpen;
  }

  onEdit(event: Event): void {
    event.stopPropagation();
    this.isMenuOpen = false;
    this.edit.emit(this.workOrder);
  }

  onDelete(event: Event): void {
    event.stopPropagation();
    this.isMenuOpen = false;
    
    if (confirm(`Are you sure you want to delete "${this.workOrder.data.name}"?`)) {
      this.delete.emit(this.workOrder);
    }
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'open': 'Open',
      'in-progress': 'In Progress',
      'complete': 'Complete',
      'blocked': 'Blocked'
    };
    return labels[status] || status;
  }

  get tooltipContent(): string {
    const startDate = new Date(this.workOrder.data.startDate).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
    const endDate = new Date(this.workOrder.data.endDate).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
    
    return `${this.workOrder.data.name}\nStatus: ${this.getStatusLabel(this.workOrder.data.status)}\n${startDate} - ${endDate}`;
  }
}
