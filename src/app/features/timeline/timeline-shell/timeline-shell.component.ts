import { Component, ChangeDetectionStrategy, OnInit, ViewChild, OnDestroy, ChangeDetectorRef, ViewEncapsulation, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
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
  imports: [CommonModule, NgSelectModule, NgbTooltipModule, FormsModule, TimelineGridComponent, SchedulePanelComponent],
  templateUrl: './timeline-shell.component.html',
  styleUrl: './timeline-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class TimelineShellComponent implements OnInit, OnDestroy {
  @ViewChild(SchedulePanelComponent) schedulePanel!: SchedulePanelComponent;
  @ViewChild('timelineScrollContainer', { read: ElementRef }) timelineScrollContainer!: ElementRef<HTMLElement>;
  @ViewChild('timelineHeader', { read: ElementRef }) timelineHeader!: ElementRef<HTMLElement>;

  workCenters$!: Observable<WorkCenterDocument[]>;
  workOrders$!: Observable<WorkOrderDocument[]>;
  dateColumns$!: Observable<DateColumn[]>;
  currentDayPosition$!: Observable<number>;
  columnWidth$!: Observable<number>;
  visibleStartDate$!: Observable<Date>;
  totalWidth$!: Observable<number>;
  currentZoomLevel$!: Observable<ZoomLevel>;

  isPanelOpen = false;
  selectedZoomLevel: ZoomLevel = 'day';
  private workCentersCache: WorkCenterDocument[] = [];
  private workOrdersCache: WorkOrderDocument[] = [];
  private editingWorkOrderId: string | null = null;

  private totalColumns = 60;
  private isLoadingMore = false;
  
  readonly zoomLevels = [
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
    
    // Set initial selected zoom level
    this.currentZoomLevel$.subscribe(level => {
      this.selectedZoomLevel = level;
      this.cdr.markForCheck();
    });
    
    // Cache data for synchronous access
    this.workCenters$.subscribe(centers => this.workCentersCache = centers);
    this.workOrders$.subscribe(orders => this.workOrdersCache = orders);
    
    this.totalWidth$ = this.columnWidth$.pipe(
      map(columnWidth => this.totalColumns * columnWidth)
    );
    
    this.dateColumns$ = combineLatest([
      this.timelineService.getVisibleStartDate(),
      this.timelineService.getColumnWidth(),
      this.timelineService.getZoomLevel()
    ]).pipe(
      map(([startDate, columnWidth, zoomLevel]) => this.generateDateColumns(startDate, columnWidth, zoomLevel))
    );

    this.currentDayPosition$ = combineLatest([
      this.timelineService.getVisibleStartDate(),
      this.timelineService.getColumnWidth(),
      this.timelineService.getZoomLevel()
    ]).pipe(
      map(([startDate, columnWidth, zoomLevel]) => 
        this.timelineService.getCurrentDayPosition(startDate, columnWidth, zoomLevel)
      )
    );
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  onZoomLevelChange(level: ZoomLevel): void {
    this.selectedZoomLevel = level;
    this.timelineService.setZoomLevel(level);
  }

  scrollToToday(): void {
    const today = new Date();
    
    // Get current values synchronously
    let currentStartDate!: Date;
    let currentColumnWidth!: number;
    let currentZoomLevel!: ZoomLevel;
    
    this.visibleStartDate$.subscribe(date => currentStartDate = date).unsubscribe();
    this.columnWidth$.subscribe(width => currentColumnWidth = width).unsubscribe();
    this.currentZoomLevel$.subscribe(level => currentZoomLevel = level).unsubscribe();
    
    // Calculate today's position in pixels (zoom-aware)
    const todayPosition = this.timelineService.dateToPosition(today, currentStartDate, currentColumnWidth, currentZoomLevel);
    
    // Scroll the timeline container to center today's position
    setTimeout(() => {
      if (this.timelineScrollContainer && this.timelineScrollContainer.nativeElement) {
        const container = this.timelineScrollContainer.nativeElement;
        const containerWidth = container.clientWidth;
        
        // Center today's date in the viewport
        const scrollPosition = todayPosition - (containerWidth / 2);
        
        // Smooth scroll to position
        container.scrollTo({
          left: Math.max(0, scrollPosition),
          behavior: 'smooth'
        });
      }
    }, 0);
  }

  onTimelineScroll(event: Event): void {
    const container = event.target as HTMLElement;
    const scrollLeft = container.scrollLeft;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;
    
    // Sync header scroll with grid scroll
    if (this.timelineHeader && this.timelineHeader.nativeElement) {
      this.timelineHeader.nativeElement.scrollLeft = scrollLeft;
    }
    
    // Load more columns when scrolling near the end (within 500px)
    if (scrollWidth - (scrollLeft + clientWidth) < 500 && !this.isLoadingMore) {
      this.loadMoreColumns();
    }
  }

  private loadMoreColumns(): void {
    this.isLoadingMore = true;
    
    // Add 30 more columns
    this.totalColumns += 30;
    
    // Trigger recalculation
    this.totalWidth$ = this.columnWidth$.pipe(
      map(columnWidth => this.totalColumns * columnWidth)
    );
    
    this.dateColumns$ = combineLatest([
      this.timelineService.getVisibleStartDate(),
      this.timelineService.getColumnWidth(),
      this.timelineService.getZoomLevel()
    ]).pipe(
      map(([startDate, columnWidth, zoomLevel]) => this.generateDateColumns(startDate, columnWidth, zoomLevel))
    );
    
    this.cdr.markForCheck();
    
    // Reset loading flag after a short delay
    setTimeout(() => {
      this.isLoadingMore = false;
    }, 300);
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

  private generateDateColumns(startDate: Date, columnWidth: number, zoomLevel: ZoomLevel): DateColumn[] {
    const columns: DateColumn[] = [];
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    let currentMonthBadgeShown = false;
    
    for (let i = 0; i < this.totalColumns; i++) {
      const date = new Date(startDate);
      
      // Increment date based on zoom level
      switch (zoomLevel) {
        case 'day':
          date.setDate(date.getDate() + i);
          break;
        case 'week':
          date.setDate(date.getDate() + (i * 7));
          break;
        case 'month':
          date.setMonth(date.getMonth() + i);
          break;
      }
      
      // Show badge only on the first occurrence of the current month
      const isCurrentMonth = !currentMonthBadgeShown && 
                            date.getMonth() === currentMonth && 
                            date.getFullYear() === currentYear;
      
      if (isCurrentMonth) {
        currentMonthBadgeShown = true;
      }
      
      columns.push({
        date,
        label: this.formatDateLabel(date, zoomLevel),
        position: i * columnWidth,
        isCurrentMonth
      });
    }
    
    return columns;
  }

  private formatDateLabel(date: Date, zoomLevel: ZoomLevel): string {
    switch (zoomLevel) {
      case 'day':
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        const day = date.getDate();
        return `${month} ${day}`;
      case 'week':
        const weekStart = new Date(date);
        const weekEnd = new Date(date);
        weekEnd.setDate(weekEnd.getDate() + 6);
        return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      case 'month':
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      default:
        return '';
    }
  }
}
