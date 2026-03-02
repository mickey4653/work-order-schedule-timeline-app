import { Component, ChangeDetectionStrategy, OnInit, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScheduleService } from '../../../core/services/schedule.service';
import { TimelineService } from '../../../core/services/timeline.service';
import { ValidationService } from '../../../core/services/validation.service';
import { WorkCenterDocument, WorkOrderDocument, ScheduleFormData, GridCellClickEvent, ZoomLevel } from '../../../core/models';
import { Observable, combineLatest, map } from 'rxjs';
import { TimelineGridComponent } from '../timeline-grid/timeline-grid.component';
import { SchedulePanelComponent } from '../schedule-panel/schedule-panel.component';

interface DateColumn {
  date: Date;
  label: string;
  position: number;
  isCurrentMonth?: boolean;
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
export class TimelineShellComponent implements OnInit, OnDestroy {
  @ViewChild(SchedulePanelComponent) schedulePanel!: SchedulePanelComponent;

  workCenters$!: Observable<WorkCenterDocument[]>;
  workOrders$!: Observable<WorkOrderDocument[]>;
  dateColumns$!: Observable<DateColumn[]>;
  currentDayPosition$!: Observable<number>;
  columnWidth$!: Observable<number>;
  visibleStartDate$!: Observable<Date>;
  totalWidth$!: Observable<number>;
  currentZoomLevel$!: Observable<ZoomLevel>;

  isPanelOpen = false;
  isDropdownOpen = false;
  private workCentersCache: WorkCenterDocument[] = [];
  private workOrdersCache: WorkOrderDocument[] = [];
  private editingWorkOrderId: string | null = null;

  private readonly totalColumns = 60;
  
  readonly zoomLevels = [
    { value: 'hour' as ZoomLevel, label: 'Hour' },
    { value: 'day' as ZoomLevel, label: 'Day' },
    { value: 'week' as ZoomLevel, label: 'Week' },
    { value: 'month' as ZoomLevel, label: 'Month' }
  ];

  constructor(
    private scheduleService: ScheduleService,
    private timelineService: TimelineService,
    private validationService: ValidationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.workCenters$ = this.scheduleService.getWorkCenters();
    this.workOrders$ = this.scheduleService.getWorkOrders();
    this.columnWidth$ = this.timelineService.getColumnWidth();
    this.visibleStartDate$ = this.timelineService.getVisibleStartDate();
    this.currentZoomLevel$ = this.timelineService.getZoomLevel();
    
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

  ngOnDestroy(): void {
    if (this.clickOutsideHandler) {
      document.removeEventListener('click', this.clickOutsideHandler);
    }
  }

  onZoomLevelChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const zoomLevel = select.value as ZoomLevel;
    this.timelineService.setZoomLevel(zoomLevel);
  }

  toggleDropdownWithStop(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
    
    // Delay attaching click-outside listener to prevent immediate closure
    if (this.isDropdownOpen) {
      setTimeout(() => {
        this.attachClickOutsideListener();
      }, 100);
    } else {
      // Remove listener when closing
      if (this.clickOutsideHandler) {
        document.removeEventListener('click', this.clickOutsideHandler);
        this.clickOutsideHandler = null;
      }
    }
    
    this.cdr.markForCheck();
  }

  private clickOutsideHandler: ((event: MouseEvent) => void) | null = null;

  private attachClickOutsideListener(): void {
    if (this.clickOutsideHandler) {
      document.removeEventListener('click', this.clickOutsideHandler);
    }
    
    this.clickOutsideHandler = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.custom-dropdown')) {
        this.isDropdownOpen = false;
        this.cdr.markForCheck();
        if (this.clickOutsideHandler) {
          document.removeEventListener('click', this.clickOutsideHandler);
          this.clickOutsideHandler = null;
        }
      }
    };
    
    document.addEventListener('click', this.clickOutsideHandler);
  }

  selectZoomLevel(level: ZoomLevel): void {
    this.timelineService.setZoomLevel(level);
    this.isDropdownOpen = false;
    this.cdr.markForCheck();
  }

  selectZoomLevelWithStop(event: Event, level: ZoomLevel): void {
    event.stopPropagation();
    this.selectZoomLevel(level);
  }

  getZoomLevelLabel(level: ZoomLevel | null): string {
    if (!level) return 'Day';
    const found = this.zoomLevels.find(z => z.value === level);
    return found ? found.label : 'Day';
  }

  onGridCellClicked(event: GridCellClickEvent): void {
    const startDate = this.timelineService.formatDateToISO(event.clickedDate);
    const endDateObj = new Date(event.clickedDate);
    endDateObj.setDate(endDateObj.getDate() + 7);
    const endDate = this.timelineService.formatDateToISO(endDateObj);

    this.editingWorkOrderId = null;
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

  onWorkOrderEdit(workOrder: WorkOrderDocument): void {
    this.editingWorkOrderId = workOrder.docId;
    this.isPanelOpen = true;
    
    setTimeout(() => {
      this.schedulePanel.setInitialData({
        name: workOrder.data.name,
        workCenterId: workOrder.data.workCenterId,
        status: workOrder.data.status,
        startDate: workOrder.data.startDate,
        endDate: workOrder.data.endDate
      }, workOrder.docId);
    });
  }

  onWorkOrderDelete(workOrder: WorkOrderDocument): void {
    this.scheduleService.deleteWorkOrder(workOrder.docId);
  }

  onScheduleSaved(formData: ScheduleFormData): void {
    // Check if editing or creating
    if (this.editingWorkOrderId) {
      // EDIT mode - update existing work order
      const existingOrder = this.workOrdersCache.find(o => o.docId === this.editingWorkOrderId);
      
      if (!existingOrder) {
        return;
      }

      // Validate overlap (exclude current work order)
      const validation = this.validationService.checkOverlap(
        formData.workCenterId,
        formData.startDate,
        formData.endDate,
        this.workOrdersCache.filter(o => o.docId !== this.editingWorkOrderId)
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

      // Update work order
      const updatedWorkOrder: WorkOrderDocument = {
        ...existingOrder,
        data: {
          name: formData.name,
          workCenterId: formData.workCenterId,
          status: formData.status,
          startDate: formData.startDate,
          endDate: formData.endDate
        }
      };

      this.scheduleService.updateWorkOrder(updatedWorkOrder);
    } else {
      // CREATE mode - add new work order
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
    }

    this.isPanelOpen = false;
    this.editingWorkOrderId = null;
    this.schedulePanel.resetSaving();
  }

  onScheduleCancelled(): void {
    this.isPanelOpen = false;
    this.editingWorkOrderId = null;
  }

  private generateDateColumns(startDate: Date, columnWidth: number): DateColumn[] {
    const columns: DateColumn[] = [];
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    let currentMonthBadgeShown = false;
    
    for (let i = 0; i < this.totalColumns; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Show badge only on the first occurrence of the current month
      const isCurrentMonth = !currentMonthBadgeShown && 
                            date.getMonth() === currentMonth && 
                            date.getFullYear() === currentYear;
      
      if (isCurrentMonth) {
        currentMonthBadgeShown = true;
      }
      
      columns.push({
        date,
        label: this.formatDateLabel(date),
        position: i * columnWidth,
        isCurrentMonth
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
