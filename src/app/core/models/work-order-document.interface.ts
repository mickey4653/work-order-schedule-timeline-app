import { WorkOrderStatus } from './work-order-status.type';

export interface WorkOrderDocument {
  docId: string;
  docType: 'workOrder';
  data: {
    name: string;
    workCenterId: string;
    status: WorkOrderStatus;
    startDate: string; // ISO yyyy-mm-dd
    endDate: string;   // ISO yyyy-mm-dd
  };
}
