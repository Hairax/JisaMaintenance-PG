import { DataSource } from 'typeorm';
import { CostCenter } from '../cost-centers/entities/cost-center.entity';
import { Process } from '../process/entities/process.entity';
import { Proveedor } from 'src/proveedor/entities/proveedor.entity';
import { Maquina } from 'src/maquina/entities/maquina.entity';
import { SubUnidad } from 'src/subUnidad/entitites/subUnidad.entity';
import { Repuesto } from 'src/repuesto/entities/repuesto.entity';
import { RepuestoMaquina } from 'src/repuesto-maquina/entities/repuesto-maquina.entity';
import { Compra } from '../compra/entities/compra.entity';
import { CompraDetalle } from '../compra/entities/compra-detalle.entity';
import { Salida } from '../salida/entities/salida.entity';
import { SalidaDetalle } from '../salida/entities/salida-detalle.entity';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'mysql',
        host: 'localhost',
        port: 3010,
        username: 'root',
        password: 'password_core_db',
        database: 'core_db',
        entities: [
          CostCenter,
          Process,
          Proveedor,
          Maquina,
          SubUnidad,
          Repuesto,
          RepuestoMaquina,
          Compra,
          CompraDetalle,
          Salida,
          SalidaDetalle,
        ],
        synchronize: true,
      });
      return dataSource.initialize();
    },
  },
];
