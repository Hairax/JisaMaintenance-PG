import '../load-env';
import { DataSource } from 'typeorm';
import { migracionesPreviasASync } from './pre-sync-migrations';

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
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        // synchronize manual (abajo), después de las migraciones previas.
        synchronize: false,
      });

      await dataSource.initialize();
      await migracionesPreviasASync(dataSource);
      await dataSource.synchronize();
      return dataSource;
    },
  },
];
