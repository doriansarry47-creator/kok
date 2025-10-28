import { pool } from '../config/database';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const seed = async () => {
  try {
    console.log('🌱 Initialisation des données...');

    // Créer le compte admin principal : doriansarry@yahoo.fr
    const mainAdminId = uuidv4();
    const mainAdminEmail = 'doriansarry@yahoo.fr';
    const mainAdminPassword = 'admin123';
    const mainAdminPasswordHash = await bcrypt.hash(mainAdminPassword, 12);

    // Vérifier si l'admin principal existe déjà
    const existingMainAdmin = await pool.query('SELECT id FROM users WHERE email = $1', [mainAdminEmail]);

    if (existingMainAdmin.rows.length === 0) {
      await pool.query(
        `INSERT INTO users (id, email, password_hash, role, first_name, last_name, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [mainAdminId, mainAdminEmail, mainAdminPasswordHash, 'admin', 'Dorian', 'Sarry', true]
      );
      console.log(`✅ Compte admin principal créé: ${mainAdminEmail}`);
      console.log(`🔑 Mot de passe: ${mainAdminPassword}`);
    } else {
      console.log('ℹ️  Compte admin principal déjà existant');
    }

    // Créer un compte admin secondaire depuis les variables d'environnement
    const adminId = uuidv4();
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@therapie-sensorimotrice.fr';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
    const adminPasswordHash = await bcrypt.hash(adminPassword, 12);

    // Vérifier si l'admin existe déjà
    const existingAdmin = await pool.query('SELECT id FROM users WHERE email = $1', [adminEmail]);

    if (existingAdmin.rows.length === 0) {
      await pool.query(
        `INSERT INTO users (id, email, password_hash, role, first_name, last_name, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [adminId, adminEmail, adminPasswordHash, 'admin', 'Admin', 'Système', true]
      );
      console.log(`✅ Compte admin secondaire créé: ${adminEmail}`);
      console.log(`🔑 Mot de passe: ${adminPassword}`);
    } else {
      console.log('ℹ️  Compte admin secondaire déjà existant');
    }

    // Créer des disponibilités par défaut (Lundi à Vendredi, 9h-12h et 14h-18h)
    const availabilities = [
      // Lundi
      { day: 1, start: '09:00', end: '12:00', duration: 45 },
      { day: 1, start: '14:00', end: '18:00', duration: 45 },
      // Mardi
      { day: 2, start: '09:00', end: '12:00', duration: 45 },
      { day: 2, start: '14:00', end: '18:00', duration: 45 },
      // Mercredi
      { day: 3, start: '09:00', end: '12:00', duration: 45 },
      { day: 3, start: '14:00', end: '18:00', duration: 45 },
      // Jeudi
      { day: 4, start: '09:00', end: '12:00', duration: 45 },
      { day: 4, start: '14:00', end: '18:00', duration: 45 },
      // Vendredi
      { day: 5, start: '09:00', end: '12:00', duration: 45 },
      { day: 5, start: '14:00', end: '18:00', duration: 45 },
    ];

    for (const avail of availabilities) {
      const existing = await pool.query(
        'SELECT id FROM availabilities WHERE day_of_week = $1 AND start_time = $2',
        [avail.day, avail.start]
      );

      if (existing.rows.length === 0) {
        await pool.query(
          `INSERT INTO availabilities (id, day_of_week, start_time, end_time, slot_duration, is_active)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [uuidv4(), avail.day, avail.start, avail.end, avail.duration, true]
        );
      }
    }

    console.log('✅ Disponibilités par défaut créées (Lun-Ven 9h-12h et 14h-18h, créneaux de 45min)');

    console.log('\n🎉 Initialisation terminée avec succès!');
    console.log('\n📝 Informations de connexion admin principal:');
    console.log(`   Email: ${mainAdminEmail}`);
    console.log(`   Mot de passe: ${mainAdminPassword}`);
    console.log('\n📝 Informations de connexion admin secondaire:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Mot de passe: ${adminPassword}`);
    console.log('\n⚠️  Changez les mots de passe admin après la première connexion!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    process.exit(1);
  }
};

seed();
