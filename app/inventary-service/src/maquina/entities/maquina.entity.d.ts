import { CostCenter } from '../../cost-centers/entities/cost-center.entity';
import { Process } from '../../process/entities/process.entity';
import { Proveedor } from '../../proveedor/entities/proveedor.entity';
export declare class Maquina {
    id: number;
    costCenter: CostCenter;
    process: Process;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    fabricante: string;
    tipoDeMaquina: string;
    numeroDeSerie: string;
    fechaDeFabricacion: Date;
    fechaDeMontaje: Date;
    costo: number;
    horasTrabajadas: number;
    proveedor: Proveedor;
}
