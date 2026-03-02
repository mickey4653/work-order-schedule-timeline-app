import { Injectable } from '@angular/core';
import { WorkOrderDocument } from '../models';

export interface OverlapValidationResult {
  hasOverlap: boolean;
  conflictingOrders: WorkOrderDocument[];
}

/**
 * ValidationService
 * 
 * Business logic for schedule validation.
 * Handles overlap detection and date validation.
 */
@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  /**
   * Check if a work order overlaps with existing orders in the same work center
   */
  checkOverlap(
    workCenterId: string,
    startDate: string,
    endDate: string,
    existingOrders: WorkOrderDocument[],
    excludeOrderId?: string
  ): OverlapValidationResult {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const conflictingOrders = existingOrders.filter(order => {
      // Skip if it's the same order (for edit mode)
      if (excludeOrderId && order.docId === excludeOrderId) {
        return false;
      }

      // Only check orders in the same work center
      if (order.data.workCenterId !== workCenterId) {
        return false;
      }

      const orderStart = new Date(order.data.startDate);
      const orderEnd = new Date(order.data.endDate);

      // Check for overlap: (start < orderEnd) AND (end > orderStart)
      return start < orderEnd && end > orderStart;
    });

    return {
      hasOverlap: conflictingOrders.length > 0,
      conflictingOrders
    };
  }

  /**
   * Validate that end date is after start date
   */
  validateDateRange(startDate: string, endDate: string): boolean {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return end > start;
  }
}
