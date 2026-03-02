import { Component, ChangeDetectionStrategy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScheduleService } from '../../../core/services/schedule.service';
import { TimelineService } from '../../../core/services/timeline.service';
import { ValidationService } from '../../../core/services/validation.service';
import { WorkCenterDocument, WorkOrderDocument, ScheduleFormData, GridCellClickEvent } from '../../../core/models';
import { Observable, combineLatest, map } from 'rxjs';
import { TimelineGridComponent } from '../timeline-grid/timeline-grid.component';
import { SchedulePanelComponent } from '../schedule-panel/schedule-panel.component';

interface DateColumn {
  date: Date;
  label: string;
  position: number;
}

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
  imports: [CommonModule, TimelineGridComponent, SchedulePanelComponent],
  templateUrl: './timeline-shell.component.html',
  styleUrl: './timeline-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineShellComponent implements OnInit {
  @ViewChild(SchedulePanelComponent) schedulePanel!: SchedulePanelComponent;

  workCenters$!: Observable<WorkCenterDocument[]>;
  workOrders$!: Observable<WorkOrderDocument[]>;
  dateColumns$!: Observable<DateColumn[]>;
  currentDayPosition$!: Observable<number>;
  columnWidth$!: Observable<number>;
  visibleStartDate$!: Observable<Date>;
  totalWidth$!: Observable<number>;

  isPanelOpen = false;
  private workCentersCache: WorkCenterDocument[] = [];
  private workOrdersCache: WorkOrderDocument[] = [];

  private readonly totalColumns = 60;

  constructor(
    private scheduleService: ScheduleService,
    private timelineService: TimelineService,
    private validationService: ValidationService
  ) {}

  ngOnInit(): void {
    this.workCenters$ = this.scheduleService.getWorkCenters();
    this.workOrders$ = this.scheduleService.getWorkOrders();
    this.columnWidth$ = this.timelineService.getColumnWidth();
    this.visibleStartDate$ = this.timelineService.getVisibleStartDate();
    
    // Cache data for synchronous access
    this.workCenters$.subscribe(centers => this.workCentersCache = centers);
    this.workOrders$.subscribe(orders => this.workOrdersCache = orders);
    
    this.totalWidth$ = this.columnWidth$.pipe(
      map(columnWidth => this.totalColumns * columnWidth)
    );
    
    this.dateColumns$ = combineLatest([
      this.timelineService.getVisibleStartDate(),
      this.timelineService.getColumnWidth()
    ]).pipe(
      map(([startDate, columnWidth]) => this.generateDateColumns(startDate, columnWidth))
    );

    this.currentDayPosition$ = combineLatest([
      this.timelineService.getVisibleStartDate(),
      this.timelineService.getColumnWidth()
    ]).pipe(
      map(([startDate, columnWidth]) => 
        this.timelineService.getCurrentDayPosition(startDate, columnWidth)
      )
    );
  }

  onGridCellClicked(event: GridCellClickEvent): void {
    const startDate = this.timelineService.formatDateToISO(event.clickedDate);
    const endDateObj = new Date(event.clickedDate);
    endDateObj.setDate(endDateObj.getDate() + 7);
    const endDate = this.timelineService.formatDateToISO(endDateObj);

    this.isPanelOpen = true;
    
    // Use setTimeout to ensure panel is rendered before setting data
    setTimeout(() => {
      this.schedulePanel.setInitialData({
        name: '',
        workCenterId: event.workCenterId,
        status: 'open',
        startDate,
        endDate
      });
    });
  }

  onScheduleSaved(formData: ScheduleFormData): void {
    // Validate overlap
    const validation = this.validationService.checkOverlap(
      formData.workCenterId,
      formData.startDate,
      formData.endDate,
      this.workOrdersCache
    );

    if (validation.hasOverlap) {
      const conflictNames = validation.conflictingOrders
        .map(o => o.data.name)
        .join(', ');
      this.schedulePanel.setOverlapError(
        `This work order overlaps with existing orders: ${conflictNames}`
      );
      return;
    }

    // Create new work order
    const newWorkOrder: WorkOrderDocument = {
      docId: this.scheduleService.generateWorkOrderId(formData.workCenterId),
      docType: 'workOrder',
      data: {
        name: formData.name,
        workCenterId: formData.workCenterId,
        status: formData.status,
        startDate: formData.startDate,
        endDate: formData.endDate
      }
    };

    this.scheduleService.addWorkOrder(newWorkOrder);
    this.isPanelOpen = false;
    this.schedulePanel.resetSaving();
  }

  onScheduleCancelled(): void {
    this.isPanelOpen = false;
  }

  private generateDateColumns(startDate: Date, columnWidth: number): DateColumn[] {
    const columns: DateColumn[] = [];
    
    for (let i = 0; i < this.totalColumns; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      columns.push({
        date,
        label: this.formatDateLabel(date),
        position: i * columnWidth
      });
    }
    
    return columns;
  }

  private formatDateLabel(date: Date): string {
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  }
}
