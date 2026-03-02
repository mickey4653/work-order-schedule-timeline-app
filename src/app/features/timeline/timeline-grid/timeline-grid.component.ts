import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkCenterDocument, WorkOrderDocument, GridCellClickEvent } from '../../../core/models';
import { TimelineService } from '../../../core/services/timeline.service';
import { TimelineRowComponent } from '../timeline-row/timeline-row.component';

/**
 * TimelineGridComponent
 * 
 * Responsibility: Scrollable container for timeline rows.
 * - Manages vertical and horizontal scrolling
 * - Renders collection of timeline rows
 * - Handles scroll synchronization with header
 * - Manages viewport virtualization (if needed)
 */
@Component({
  selector: 'app-timeline-grid',
  standalone: true,
  imports: [CommonModule, TimelineRowComponent],
  template: `
    <div class="timeline-grid" [style.width.px]="totalWidth">
      <app-timeline-row
        *ngFor="let center of workCenters; trackBy: trackByWorkCenter"
        [workCenter]="center"
        [workOrders]="getWorkOrdersForCenter(center.docId)"
        [visibleStartDate]="visibleStartDate"
        [columnWidth]="columnWidth"
        (cellClicked)="onCellClicked($event)"
        (workOrderEdit)="onWorkOrderEdit($event)"
        (workOrderDelete)="onWorkOrderDelete($event)">
      </app-timeline-row>
    </div>
  `,
  styles: [`
    .timeline-grid {
      position: relative;
      min-height: 100%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineGridComponent {
  @Input() workCenters: WorkCenterDocument[] = [];
  @Input() workOrders: WorkOrderDocument[] = [];
  @Input() visibleStartDate: Date | null = null;
  @Input() columnWidth: number = 80;
  @Input() totalColumns: number = 60;

  @Output() cellClicked = new EventEmitter<GridCellClickEvent>();
  @Output() workOrderEdit = new EventEmitter<WorkOrderDocument>();
  @Output() workOrderDelete = new EventEmitter<WorkOrderDocument>();

  get totalWidth(): number {
    return this.totalColumns * this.columnWidth;
  }

  trackByWorkCenter(index: number, center: WorkCenterDocument): string {
    return center.docId;
  }

  getWorkOrdersForCenter(workCenterId: string): WorkOrderDocument[] {
    return this.workOrders.filter(order => order.data.workCenterId === workCenterId);
  }

  onCellClicked(event: GridCellClickEvent): void {
    this.cellClicked.emit(event);
  }

  onWorkOrderEdit(workOrder: WorkOrderDocument): void {
    this.workOrderEdit.emit(workOrder);
  }

  onWorkOrderDelete(workOrder: WorkOrderDocument): void {
    this.workOrderDelete.emit(workOrder);
  }
}
