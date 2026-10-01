import 'dotenv/config';
import { DataSource } from 'typeorm';
import { TipoMantenimiento } from '../tipoMantenimiento/entities/tipoMantenimiento.entity';
import { Departamento } from '../departamento/entities/departamento.entity';
import { Objeto } from '../objeto/entities/objeto.entity';
import { OrdenTrabajo } from 'src/ot/entities/ot.entity';
import { CostCenter } from '../ot/entities/cost-center.entity';
import { Process } from '../ot/entities/process.entity';
import { Maquina } from '../ot/entities/maquina.entity';
import { SubUnidad } from '../ot/entities/subUnidad.entity';
import { User } from '../ot/entities/user.entity';
import { Proveedor } from '../ot/entities/proveedor.entity';
import { Informe } from '../informe/entities/informe.entity';
import { InformeDetalle } from '../informe/entities/informe-detalle.entity';
import { ProgramacionOt } from '../programacion-ot/entities/programacion-ot.entity';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'mysql',
        // IPv4 explícito: 'localhost' puede resolverse a ::1 en Windows.
        host:
          !process.env.DB_HOST ||
          process.env.DB_HOST.trim().toLowerCase() === 'localhost'
            ? '127.0.0.1'
            : process.env.DB_HOST.trim(),
        port: parseInt(process.env.DB_PORT || '3010'),
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || 'password_core_db',
        database: process.env.DB_DATABASE || 'core_db',
        entities: [
          TipoMantenimiento,
          Departamento,
          Objeto,
          OrdenTrabajo,
          CostCenter,
          Process,
          Maquina,
          SubUnidad,
          User,
          Proveedor,
          Informe,
          InformeDetalle,
          ProgramacionOt,
        ],
        synchronize: true,
      });

      return dataSource.initialize();
    },
  },
];
