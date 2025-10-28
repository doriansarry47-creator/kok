import { pool } from '../config/database';
import fs from 'fs';
import path from 'path';

const runMigrations = async () => {
  try {
    console.log('🔄 Exécution des migrations...');

    // Exécuter toutes les migrations SQL dans l'ordre
    const migrations = [
      '001_initial_schema.sql',
      '002_add_settings.sql'
    ];

    for (const migration of migrations) {
      console.log(`  → Exécution de ${migration}...`);
      const migrationFile = path.join(__dirname, migration);
      
      if (fs.existsSync(migrationFile)) {
        const sql = fs.readFileSync(migrationFile, 'utf8');
        await pool.query(sql);
        console.log(`  ✅ ${migration} terminée`);
      } else {
        console.log(`  ⚠️  ${migration} non trouvée, ignorée`);
      }
    }

    console.log('✅ Toutes les migrations ont été exécutées avec succès');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors des migrations:', error);
    process.exit(1);
  }
};

runMigrations();
