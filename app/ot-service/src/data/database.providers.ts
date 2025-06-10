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
        ],
        synchronize: true,
      });

      return dataSource.initialize();
    },
  },
];
