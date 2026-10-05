import { DataSource } from 'typeorm';

// Migraciones que deben correr ANTES de `synchronize`.
//
// Cuando cambia el tipo de una columna, TypeORM (MySQL) la borra y la vuelve a
// crear: los datos se pierden. Para los cambios de tipo, la columna se
// convierte acá con ALTER ... MODIFY (que conserva los valores) y recién
// después corre `synchronize`, que ya la encuentra con el tipo correcto.
// Idempotente: si ya está migrada, no hace nada. auth-service, users-service
// y ot-service mapean la tabla `user` y llevan esta misma función, así que no
// importa cuál arranque primero.
export async function migracionesPreviasASync(ds: DataSource): Promise<void> {
  // Tarifas de mano de obra (hora$ / minutos$): INT -> DECIMAL(12,6), para
  // aceptar decimales (ej. 45.5 Bs/h, 0.758333 Bs/min).
  const columnas: { COLUMN_NAME: string; DATA_TYPE: string }[] = await ds.query(
    `SELECT COLUMN_NAME, DATA_TYPE FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user'
         AND COLUMN_NAME IN ('hora$', 'minutos$')`,
  );
  for (const c of columnas) {
    if (c.DATA_TYPE.toLowerCase() !== 'decimal') {
      await ds.query(
        `ALTER TABLE \`user\` MODIFY \`${c.COLUMN_NAME}\` DECIMAL(12,6) NOT NULL DEFAULT 0`,
      );
      console.log(
        `Migración: user.${c.COLUMN_NAME} convertido a DECIMAL(12,6)`,
      );
    }
  }
}
