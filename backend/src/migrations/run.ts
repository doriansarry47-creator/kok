import { pool } from '../config/database';
import fs from 'fs';
import path from 'path';

const runMigrations = async () => {
  try {
    console.log('🔄 Exécution des migrations...');

    const migrationFile = path.join(__dirname, '001_initial_schema.sql');
    const sql = fs.readFileSync(migrationFile, 'utf8');

    await pool.query(sql);

    console.log('✅ Migrations exécutées avec succès');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors des migrations:', error);
    process.exit(1);
  }
};

runMigrations();
