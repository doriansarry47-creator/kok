# 👑 Panneau Administrateur KOK

## 📋 Vue d'ensemble

Le panneau administrateur de KOK permet une gestion complète de votre cabinet de thérapie sensorimotrice. Interface moderne, sécurisée et intuitive développée avec React, Next.js et TailwindCSS.

## 🔐 Connexion Administrateur

### Compte principal créé par défaut

```
Email: doriansarry@yahoo.fr
Mot de passe: admin123
```

### Compte secondaire (configurable via .env)

```
Email: admin@therapie-sensorimotrice.fr
Mot de passe: Admin123!
```

⚠️ **IMPORTANT** : Changez ces mots de passe après la première connexion !

## 🚀 Accès au panneau

1. **URL de connexion** : `http://localhost:3001/admin/login` (ou votre domaine en production)
2. Entrez vos identifiants administrateur
3. Vous serez redirigé vers le tableau de bord

## 📊 Fonctionnalités

### 1. Tableau de bord (`/admin/dashboard`)

Vue d'ensemble de l'activité du cabinet :
- **Total de patients** inscrits
- **Rendez-vous à venir** (7 prochains jours)
- **Rendez-vous du jour** avec détails complets
- **Annulations récentes** (7 derniers jours)

Affichage en temps réel avec actualisation automatique.

### 2. Gestion des Rendez-vous (`/admin/rendez-vous`)

**Fonctionnalités :**
- ✅ Liste complète de tous les rendez-vous
- ✅ Filtrage par statut (confirmé, en attente, annulé, terminé)
- ✅ Recherche par nom/email de patient
- ✅ Export CSV des rendez-vous
- ✅ Vue détaillée de chaque rendez-vous

**Colonnes affichées :**
- Patient (nom, prénom, email)
- Date du rendez-vous
- Horaire (début - fin)
- Statut avec badge coloré
- Contact (téléphone)

**Export CSV :**
Téléchargez tous les rendez-vous au format CSV pour analyse externe (Excel, Google Sheets, etc.)

### 3. Gestion des Disponibilités (`/admin/disponibilites`)

**Fonctionnalités :**
- ✅ Vue par jour de la semaine
- ✅ Affichage des plages horaires configurées
- ✅ Activation/désactivation des créneaux
- ✅ Suppression de disponibilités
- ✅ Durée des créneaux personnalisable

**Organisation :**
- Chaque jour de la semaine est affiché séparément
- Les créneaux actifs sont en vert
- Les créneaux inactifs sont en gris
- Possibilité d'avoir plusieurs plages par jour

### 4. Gestion des Patients (`/admin/patients`)

**Fonctionnalités :**
- ✅ Liste complète des patients inscrits
- ✅ Recherche multi-critères (nom, email, téléphone)
- ✅ Nombre de rendez-vous par patient
- ✅ Date d'inscription
- ✅ Suppression de compte patient (avec confirmation)
- ✅ Export CSV de la base patients

**Informations affichées :**
- Avatar avec initiale
- Nom et prénom
- Email
- Téléphone
- Date d'inscription
- Nombre total de rendez-vous

**Protection RGPD :**
La suppression d'un patient efface toutes ses données personnelles et ses rendez-vous (cascade).

### 5. Paramètres du Cabinet (`/admin/parametres`)

#### Informations générales
- **Nom du cabinet**
- **Adresse complète**
- **Email de contact**
- **Téléphone de contact**
- **Durée par défaut des créneaux** (en minutes)

#### Options
- ☑️ Activer les notifications par email
- ☑️ Autoriser la prise de rendez-vous en ligne

#### Sécurité
- 🔒 Changement de mot de passe administrateur
- Validation en temps réel
- Confirmation du nouveau mot de passe requise

## 🛡️ Sécurité

### Authentification
- **JWT (JSON Web Tokens)** pour la session
- **Tokens stockés localement** (localStorage)
- **Expiration automatique** après 7 jours
- **Vérification du rôle** à chaque requête

### Protection des routes
- ✅ Middleware `authenticate` : vérifie le token JWT
- ✅ Middleware `requireRole('admin')` : vérifie le rôle administrateur
- ✅ Redirection automatique vers `/admin/login` si non authentifié

### Audit et traçabilité
- 📝 Toutes les actions admin sont enregistrées dans `audit_logs`
- 📝 Conservation des logs : 14 jours (RGPD)
- 📝 Informations enregistrées : action, ressource, IP, timestamp

### Rate Limiting
- Protection contre les attaques par force brute
- Limitation du nombre de requêtes par IP

## 🎨 Interface Utilisateur

### Design
- **Palette de couleurs** : Tons terre, vert olive (#6b7c59), beige clair
- **Framework CSS** : TailwindCSS
- **Icônes** : Emojis natifs pour simplicité et performance
- **Responsive** : Optimisé pour desktop (administration)

### Navigation
- **Sidebar fixe** avec liens vers toutes les sections
- **Badges colorés** pour les statuts
- **Cartes (cards)** pour regrouper les informations
- **Tables** pour les listes de données

### Composants réutilisables
- Formulaires avec validation
- Boutons d'action avec états (loading, disabled)
- Modales de confirmation
- Messages de succès/erreur

## 📡 API Backend

### Routes Admin

Toutes les routes sont préfixées par `/api/admin` et protégées par authentification + rôle admin.

#### Dashboard
```http
GET /api/admin/dashboard
```
Retourne les statistiques du tableau de bord.

#### Rendez-vous
```http
GET /api/admin/bookings
GET /api/admin/bookings?status=confirmed&date_from=2024-01-01
POST /api/admin/bookings
GET /api/admin/bookings/export/csv
```

#### Patients
```http
GET /api/admin/patients
GET /api/admin/patients?search=jean
DELETE /api/admin/patients/:id
GET /api/admin/patients/export/csv
```

#### Paramètres
```http
GET /api/admin/settings
PUT /api/admin/settings
```

#### Sécurité
```http
PUT /api/admin/security/password
```

### Headers requis

```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Réponses

**Succès :**
```json
{
  "success": true,
  "data": { ... }
}
```

**Erreur :**
```json
{
  "success": false,
  "message": "Message d'erreur"
}
```

## 📧 Templates d'Emails

Les emails sont configurables via des templates HTML dans `backend/templates/emails/` :

1. **booking_confirmation.html** : Confirmation de rendez-vous
2. **booking_reminder.html** : Rappel de rendez-vous
3. **booking_cancellation.html** : Annulation de rendez-vous
4. **booking_modified.html** : Modification de rendez-vous

### Variables disponibles dans les templates

```handlebars
{{patient_first_name}}
{{patient_last_name}}
{{date}}
{{start_time}}
{{end_time}}
{{duration}}
{{reason}}
{{cabinet_name}}
{{cabinet_address}}
{{cabinet_phone}}
{{cabinet_email}}
{{booking_url}}
{{year}}
```

## 🗄️ Base de Données

### Nouvelle table : cabinet_settings

```sql
CREATE TABLE cabinet_settings (
    id UUID PRIMARY KEY,
    cabinet_name VARCHAR(255),
    address TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    logo_url TEXT,
    notification_enabled BOOLEAN DEFAULT true,
    reminder_days_before INTEGER DEFAULT 1,
    allow_online_booking BOOLEAN DEFAULT true,
    slot_duration_default INTEGER DEFAULT 60,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 Déploiement

### Installation et initialisation

```bash
# 1. Installer les dépendances
cd backend && npm install
cd frontend && npm install

# 2. Exécuter les migrations (inclut la nouvelle table)
cd backend && npm run migrate

# 3. Initialiser les données (crée les comptes admin)
cd backend && npm run seed

# 4. Démarrer les services
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev
```

### Avec Docker

```bash
# Tout en un
docker-compose up -d

# Migrations et seed
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed
```

## 🔧 Configuration

### Variables d'environnement

Ajoutez dans votre `.env` :

```env
# Admin principal (créé automatiquement)
# Note: le compte doriansarry@yahoo.fr est créé en dur dans le seed

# Admin secondaire (optionnel)
ADMIN_EMAIL=admin@therapie-sensorimotrice.fr
ADMIN_PASSWORD=Admin123!

# JWT
JWT_SECRET=votre-secret-jwt-super-securise

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 📚 Guide d'utilisation

### Première connexion

1. Accédez à `/admin/login`
2. Connectez-vous avec `doriansarry@yahoo.fr` / `admin123`
3. Allez dans Paramètres > Sécurité
4. **Changez immédiatement le mot de passe**

### Configurer le cabinet

1. Allez dans **Paramètres**
2. Remplissez les informations du cabinet
3. Configurez les options (notifications, réservation en ligne)
4. Cliquez sur "Enregistrer"

### Gérer les disponibilités

1. Allez dans **Disponibilités**
2. Visualisez les créneaux par jour
3. Activez/désactivez les créneaux selon vos besoins
4. Supprimez les créneaux non nécessaires

### Gérer les patients

1. Allez dans **Patients**
2. Utilisez la recherche pour trouver un patient
3. Exportez la liste en CSV si besoin
4. Supprimez un compte (attention : action irréversible)

### Suivre les rendez-vous

1. **Dashboard** : vue rapide des RDV du jour
2. **Rendez-vous** : liste complète avec filtres
3. Utilisez les filtres par statut
4. Exportez en CSV pour analyse

## 🐛 Troubleshooting

### Erreur de connexion

**Problème** : "Token invalide ou expiré"  
**Solution** : Déconnectez-vous et reconnectez-vous

### Les données ne s'affichent pas

**Problème** : Dashboard vide  
**Solution** : 
- Vérifiez que le backend est démarré
- Vérifiez que les migrations ont été exécutées
- Vérifiez que le seed a été exécuté

### Impossible de modifier les paramètres

**Problème** : "Paramètres non trouvés"  
**Solution** : Exécutez la migration `002_add_settings.sql`

```bash
cd backend && npm run migrate
```

## 📝 Logs d'Audit

Les actions suivantes sont enregistrées :

- ✅ Création de rendez-vous par l'admin
- ✅ Suppression de patient
- ✅ Modification des paramètres
- ✅ Changement de mot de passe
- ✅ Toute modification de disponibilités

**Accès aux logs** :
```sql
SELECT * FROM audit_logs 
WHERE user_id = 'id_admin' 
ORDER BY created_at DESC;
```

## 🔒 Bonnes Pratiques

1. ✅ Changez les mots de passe par défaut immédiatement
2. ✅ Utilisez un JWT_SECRET fort (32+ caractères)
3. ✅ Activez HTTPS en production
4. ✅ Sauvegardez régulièrement la base de données
5. ✅ Limitez l'accès au panneau admin (firewall, VPN)
6. ✅ Consultez régulièrement les logs d'audit
7. ✅ Mettez à jour les dépendances régulièrement

## 📞 Support

Pour toute question ou problème :
- 📧 Email : doriansarry@yahoo.fr
- 🐛 Issues GitHub : [https://github.com/doriansarry47-creator/kok/issues](https://github.com/doriansarry47-creator/kok/issues)

---

**Version**: 2.0.0  
**Dernière mise à jour**: 2025-10-28  
**Développé par**: Dorian Sarry
