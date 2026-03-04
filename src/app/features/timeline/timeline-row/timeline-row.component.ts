import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
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
  imports: [CommonModule, NgbTooltipModule, TimelineBarComponent],
  template: `
    <div class="timeline-row" 
         [class.timeline-row--hover]="isHovered"
         (mouseenter)="onMouseEnter($event)"
         (mouseleave)="onMouseLeave($event)">
      <div class="timeline-row-background"
           (click)="onRowClick($event)"
           title="Click to add dates">
      </div>
      <app-timeline-bar
        *ngFor="let positioned of positionedWorkOrders; trackBy: trackByWorkOrder"
        [workOrder]="positioned.workOrder"
        [left]="positioned.left"
        [width]="positioned.width"
        (edit)="onWorkOrderEdit($event)"
        (delete)="onWorkOrderDelete($event)">
      </app-timeline-bar>
    </div>
  `,
  styles: [`
    .timeline-row {
      height: 60px;
      position: relative;
      transition: background-color 0.2s ease;
    }

    .timeline-row--hover {
     background-color: rgba(238, 240, 255, 1);
    }

    .timeline-row-background {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      cursor: pointer;
      z-index: 0;
      pointer-events: all;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineRowComponent {
  @Input() workCenter: WorkCenterDocument | null = null;
  @Input() columnWidth: number = 80;
  @Input() visibleStartDate: Date | null = null;
  @Input() zoomLevel: 'day' | 'week' | 'month' = 'day';

  @Input() set workOrders(orders: WorkOrderDocument[]) {
    this.positionedWorkOrders = this.calculatePositions(orders);
  }

  @Output() cellClicked = new EventEmitter<GridCellClickEvent>();
  @Output() workOrderEdit = new EventEmitter<WorkOrderDocument>();
  @Output() workOrderDelete = new EventEmitter<WorkOrderDocument>();

  positionedWorkOrders: PositionedWorkOrder[] = [];
  isHovered = false;

  constructor(
    private timelineService: TimelineService
  ) {}

  trackByWorkOrder(index: number, positioned: PositionedWorkOrder): string {
    return positioned.workOrder.docId;
  }

  onMouseEnter(event: MouseEvent): void {
    this.isHovered = true;
  }

  onMouseLeave(event: MouseEvent): void {
    this.isHovered = false;
  }

  onWorkOrderEdit(workOrder: WorkOrderDocument): void {
    this.workOrderEdit.emit(workOrder);
  }

  onWorkOrderDelete(workOrder: WorkOrderDocument): void {
    this.workOrderDelete.emit(workOrder);
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
      this.columnWidth,
      this.zoomLevel
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
        this.columnWidth,
        this.zoomLevel
      );

      const calculatedWidth = this.timelineService.calculateBarWidth(
        startDate,
        endDate,
        this.columnWidth,
        this.zoomLevel
      );

      // Set minimum width based on zoom level to keep bars readable
      let minWidth = 40;
      if (this.zoomLevel === 'week') {
        minWidth = 80;  // Larger minimum for week view
      } else if (this.zoomLevel === 'month') {
        minWidth = 120; // Even larger minimum for month view
      }

      const width = Math.max(calculatedWidth, minWidth);

      return { workOrder: order, left, width };
    });
  }

  private parseDate(dateString: string): Date {
    return new Date(dateString);
  }
}
