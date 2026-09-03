import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { CostCenter } from './cost-center.entity';

// Esta entidad es una copia liviana de la de inventary-service (ambos
// servicios comparten la misma tabla física con synchronize:true). Debe
// declarar las mismas columnas e índices que su contraparte, o el
// synchronize de este servicio intenta "corregir" lo que no reconoce y
// puede romper el índice/columna que el otro servicio sí gestiona.
@Entity()
@Unique(['costCenter', 'correlativo'])
export class Process {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CostCenter)
  @JoinColumn({ name: 'centroCosto_id' })
  costCenter: CostCenter;

  @Column()
  name: string;

  @Column({ nullable: true, type: 'int' })
  correlativo?: number;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;
}
