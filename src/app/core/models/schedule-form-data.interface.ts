import { WorkOrderStatus } from './work-order-status.type';

export interface ScheduleFormData {
  name: string;
  workCenterId: string;
  status: WorkOrderStatus;
  startDate: string;
  endDate: string;
}
