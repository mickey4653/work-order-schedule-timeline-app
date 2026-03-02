import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { WorkCenterDocument, WorkOrderDocument, WorkOrderStatus } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  private readonly workCenters$ = new BehaviorSubject<WorkCenterDocument[]>([]);
  private readonly workOrders$ = new BehaviorSubject<WorkOrderDocument[]>([]);

  constructor() {
    this.initializeData();
  }

  getWorkCenters(): Observable<WorkCenterDocument[]> {
    return this.workCenters$.asObservable();
  }

  getWorkOrders(): Observable<WorkOrderDocument[]> {
    return this.workOrders$.asObservable();
  }

  /**
   * Add a new work order
   */
  addWorkOrder(workOrder: WorkOrderDocument): void {
    const currentOrders = this.workOrders$.value;
    this.workOrders$.next([...currentOrders, workOrder]);
  }

  /**
   * Generate unique work order ID
   */
  generateWorkOrderId(workCenterId: string): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `wo-${workCenterId}-${timestamp}-${random}`;
  }

  private initializeData(): void {
    const workCenters = this.generateWorkCenters();
    const workOrders = this.generateDeterministicWorkOrders(workCenters, 100);
    
    this.workCenters$.next(workCenters);
    this.workOrders$.next(workOrders);
  }

  private generateWorkCenters(): WorkCenterDocument[] {
    return [
      { docId: 'wc-001', docType: 'workCenter', data: { name: 'Assembly Line A' } },
      { docId: 'wc-002', docType: 'workCenter', data: { name: 'Assembly Line B' } },
      { docId: 'wc-003', docType: 'workCenter', data: { name: 'Welding Station' } },
      { docId: 'wc-004', docType: 'workCenter', data: { name: 'Paint Booth' } },
      { docId: 'wc-005', docType: 'workCenter', data: { name: 'Quality Control' } },
      { docId: 'wc-006', docType: 'workCenter', data: { name: 'Packaging Unit' } },
      { docId: 'wc-007', docType: 'workCenter', data: { name: 'Shipping Dock' } }
    ];
  }

  private generateDeterministicWorkOrders(
    workCenters: WorkCenterDocument[],
    perCenter: number = 100
  ): WorkOrderDocument[] {
    const workOrders: WorkOrderDocument[] = [];
    const statuses: WorkOrderStatus[] = ['open', 'in-progress', 'complete', 'blocked'];
    
    const startOfYear = new Date('2025-01-01');
    const endOfYear = new Date('2025-12-31');

    workCenters.forEach((center, centerIndex) => {
      let currentDate = new Date(startOfYear);
      
      for (let i = 0; i < perCenter; i++) {
        const orderNumber = (i + 1).toString().padStart(4, '0');
        const statusIndex = i % statuses.length;
        const status = statuses[statusIndex];
        
        // Deterministic duration: 1-5 days based on order index
        const duration = (i % 5) + 1;
        
        const startDate = new Date(currentDate);
        const endDate = new Date(currentDate);
        endDate.setDate(endDate.getDate() + duration);
        
        workOrders.push({
          docId: `wo-${center.docId}-${orderNumber}`,
          docType: 'workOrder',
          data: {
            name: `WO-${centerIndex + 1}-${orderNumber}`,
            workCenterId: center.docId,
            status,
            startDate: this.formatDate(startDate),
            endDate: this.formatDate(endDate)
          }
        });
        
        // Move to next start date (no overlap)
        currentDate = new Date(endDate);
        currentDate.setDate(currentDate.getDate() + 1);
        
        // Wrap around if we exceed 2025
        if (currentDate > endOfYear) {
          currentDate = new Date(startOfYear);
        }
      }
    });

    return workOrders;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
