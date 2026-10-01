import { config } from 'dotenv';
import { resolve } from 'path';

// Carga el .env de la carpeta de ESTE servicio (app/<servicio>/.env), sin
// importar desde dónde se lance el proceso. Con 'dotenv/config' se buscaba en
// la carpeta actual: lanzado con pm2 desde la raíz del repo, el .env se
// ignoraba (ej. CORS_ORIGINS) y se usaban los valores por defecto.
// __dirname es app/<servicio>/dist en ejecución. Las variables ya definidas en
// el entorno tienen prioridad sobre el .env.
config({ path: resolve(__dirname, '..', '.env') });
