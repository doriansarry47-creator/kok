# 👑 Guide Administrateur - KOK

## 📋 Table des matières

- [Connexion](#-connexion)
- [Vue d'ensemble](#-vue-densemble)
- [Tableau de bord](#-tableau-de-bord)
- [Gestion des rendez-vous](#-gestion-des-rendez-vous)
- [Gestion des disponibilités](#-gestion-des-disponibilités)
- [Gestion des patients](#-gestion-des-patients)
- [Paramètres du cabinet](#️-paramètres-du-cabinet)
- [Sécurité](#-sécurité)
- [API Backend](#-api-backend)
- [Configuration](#️-configuration)
- [Déploiement](#-déploiement)
- [Troubleshooting](#-troubleshooting)

---

## 🔐 Connexion

### Accès au panneau administrateur

**URL de connexion** : `http://localhost:3001/admin/login` (ou votre domaine en production)

### Comptes administrateurs par défaut

#### Compte principal
```
Email: doriansarry@yahoo.fr
Mot de passe: admin123
```

#### Compte secondaire (configurable via .env)
```
Email: admin@therapie-sensorimotrice.fr
Mot de passe: Admin123!
```

> ⚠️ **IMPORTANT** : Changez ces mots de passe immédiatement après la première connexion !

### Première connexion

1. Accédez à `/admin/login`
2. Entrez vos identifiants administrateur
3. Cliquez sur "Se connecter"
4. Vous serez redirigé vers le tableau de bord

---

## 📊 Vue d'ensemble

Le panneau administrateur de KOK vous permet de gérer intégralement votre cabinet de thérapie sensorimotrice :

### Fonctionnalités principales

- ✅ **Dashboard** : Vue d'ensemble en temps réel de l'activité
- ✅ **Rendez-vous** : Gestion complète des créneaux réservés
- ✅ **Disponibilités** : Configuration de vos horaires de travail
- ✅ **Patients** : Base de données complète de vos patients
- ✅ **Paramètres** : Configuration du cabinet et sécurité
- ✅ **Export CSV** : Exportation des données pour analyse
- ✅ **Logs d'audit** : Traçabilité complète des actions

### Architecture

```
┌─────────────────────────────────────────────┐
│           Interface Administrateur          │
│                (React + Next.js)            │
└─────────────────┬───────────────────────────┘
                  │
                  │ JWT Authentication
                  │
┌─────────────────▼───────────────────────────┐
│              API Backend                    │
│            (Node.js + Express)              │
└─────────────────┬───────────────────────────┘
                  │
                  │
┌─────────────────▼───────────────────────────┐
│          Base de données PostgreSQL         │
└─────────────────────────────────────────────┘
```

---

## 📊 Tableau de bord

**Route** : `/admin/dashboard`

### Statistiques affichées

#### 1. Patients total
- Nombre total de patients actifs inscrits
- Icône : 👥

#### 2. RDV à venir (7 jours)
- Nombre de rendez-vous confirmés dans les 7 prochains jours
- Icône : 📅

#### 3. RDV aujourd'hui
- Nombre de rendez-vous prévus aujourd'hui
- Icône : 📆

#### 4. Annulations récentes (7 jours)
- Nombre d'annulations dans les 7 derniers jours
- Icône : ❌

### Rendez-vous du jour

Section détaillée affichant tous les rendez-vous d'aujourd'hui avec :
- Avatar du patient
- Nom et prénom
- Email de contact
- Téléphone
- Horaire (heure de début - heure de fin)
- Statut (badge coloré)

**Actualisation** : Les données sont chargées automatiquement à l'ouverture de la page.

---

## 📅 Gestion des rendez-vous

**Route** : `/admin/rendez-vous`

### Vue liste

Tableau complet de tous les rendez-vous avec les colonnes suivantes :

| Colonne | Description |
|---------|-------------|
| **Patient** | Nom, prénom et email |
| **Date** | Date du rendez-vous |
| **Horaire** | Heure de début - heure de fin |
| **Statut** | Badge coloré (confirmé, en attente, annulé, terminé) |
| **Contact** | Numéro de téléphone |
| **Actions** | Boutons d'action (voir détails, modifier, annuler) |

### Filtres disponibles

```javascript
// Filtrer par statut
status: 'confirmed' | 'pending' | 'cancelled' | 'completed'

// Filtrer par période
date_from: 'YYYY-MM-DD'
date_to: 'YYYY-MM-DD'

// Recherche par patient
patient_id: 'uuid'
```

### Actions possibles

#### 1. Créer un rendez-vous

**Bouton** : "Nouveau rendez-vous"

**Formulaire** :
- Sélection du patient (liste déroulante)
- Date du rendez-vous
- Heure de début
- Heure de fin
- Motif (optionnel)

**Validation** :
- Vérification que le créneau n'est pas déjà réservé
- Vérification que le patient existe
- Email de confirmation automatique envoyé au patient

#### 2. Modifier un rendez-vous

**API** : `PUT /api/admin/bookings/:id`

**Champs modifiables** :
- Date
- Heure de début
- Heure de fin
- Statut
- Motif

> ⚠️ Les admins peuvent modifier un rendez-vous sans contrainte de délai (contrairement aux patients qui ont une limite de 24h)

#### 3. Annuler un rendez-vous

**API** : `POST /api/admin/bookings/:id/cancel`

**Formulaire** :
- Raison de l'annulation (optionnel)

**Conséquences** :
- Statut du rendez-vous changé en "cancelled"
- Date/heure d'annulation enregistrée
- Email automatique envoyé au patient
- Log d'audit créé

### Export CSV

**Bouton** : "Exporter en CSV"

**Filtres appliqués** :
- Par défaut : tous les rendez-vous
- Possibilité de filtrer par période

**Colonnes exportées** :
```csv
Date,Heure début,Heure fin,Statut,Patient prénom,Patient nom,Email,Téléphone,Motif
```

**Nom du fichier** : `rendez-vous.csv`

---

## 🕐 Gestion des disponibilités

**Route** : `/admin/disponibilites`

### Vue hebdomadaire

Affichage des plages horaires par jour de la semaine :

```
Lundi       Mardi       Mercredi    Jeudi       Vendredi    Samedi      Dimanche
[Plages]    [Plages]    [Plages]    [Plages]    [Plages]    [Plages]    [Plages]
```

### Structure des plages horaires

Chaque plage affiche :
- **Horaire** : Ex. "09:00 - 12:00"
- **Durée des créneaux** : Ex. "45 minutes"
- **Statut** : Actif (vert) / Inactif (gris)
- **Actions** : Activer/Désactiver, Supprimer

### Créer une plage horaire

**API** : `POST /api/availability`

**Formulaire** :
```json
{
  "day_of_week": 1,          // 0 = Dimanche, 1 = Lundi, ..., 6 = Samedi
  "start_time": "09:00",
  "end_time": "12:00",
  "slot_duration": 45,       // en minutes
  "is_active": true
}
```

**Validation** :
- `start_time` doit être avant `end_time`
- `slot_duration` : entre 15 et 120 minutes
- Pas de chevauchement avec une plage existante sur le même jour

### Modifier une plage horaire

**API** : `PUT /api/availability/:id`

**Champs modifiables** :
- Heure de début
- Heure de fin
- Durée des créneaux
- Statut actif/inactif

### Activer/Désactiver une plage

**Toggle rapide** : Bouton pour activer/désactiver sans supprimer

**Utilité** :
- Garder la configuration pour une réactivation future
- Désactiver temporairement un créneau

### Supprimer une plage

**Confirmation requise** : "Êtes-vous sûr de vouloir supprimer cette plage horaire ?"

> ⚠️ La suppression est définitive. Préférez la désactivation pour une indisponibilité temporaire.

### Gestion des exceptions

**À venir** : Gestion des congés, jours fériés et ouvertures exceptionnelles

---

## 👤 Gestion des patients

**Route** : `/admin/patients`

### Vue liste

Tableau de tous les patients avec :

| Colonne | Description |
|---------|-------------|
| **Avatar** | Initiale du prénom dans un cercle |
| **Nom complet** | Prénom et nom |
| **Email** | Adresse email |
| **Téléphone** | Numéro de contact |
| **Inscrit le** | Date de création du compte |
| **RDV** | Nombre total de rendez-vous |
| **Actions** | Boutons d'action |

### Recherche

**Barre de recherche** : Recherche en temps réel sur :
- Nom
- Prénom
- Email
- Téléphone

**API** : `GET /api/admin/patients?search=jean`

### Actions possibles

#### 1. Voir le détail d'un patient

**Informations affichées** :
- Identité complète
- Coordonnées
- Date d'inscription
- Date de dernière connexion
- Historique des rendez-vous
- Statut du compte (actif/inactif)

#### 2. Supprimer un patient

**API** : `DELETE /api/admin/patients/:id`

**Confirmation requise** : Modale avec message d'avertissement

**Conséquences** :
- Suppression définitive du compte
- Suppression en cascade de tous ses rendez-vous
- Respect du RGPD (droit à l'oubli)
- Log d'audit créé

> ⚠️ **ATTENTION** : Cette action est irréversible !

### Export CSV

**Bouton** : "Exporter la liste"

**Colonnes exportées** :
```csv
Email,Prénom,Nom,Téléphone,Date inscription,Nombre RDV
```

**Nom du fichier** : `patients.csv`

**Utilité** :
- Analyse externe (Excel, Google Sheets)
- Sauvegarde des données
- Campagnes email (avec consentement)

---

## ⚙️ Paramètres du cabinet

**Route** : `/admin/parametres`

### Informations générales

**API** : `GET /api/admin/settings`

#### Champs configurables

| Champ | Type | Description |
|-------|------|-------------|
| **cabinet_name** | Texte | Nom affiché du cabinet |
| **address** | Textarea | Adresse postale complète |
| **contact_email** | Email | Email de contact public |
| **contact_phone** | Tel | Numéro de téléphone du cabinet |
| **logo_url** | URL | Lien vers le logo (optionnel) |

### Options de fonctionnement

#### Notifications

| Option | Par défaut | Description |
|--------|-----------|-------------|
| **notification_enabled** | `true` | Activer l'envoi d'emails automatiques |
| **reminder_days_before** | `1` | Nombre de jours avant le RDV pour le rappel |

#### Réservations

| Option | Par défaut | Description |
|--------|-----------|-------------|
| **allow_online_booking** | `true` | Autoriser les patients à prendre RDV en ligne |
| **slot_duration_default** | `60` | Durée par défaut des créneaux (minutes) |

### Sauvegarde des paramètres

**API** : `PUT /api/admin/settings`

**Validation** :
- Email valide
- Téléphone au format international ou local
- Durée des créneaux : 15-120 minutes

**Confirmation** : Message de succès "Paramètres enregistrés avec succès"

---

## 🔒 Sécurité

**Route** : `/admin/parametres` (section Sécurité)

### Changement de mot de passe

**API** : `PUT /api/admin/security/password`

**Formulaire** :
```json
{
  "current_password": "ancien_mot_de_passe",
  "new_password": "nouveau_mot_de_passe",
  "confirm_password": "nouveau_mot_de_passe"
}
```

**Validation** :
- ✅ Mot de passe actuel correct
- ✅ Nouveau mot de passe ≥ 8 caractères
- ✅ Confirmation identique au nouveau mot de passe
- ✅ Nouveau mot de passe différent de l'ancien

**Règles de sécurité** :
- **Longueur minimale** : 8 caractères
- **Recommandé** : 12+ caractères avec majuscules, minuscules, chiffres et symboles

**Conséquences** :
- Mot de passe haché avec bcrypt (cost 12)
- Log d'audit créé
- Session actuelle maintenue (pas de déconnexion)

### Authentification

#### Système JWT

**Tokens** :
- **Access Token** : Durée de vie 7 jours
- Stockage : `localStorage` (côté client)
- Format : `Bearer <token>`

**Déconnexion** :
- Suppression du token côté client
- Redirection vers `/admin/login`

#### Protection des routes

**Middleware** : `authenticate` + `requireRole('admin')`

**Vérifications** :
1. Présence du token
2. Validité du token (signature + expiration)
3. Rôle "admin" dans le payload

**Erreurs possibles** :
- `401 Unauthorized` : Token manquant ou invalide
- `403 Forbidden` : Rôle insuffisant

### Logs d'audit

**Table** : `audit_logs`

**Événements enregistrés** :
- ✅ Création de rendez-vous par l'admin
- ✅ Modification de rendez-vous
- ✅ Annulation de rendez-vous
- ✅ Suppression de patient
- ✅ Modification des paramètres
- ✅ Changement de mot de passe
- ✅ Modification des disponibilités

**Données enregistrées** :
```javascript
{
  id: 'uuid',
  user_id: 'uuid',              // Admin ayant effectué l'action
  action: 'ACTION_TYPE',         // Type d'action
  resource_type: 'booking',      // Type de ressource
  resource_id: 'uuid',           // ID de la ressource
  details: { ... },              // Détails JSON
  ip_address: '192.168.1.1',    // IP du client
  created_at: 'timestamp'
}
```

**Consultation des logs** :
```sql
SELECT * FROM audit_logs 
WHERE user_id = 'admin_id' 
ORDER BY created_at DESC 
LIMIT 100;
```

**Rétention** : Les logs sont conservés 14 jours (conformité RGPD)

---

## 🔌 API Backend

### Routes administrateur

Toutes les routes sont préfixées par `/api/admin` et nécessitent :
- Header : `Authorization: Bearer <token>`
- Rôle : `admin`

### Dashboard

```
GET /api/admin/dashboard
```

**Réponse** :
```json
{
  "success": true,
  "data": {
    "totalPatients": 42,
    "upcomingBookings": 15,
    "todayBookings": [
      {
        "id": "uuid",
        "patient_first_name": "Jean",
        "patient_last_name": "Dupont",
        "patient_email": "jean@example.com",
        "patient_phone": "0612345678",
        "date": "2025-10-29",
        "start_time": "10:00:00",
        "end_time": "11:00:00",
        "status": "confirmed"
      }
    ],
    "recentCancellations": 3
  }
}
```

### Rendez-vous

#### Lister tous les rendez-vous
```
GET /api/admin/bookings
GET /api/admin/bookings?status=confirmed
GET /api/admin/bookings?date_from=2025-10-01&date_to=2025-10-31
```

#### Créer un rendez-vous
```
POST /api/admin/bookings
Content-Type: application/json

{
  "patient_id": "uuid",
  "date": "2025-11-15",
  "start_time": "10:00",
  "end_time": "11:00",
  "reason": "Séance de suivi"
}
```

#### Modifier un rendez-vous
```
PUT /api/admin/bookings/:id
Content-Type: application/json

{
  "date": "2025-11-16",
  "start_time": "14:00",
  "end_time": "15:00",
  "status": "confirmed"
}
```

#### Annuler un rendez-vous
```
POST /api/admin/bookings/:id/cancel
Content-Type: application/json

{
  "cancellation_reason": "Indisponibilité du thérapeute"
}
```

#### Exporter en CSV
```
GET /api/admin/bookings/export/csv
GET /api/admin/bookings/export/csv?date_from=2025-10-01&date_to=2025-10-31
```

### Patients

#### Lister tous les patients
```
GET /api/admin/patients
GET /api/admin/patients?search=jean
```

**Réponse** :
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "jean@example.com",
      "first_name": "Jean",
      "last_name": "Dupont",
      "phone": "0612345678",
      "created_at": "2025-01-15T10:00:00Z",
      "last_login": "2025-10-28T15:30:00Z",
      "is_active": true,
      "total_bookings": 5
    }
  ]
}
```

#### Supprimer un patient
```
DELETE /api/admin/patients/:id
```

#### Exporter en CSV
```
GET /api/admin/patients/export/csv
```

### Disponibilités

#### Lister les disponibilités
```
GET /api/availability
```

#### Créer une disponibilité
```
POST /api/availability
Content-Type: application/json

{
  "day_of_week": 1,
  "start_time": "09:00",
  "end_time": "12:00",
  "slot_duration": 45,
  "is_active": true
}
```

#### Modifier une disponibilité
```
PUT /api/availability/:id
Content-Type: application/json

{
  "start_time": "09:30",
  "end_time": "12:30",
  "is_active": false
}
```

#### Supprimer une disponibilité
```
DELETE /api/availability/:id
```

### Paramètres

#### Obtenir les paramètres
```
GET /api/admin/settings
```

#### Mettre à jour les paramètres
```
PUT /api/admin/settings
Content-Type: application/json

{
  "cabinet_name": "Cabinet de Thérapie Sensorimotrice",
  "address": "10 rue de la Santé, 75014 Paris",
  "contact_email": "contact@therapie.fr",
  "contact_phone": "0145678901",
  "notification_enabled": true,
  "allow_online_booking": true,
  "slot_duration_default": 60
}
```

### Sécurité

#### Changer le mot de passe
```
PUT /api/admin/security/password
Content-Type: application/json

{
  "current_password": "ancien_mdp",
  "new_password": "nouveau_mdp_securise"
}
```

---

## ⚙️ Configuration

### Variables d'environnement

Fichier `.env` à la racine du projet :

```env
# === BASE DE DONNÉES ===
DATABASE_URL=postgresql://kok_user:kok_password@localhost:5432/kok

# === SÉCURITÉ ===
JWT_SECRET=votre-secret-jwt-super-securise-changez-moi-absolument
# Générer un secret fort : openssl rand -base64 32

# === ADMIN PAR DÉFAUT ===
# Note: le compte doriansarry@yahoo.fr est créé en dur dans le seed
ADMIN_EMAIL=admin@therapie-sensorimotrice.fr
ADMIN_PASSWORD=Admin123!

# === SMTP (Emails) ===
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-application
FROM_EMAIL=noreply@therapie-sensorimotrice.fr

# === FRONTEND ===
NEXT_PUBLIC_API_URL=http://localhost:3000

# === PORTS ===
BACKEND_PORT=3000
FRONTEND_PORT=3001
POSTGRES_PORT=5432

# === ENVIRONNEMENT ===
NODE_ENV=development
```

### Configuration SMTP (Gmail)

Pour utiliser Gmail comme serveur SMTP :

1. Activer la validation en 2 étapes
2. Générer un "mot de passe d'application" :
   - Aller sur : https://myaccount.google.com/security
   - Section "Validation en deux étapes"
   - "Mots de passe des applications"
   - Créer un mot de passe pour "Application personnalisée"
3. Utiliser ce mot de passe dans `SMTP_PASS`

---

## 🚀 Déploiement

### Installation initiale

#### 1. Cloner le projet
```bash
git clone https://github.com/doriansarry47-creator/kok.git
cd kok
```

#### 2. Configurer les variables d'environnement
```bash
cp .env.example .env
nano .env  # Éditer avec vos valeurs
```

#### 3. Avec Docker (recommandé)
```bash
# Démarrer tous les services
docker-compose up -d

# Vérifier les logs
docker-compose logs -f

# Exécuter les migrations
docker-compose exec backend npm run migrate

# Initialiser les données (crée les comptes admin)
docker-compose exec backend npm run seed
```

#### 4. Sans Docker
```bash
# Backend
cd backend
npm install
npm run migrate
npm run seed
npm run dev

# Frontend (dans un autre terminal)
cd frontend
npm install
npm run dev
```

### Accès aux services

- **Backend API** : http://localhost:3000
- **Frontend** : http://localhost:3001
- **Admin Panel** : http://localhost:3001/admin/login
- **PostgreSQL** : localhost:5432

### Production

#### Build des images Docker

```bash
# Backend
docker build -t kok-backend:production ./backend

# Frontend
docker build -t kok-frontend:production \
  --build-arg NEXT_PUBLIC_API_URL=https://api.votre-domaine.com \
  ./frontend
```

#### Déploiement

```bash
# Avec docker-compose
NODE_ENV=production docker-compose up -d

# Vérifier les logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Recommandations production

1. **Base de données** :
   - Utiliser une base PostgreSQL managée (AWS RDS, GCP Cloud SQL, Neon, Supabase)
   - Sauvegardes automatiques quotidiennes
   - Réplication si haute disponibilité requise

2. **Secrets** :
   - Générer un nouveau `JWT_SECRET` fort (32+ caractères)
   - Ne jamais commit de `.env` dans git
   - Utiliser des variables d'environnement sécurisées (secrets manager)

3. **HTTPS** :
   - Certificat SSL/TLS obligatoire (Let's Encrypt, Cloudflare)
   - Redirection HTTP → HTTPS automatique

4. **Reverse Proxy** :
   - Nginx ou Traefik devant les services
   - Rate limiting
   - Compression gzip/brotli

5. **Monitoring** :
   - Logs centralisés (ELK, Loki, Datadog)
   - Alertes sur erreurs critiques
   - Métriques de performance

---

## 🐛 Troubleshooting

### Problème : Impossible de se connecter

**Symptômes** :
- Message "Email ou mot de passe incorrect"
- Le formulaire ne répond pas

**Solutions** :
1. Vérifier que le backend est démarré :
   ```bash
   docker-compose ps
   # backend doit être "Up"
   ```

2. Vérifier que le seed a été exécuté :
   ```bash
   docker-compose exec backend npm run seed
   ```

3. Réinitialiser le mot de passe admin :
   ```bash
   # Se connecter à PostgreSQL
   docker-compose exec postgres psql -U kok_user -d kok
   
   # Réinitialiser le mot de passe (hash de "admin123")
   UPDATE users 
   SET password_hash = '$2b$12$...' 
   WHERE email = 'doriansarry@yahoo.fr';
   ```

### Problème : Token invalide ou expiré

**Symptômes** :
- Déconnexion automatique
- Message "Token invalide ou expiré" sur toutes les requêtes

**Solutions** :
1. Se déconnecter et se reconnecter
2. Vider le localStorage du navigateur :
   ```javascript
   localStorage.clear()
   ```
3. Vérifier que `JWT_SECRET` est le même entre backend et .env

### Problème : Les données ne s'affichent pas

**Symptômes** :
- Dashboard vide
- Listes vides alors qu'il y a des données

**Solutions** :
1. Ouvrir la console du navigateur (F12)
2. Vérifier les erreurs réseau (onglet Network)
3. Vérifier que `NEXT_PUBLIC_API_URL` est correct
4. Vérifier les CORS dans le backend :
   ```typescript
   // backend/src/index.ts
   app.use(cors({
     origin: 'http://localhost:3001',
     credentials: true
   }));
   ```

### Problème : Erreur de connexion à la base de données

**Symptômes** :
- Backend ne démarre pas
- Message "Connection refused" ou "ECONNREFUSED"

**Solutions** :
1. Vérifier que PostgreSQL est démarré :
   ```bash
   docker-compose ps postgres
   ```

2. Vérifier la variable `DATABASE_URL` :
   ```bash
   echo $DATABASE_URL
   ```

3. Tester la connexion manuellement :
   ```bash
   docker-compose exec postgres psql -U kok_user -d kok -c "SELECT 1"
   ```

4. Réinitialiser PostgreSQL :
   ```bash
   docker-compose down -v
   docker-compose up -d postgres
   docker-compose exec backend npm run migrate
   ```

### Problème : Emails ne sont pas envoyés

**Symptômes** :
- Pas de confirmation après création de RDV
- Logs montrent des erreurs SMTP

**Solutions** :
1. Vérifier la configuration SMTP dans `.env`
2. Tester avec un serveur SMTP de développement :
   ```bash
   # Utiliser Mailtrap ou MailHog pour les tests
   SMTP_HOST=smtp.mailtrap.io
   SMTP_PORT=2525
   SMTP_USER=your_mailtrap_user
   SMTP_PASS=your_mailtrap_pass
   ```

3. Vérifier les logs backend :
   ```bash
   docker-compose logs backend | grep email
   ```

### Problème : Port déjà utilisé

**Symptômes** :
- "Port 3000 is already in use"
- "EADDRINUSE"

**Solutions** :
1. Modifier les ports dans `.env` :
   ```env
   BACKEND_PORT=3002
   FRONTEND_PORT=3003
   ```

2. Ou tuer le processus utilisant le port :
   ```bash
   # Linux/Mac
   lsof -ti:3000 | xargs kill -9
   
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

### Problème : Migrations échouent

**Symptômes** :
- "Migration failed"
- Erreur SQL

**Solutions** :
1. Vérifier que la base existe :
   ```bash
   docker-compose exec postgres psql -U kok_user -l
   ```

2. Réinitialiser complètement :
   ```bash
   # ATTENTION : Supprime toutes les données !
   docker-compose down -v
   docker-compose up -d
   docker-compose exec backend npm run migrate
   docker-compose exec backend npm run seed
   ```

3. Appliquer les migrations manuellement :
   ```bash
   docker-compose exec backend npm run migrate
   ```

---

## 📚 Ressources supplémentaires

### Documentation

- [README principal](./README.md)
- [Guide de déploiement](./DEPLOYMENT.md)
- [Politique RGPD](./PRIVACY.md)

### Support

- 📧 **Email** : doriansarry@yahoo.fr
- 🐛 **Issues GitHub** : https://github.com/doriansarry47-creator/kok/issues

### Contribution

Les contributions sont les bienvenues ! Voir [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## 🎉 Félicitations !

Vous êtes maintenant prêt à administrer votre cabinet de thérapie sensorimotrice avec KOK !

**Version** : 2.0.0  
**Dernière mise à jour** : 2025-10-29  
**Développé par** : Dorian Sarry

---

**© 2025 KOK - Tous droits réservés**
