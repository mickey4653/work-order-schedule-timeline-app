import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkCenterDocument, WorkOrderDocument, GridCellClickEvent } from '../../../core/models';
import { TimelineService } from '../../../core/services/timeline.service';
import { TimelineBarComponent } from '../timeline-bar/timeline-bar.component';

interface PositionedWorkOrder {
  workOrder: WorkOrderDocument;
  left: number;
  width: number;
}

/**
 * TimelineRowComponent
 * 
 * Responsibility: Represents a single work center row in the timeline.
 * - Displays work center label/information
 * - Renders timeline bars for work orders assigned to this work center
 * - Handles row-level interactions (hover, selection)
 * - Manages positioning of work order bars within the row
 */
@Component({
  selector: 'app-timeline-row',
  standalone: true,
  imports: [CommonModule, TimelineBarComponent],
  template: `
    <div class="timeline-row" 
         [class.timeline-row--hover]="isHovered"
         (mouseenter)="isHovered = true"
         (mouseleave)="isHovered = false"
         (click)="onRowClick($event)">
      <app-timeline-bar
        *ngFor="let positioned of positionedWorkOrders; trackBy: trackByWorkOrder"
        [workOrder]="positioned.workOrder"
        [left]="positioned.left"
        [width]="positioned.width">
      </app-timeline-bar>
    </div>
  `,
  styles: [`
    .timeline-row {
      height: 60px;
      border-bottom: 1px solid #e0e0e0;
      position: relative;
      transition: background-color 0.2s ease;
      cursor: pointer;
    }

    .timeline-row--hover {
      background-color: #f0f0f0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineRowComponent {
  @Input() workCenter: WorkCenterDocument | null = null;
  @Input() columnWidth: number = 80;
  @Input() visibleStartDate: Date | null = null;

  @Input() set workOrders(orders: WorkOrderDocument[]) {
    this.positionedWorkOrders = this.calculatePositions(orders);
  }

  @Output() cellClicked = new EventEmitter<GridCellClickEvent>();

  positionedWorkOrders: PositionedWorkOrder[] = [];
  isHovered = false;

  constructor(private timelineService: TimelineService) {}

  trackByWorkOrder(index: number, positioned: PositionedWorkOrder): string {
    return positioned.workOrder.docId;
  }

  onRowClick(event: MouseEvent): void {
    if (!this.workCenter || !this.visibleStartDate) {
      return;
    }

    const target = event.target as HTMLElement;
    
    // Don't trigger if clicking on a work order bar
    if (target.closest('.timeline-bar')) {
      return;
    }

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const clickPosition = event.clientX - rect.left;
    
    const clickedDate = this.timelineService.positionToDate(
      clickPosition,
      this.visibleStartDate,
      this.columnWidth
    );

    this.cellClicked.emit({
      workCenterId: this.workCenter.docId,
      clickedDate,
      clickPosition
    });
  }

  private calculatePositions(orders: WorkOrderDocument[]): PositionedWorkOrder[] {
    if (!this.visibleStartDate) {
      return [];
    }

    return orders.map(order => {
      const startDate = this.parseDate(order.data.startDate);
      const endDate = this.parseDate(order.data.endDate);

      const left = this.timelineService.dateToPosition(
        startDate,
        this.visibleStartDate!,
        this.columnWidth
      );

      const calculatedWidth = this.timelineService.calculateBarWidth(
        startDate,
        endDate,
        this.columnWidth
      );

      // Ensure minimum width for visibility
      const width = Math.max(calculatedWidth, 40);

      return { workOrder: order, left, width };
    });
  }

  private parseDate(dateString: string): Date {
    return new Date(dateString);
  }
}
