import 'dotenv/config';
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
import { UnidadMedida } from '../unidades-medida/entities/unidad-medida.entity';
import { Almacen } from 'src/almacen/entities/almacen.entity';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'mysql',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3010'),
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || 'password_core_db',
        database: process.env.DB_DATABASE || 'core_db',
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
          UnidadMedida,
          Almacen,
        ],
        synchronize: true,
      });
      return dataSource.initialize();
    },
  },
];
