import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CostCenter } from '../../cost-centers/entities/cost-center.entity';
import { Process } from '../../process/entities/process.entity';
import { Proveedor } from '../../proveedor/entities/proveedor.entity';

@Entity()
export class Maquina {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CostCenter)
  @JoinColumn({ name: 'centroCosto_id' })
  costCenter: CostCenter;

  @ManyToOne(() => Process)
  @JoinColumn({ name: 'proceso_id' })
  process: Process;

  @Column()
  name: string;

  @Column({ nullable: true, type: 'int' })
  correlativo?: number;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;

  @Column()
  fabricante: string;

  @Column()
  tipoDeMaquina: string;

  @Column()
  numeroDeSerie: string;

  @Column()
  fechaDeFabricacion: Date;

  @Column()
  fechaDeMontaje: Date;

  @Column()
  costo: number;

  @Column()
  horasTrabajadas: number;

  @ManyToOne(() => Proveedor)
  @JoinColumn({ name: 'proveedor_id' })
  proveedor: Proveedor;
}
