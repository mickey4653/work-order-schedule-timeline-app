import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { WorkCenterDocument, WorkOrderDocument } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  private readonly workCenters$ = new BehaviorSubject<WorkCenterDocument[]>([]);
  private readonly workOrders$ = new BehaviorSubject<WorkOrderDocument[]>([]);
  private workOrderCounter = 1000; // Start counter after initial dataset

  constructor(private http: HttpClient) {
    this.loadDataFromJSON();
  }

  /**
   * Load sample data from JSON file
   */
  private loadDataFromJSON(): void {
    this.http.get<{ workCenters: WorkCenterDocument[], workOrders: WorkOrderDocument[] }>('assets/sample-data.json')
      .pipe(
        tap(data => {
          this.workCenters$.next(data.workCenters);
          this.workOrders$.next(data.workOrders);
          
          // Set counter based on existing work orders
          if (data.workOrders.length > 0) {
            const maxId = Math.max(...data.workOrders.map(wo => {
              const match = wo.docId.match(/wo-(\d+)/);
              return match ? parseInt(match[1], 10) : 0;
            }));
            this.workOrderCounter = maxId + 1;
          }
        })
      )
      .subscribe();
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
   * Update an existing work order
   */
  updateWorkOrder(workOrder: WorkOrderDocument): void {
    const currentOrders = this.workOrders$.value;
    const updatedOrders = currentOrders.map(order => 
      order.docId === workOrder.docId ? workOrder : order
    );
    this.workOrders$.next(updatedOrders);
  }

  /**
   * Delete a work order by ID
   */
  deleteWorkOrder(docId: string): void {
    const currentOrders = this.workOrders$.value;
    const filteredOrders = currentOrders.filter(order => order.docId !== docId);
    this.workOrders$.next(filteredOrders);
  }

  /**
   * Generate unique work order ID (deterministic)
   */
  generateWorkOrderId(workCenterId: string): string {
    const id = `wo-${this.workOrderCounter.toString().padStart(4, '0')}`;
    this.workOrderCounter++;
    return id;
  }
}
