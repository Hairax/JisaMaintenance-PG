import { CostCenter } from '../../cost-centers/entities/cost-center.entity.js';
export declare class Process {
  id: number;
  costCenter: CostCenter;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}
