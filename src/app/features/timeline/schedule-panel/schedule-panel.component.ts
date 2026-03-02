import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { WorkCenterDocument, ScheduleFormData } from '../../../core/models';

/**
 * SchedulePanelComponent
 * 
 * Responsibility: Side panel for creating and editing work order schedules.
 * - Displays form for work order creation/editing
 * - Handles form validation and submission
 * - Shows work center selection (ng-select)
 * - Manages date/time pickers for scheduling
 * - Provides save/cancel actions
 */
@Component({
  selector: 'app-schedule-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './schedule-panel.component.html',
  styleUrls: ['./schedule-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SchedulePanelComponent implements OnInit {
  @Input() isOpen: boolean = false;
  @Input() workCenters: WorkCenterDocument[] = [];
  @Input() initialData: Partial<ScheduleFormData> | null = null;
  @Input() editingWorkOrderId: string | null = null; // Track if editing
  
  @Output() saved = new EventEmitter<ScheduleFormData>();
  @Output() cancelled = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  form!: FormGroup;
  overlapError: string | null = null;
  isSaving: boolean = false;
  isStatusDropdownOpen: boolean = false;

  readonly statusOptions = [
    { value: 'open', label: 'Open' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'complete', label: 'Complete' },
    { value: 'blocked', label: 'Blocked' }
  ];

  get isEditMode(): boolean {
    return !!this.editingWorkOrderId;
  }

  get panelTitle(): string {
    return this.isEditMode ? 'Edit Work Order' : 'Work Order Details';
  }

  get submitButtonText(): string {
    return this.isEditMode ? 'Update' : 'Create';
  }

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      workCenterId: ['', Validators.required],
      status: ['open', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    }, {
      validators: this.dateRangeValidator
    });

    // Pre-fill form if initial data provided
    if (this.initialData) {
      this.form.patchValue(this.initialData);
    }
  }

  private dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    const startDate = control.get('startDate')?.value;
    const endDate = control.get('endDate')?.value;

    if (!startDate || !endDate) {
      return null;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    return end > start ? null : { dateRange: true };
  }

  setInitialData(data: Partial<ScheduleFormData>, workOrderId?: string): void {
    this.editingWorkOrderId = workOrderId || null;
    this.form.patchValue(data);
    this.overlapError = null;
    this.cdr.markForCheck();
  }

  setOverlapError(error: string): void {
    this.overlapError = error;
    this.isSaving = false;
    this.cdr.markForCheck();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.overlapError = null;
    this.saved.emit(this.form.value);
  }

  onCancel(): void {
    this.form.reset({
      status: 'open'
    });
    this.overlapError = null;
    this.isSaving = false;
    this.editingWorkOrderId = null;
    this.cancelled.emit();
  }

  onBackdropClick(): void {
    this.onCancel();
  }

  resetSaving(): void {
    this.isSaving = false;
    this.cdr.markForCheck();
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

  toggleStatusDropdown(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.isStatusDropdownOpen = !this.isStatusDropdownOpen;
    
    if (this.isStatusDropdownOpen) {
      setTimeout(() => {
        this.attachStatusClickOutsideListener();
      }, 100);
    } else {
      this.removeStatusClickOutsideListener();
    }
    
    this.cdr.markForCheck();
  }

  selectStatus(event: Event, status: string): void {
    event.stopPropagation();
    this.form.patchValue({ status });
    this.isStatusDropdownOpen = false;
    this.removeStatusClickOutsideListener();
    this.cdr.markForCheck();
  }

  private statusClickOutsideHandler: ((event: MouseEvent) => void) | null = null;

  private attachStatusClickOutsideListener(): void {
    if (this.statusClickOutsideHandler) {
      document.removeEventListener('click', this.statusClickOutsideHandler);
    }
    
    this.statusClickOutsideHandler = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.custom-status-dropdown')) {
        this.isStatusDropdownOpen = false;
        this.cdr.markForCheck();
        this.removeStatusClickOutsideListener();
      }
    };
    
    document.addEventListener('click', this.statusClickOutsideHandler);
  }

  private removeStatusClickOutsideListener(): void {
    if (this.statusClickOutsideHandler) {
      document.removeEventListener('click', this.statusClickOutsideHandler);
      this.statusClickOutsideHandler = null;
    }
  }
}
