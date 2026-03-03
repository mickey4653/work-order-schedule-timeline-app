import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, OnInit, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
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
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule, NgbDatepickerModule],
  templateUrl: './schedule-panel.component.html',
  styleUrls: ['./schedule-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
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

  /**
   * Convert ISO date string (YYYY-MM-DD) to NgbDateStruct
   */
  private isoToNgbDate(isoDate: string): NgbDateStruct | null {
    if (!isoDate) return null;
    const parts = isoDate.split('-');
    if (parts.length !== 3) return null;
    return {
      year: parseInt(parts[0], 10),
      month: parseInt(parts[1], 10),
      day: parseInt(parts[2], 10)
    };
  }

  /**
   * Convert NgbDateStruct to ISO date string (YYYY-MM-DD)
   */
  private ngbDateToIso(date: NgbDateStruct | null): string {
    if (!date) return '';
    const year = date.year;
    const month = date.month.toString().padStart(2, '0');
    const day = date.day.toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

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
    
    // Convert ISO dates to NgbDateStruct for datepicker
    const formData = {
      ...data,
      startDate: data.startDate ? this.isoToNgbDate(data.startDate) : null,
      endDate: data.endDate ? this.isoToNgbDate(data.endDate) : null
    };
    
    this.form.patchValue(formData);
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
    
    // Convert NgbDateStruct to ISO format
    const formValue = this.form.value;
    const formData: ScheduleFormData = {
      name: formValue.name,
      workCenterId: formValue.workCenterId,
      status: formValue.status,
      startDate: this.ngbDateToIso(formValue.startDate),
      endDate: this.ngbDateToIso(formValue.endDate)
    };
    
    this.saved.emit(formData);
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
}
