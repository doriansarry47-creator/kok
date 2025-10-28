# 🏥 KOK - Plateforme de Prise de Rendez-vous

Application web complète de prise de rendez-vous pour thérapie sensorimotrice, inspirée de Doctolib/Resaclick.

## 📋 Table des matières

- [Fonctionnalités](#-fonctionnalités)
- [Architecture](#-architecture)
- [Technologies](#-technologies)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Démarrage](#-démarrage)
- [API Endpoints](#-api-endpoints)
- [Tests](#-tests)
- [Déploiement](#-déploiement)
- [RGPD & Sécurité](#-rgpd--sécurité)
- [Licence](#-licence)

## ✨ Fonctionnalités

### Patients
- ✅ Inscription et connexion sécurisées
- ✅ Prise de rendez-vous en ligne
- ✅ Consultation des créneaux disponibles
- ✅ Gestion des rendez-vous (modification, annulation >24h)
- ✅ Notifications par email (confirmation, rappels)
- ✅ Export et suppression des données (RGPD)
- ✅ Profil utilisateur modifiable

### Administrateur
- ✅ Gestion complète des disponibilités
- ✅ Plages horaires récurrentes configurables
- ✅ Gestion des exceptions (congés, ouvertures exceptionnelles)
- ✅ Vue calendrier (jour/semaine/mois)
- ✅ Liste et gestion de tous les rendez-vous
- ✅ Création de rendez-vous pour les patients
- ✅ Export des données (CSV)
- ✅ Logs d'audit

## 🏗️ Architecture

```
kok/
├── backend/          # API REST Node.js + Express + TypeScript
│   ├── src/
│   │   ├── config/       # Configuration (DB, logger)
│   │   ├── controllers/  # Contrôleurs API
│   │   ├── middleware/   # Middlewares (auth, validation, rate limit)
│   │   ├── models/       # Modèles TypeScript
│   │   ├── routes/       # Routes API
│   │   ├── services/     # Services (email, etc.)
│   │   ├── migrations/   # Migrations SQL
│   │   └── index.ts      # Point d'entrée
│   ├── Dockerfile
│   └── package.json
├── frontend/         # SPA Next.js + React + TailwindCSS
│   ├── src/
│   │   ├── app/          # Pages Next.js (App Router)
│   │   ├── components/   # Composants React
│   │   ├── services/     # Services API (Axios)
│   │   ├── stores/       # State management (Zustand)
│   │   └── types/        # Types TypeScript
│   ├── Dockerfile
│   └── package.json
├── .github/
│   └── workflows/
│       └── ci.yml        # Pipeline CI/CD
├── docker-compose.yml
├── .env.example
└── README.md
```

## 🛠️ Technologies

### Backend
- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js
- **Langage**: TypeScript
- **Base de données**: PostgreSQL 16
- **ORM**: pg (client PostgreSQL natif)
- **Authentification**: JWT + bcrypt
- **Validation**: Joi
- **Email**: Nodemailer
- **Logging**: Winston
- **Tests**: Jest + Supertest

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI**: React 18
- **Styling**: TailwindCSS
- **HTTP Client**: Axios
- **State Management**: Zustand
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns
- **Tests**: Jest + React Testing Library

### DevOps
- **Conteneurisation**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Linting**: ESLint + Prettier
- **Sécurité**: Helmet, CORS, Rate Limiting

## 📦 Installation

### Prérequis
- Node.js 20+ et npm
- Docker et Docker Compose
- PostgreSQL 16 (si installation sans Docker)
- Git

### Cloner le projet
```bash
git clone https://github.com/doriansarry47-creator/kok.git
cd kok
```

### Configuration
```bash
# Copier le fichier d'environnement
cp .env.example .env

# Éditer .env avec vos valeurs
nano .env
```

### Variables d'environnement essentielles

⚠️ **IMPORTANT** : Modifiez ces valeurs en production :

```env
# Base de données
DATABASE_URL=postgresql://kok_user:kok_password@localhost:5432/kok

# Sécurité
JWT_SECRET=votre-secret-jwt-super-securise-changez-moi-absolument

# Admin par défaut
ADMIN_EMAIL=admin@therapie-sensorimotrice.fr
ADMIN_PASSWORD=Admin123!  # ⚠️ À changer après première connexion

# SMTP (emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-application
```

## 🚀 Démarrage

### Avec Docker (Recommandé)

```bash
# Construire et démarrer tous les services
docker-compose up -d

# Vérifier les logs
docker-compose logs -f

# Services disponibles:
# - Backend API: http://localhost:3000
# - Frontend: http://localhost:3001
# - PostgreSQL: localhost:5432
```

### Initialisation de la base de données

```bash
# Exécuter les migrations (première fois uniquement)
docker-compose exec backend npm run migrate

# Créer le compte admin et données par défaut
docker-compose exec backend npm run seed
```

### Sans Docker (Développement local)

#### Backend
```bash
cd backend

# Installer les dépendances
npm install

# Exécuter les migrations
npm run migrate

# Initialiser les données
npm run seed

# Démarrer en mode développement
npm run dev
```

#### Frontend
```bash
cd frontend

# Installer les dépendances
npm install

# Démarrer en mode développement
npm run dev
```

## 🔌 API Endpoints

### Authentification
```
POST   /api/auth/register          # Inscription patient
POST   /api/auth/login             # Connexion
GET    /api/auth/me                # Profil utilisateur (auth)
PUT    /api/auth/me                # Modifier profil (auth)
DELETE /api/auth/me                # Supprimer compte (auth)
GET    /api/auth/me/export         # Exporter données RGPD (auth)
```

### Disponibilités
```
GET    /api/availability           # Liste disponibilités (auth)
GET    /api/availability/slots     # Créneaux disponibles (auth)
POST   /api/availability           # Créer disponibilité (admin)
PUT    /api/availability/:id       # Modifier disponibilité (admin)
DELETE /api/availability/:id       # Supprimer disponibilité (admin)
GET    /api/availability/exceptions # Liste exceptions (admin)
POST   /api/availability/exceptions # Créer exception (admin)
DELETE /api/availability/exceptions/:id # Supprimer exception (admin)
```

### Réservations
```
POST   /api/bookings               # Créer rendez-vous (patient)
GET    /api/bookings/my            # Mes rendez-vous (patient)
GET    /api/bookings/:id           # Détails rendez-vous (auth)
PUT    /api/bookings/:id           # Modifier rendez-vous (auth)
POST   /api/bookings/:id/cancel    # Annuler rendez-vous (auth)
GET    /api/bookings               # Tous les rendez-vous (admin)
POST   /api/bookings/admin/create  # Créer pour patient (admin)
```

## 🧪 Tests

### Backend
```bash
cd backend

# Tous les tests
npm test

# Tests avec couverture
npm test -- --coverage

# Tests en mode watch
npm run test:watch

# Linting
npm run lint
```

### Frontend
```bash
cd frontend

# Tous les tests
npm test

# Linting
npm run lint
```

## 📊 Base de données

### Schéma principal

#### Table `users`
```sql
- id (UUID, PK)
- email (VARCHAR, UNIQUE)
- password_hash (VARCHAR)
- role (ENUM: admin, patient)
- first_name, last_name, phone
- is_active (BOOLEAN)
- created_at, updated_at, last_login
```

#### Table `availabilities`
```sql
- id (UUID, PK)
- day_of_week (INTEGER 0-6)
- start_time, end_time (TIME)
- slot_duration (INTEGER, minutes)
- is_active (BOOLEAN)
```

#### Table `bookings`
```sql
- id (UUID, PK)
- patient_id (UUID, FK → users)
- date (DATE)
- start_time, end_time (TIME)
- status (ENUM: pending, confirmed, cancelled, completed)
- reason, cancellation_reason (TEXT)
- created_at, updated_at, cancelled_at
```

### Migrations

```bash
# Appliquer les migrations
docker-compose exec backend npm run migrate

# Réinitialiser la base (développement uniquement)
docker-compose down -v
docker-compose up -d
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed
```

## 🚢 Déploiement

### Préparer la production

1. **Modifier les variables d'environnement**
```bash
# Générer un secret JWT fort
openssl rand -base64 32

# Utiliser une base de données PostgreSQL en production
# Exemple avec Neon (fourni dans les credentials)
DATABASE_URL=postgresql://neondb_owner:npg_...@ep-young-darkness-...pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
```

2. **Build des images Docker**
```bash
# Backend
docker build -t kok-backend:production ./backend

# Frontend
docker build -t kok-frontend:production \
  --build-arg NEXT_PUBLIC_API_URL=https://api.votre-domaine.com \
  ./frontend
```

3. **Déployer avec docker-compose**
```bash
# En production
NODE_ENV=production docker-compose up -d
```

### CI/CD avec GitHub Actions

Le pipeline CI/CD s'exécute automatiquement :
- ✅ Lint et tests sur chaque push
- ✅ Build Docker sur merge vers `main`
- ✅ Scan de sécurité (Trivy)
- ✅ Déploiement automatique (à configurer)

### Options de déploiement
- **VPS/VM**: Docker Compose + Nginx reverse proxy
- **Cloud**: AWS ECS, Google Cloud Run, Azure Container Instances
- **Platform as a Service**: Render, Railway, Heroku
- **Kubernetes**: Helm charts disponibles sur demande

## 🔒 RGPD & Sécurité

### Conformité RGPD
- ✅ Export des données utilisateur (JSON)
- ✅ Suppression/anonymisation du compte
- ✅ Logs limités à 14 jours (auto-nettoyage)
- ✅ Minimisation des données collectées
- ✅ Consentement explicite (conditions d'utilisation)
- ✅ Audit logs pour traçabilité

### Sécurité
- ✅ Mots de passe hashés (bcrypt, cost 12)
- ✅ JWT avec expiration (7 jours)
- ✅ Rate limiting anti brute-force
- ✅ Helmet pour headers HTTP sécurisés
- ✅ CORS configuré
- ✅ Validation stricte des entrées (Joi)
- ✅ Sanitization SQL (parameterized queries)
- ✅ HTTPS obligatoire en production

### Recommandations production
1. Activer HTTPS avec certificat SSL/TLS
2. Utiliser des secrets forts (>32 caractères)
3. Configurer un firewall
4. Mettre en place des sauvegardes automatiques
5. Monitorer les logs d'erreur
6. Activer 2FA pour les comptes admin (optionnel)
7. Scanner régulièrement les vulnérabilités

## 📝 Compte admin par défaut

Lors de l'initialisation (seed), un compte admin est créé :

```
Email: admin@therapie-sensorimotrice.fr
Mot de passe: Admin123!
```

⚠️ **IMPORTANT** : Changez le mot de passe admin immédiatement après la première connexion !

## 🐛 Troubleshooting

### Problèmes fréquents

**Erreur de connexion à la base de données**
```bash
# Vérifier que PostgreSQL est démarré
docker-compose ps

# Vérifier les logs
docker-compose logs postgres

# Vérifier DATABASE_URL dans .env
```

**Port déjà utilisé**
```bash
# Modifier les ports dans .env
BACKEND_PORT=3002
FRONTEND_PORT=3003
```

**Erreur d'email**
```bash
# Vérifier la configuration SMTP
# Pour Gmail, créer un "mot de passe d'application"
# https://support.google.com/accounts/answer/185833
```

## 📄 Licence

MIT License - voir [LICENSE](LICENSE)

## 👥 Contribution

Les contributions sont les bienvenues ! Veuillez :
1. Forker le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📞 Support

Pour toute question ou problème :
- 📧 Email: admin@therapie-sensorimotrice.fr
- 🐛 Issues GitHub: [https://github.com/doriansarry47-creator/kok/issues](https://github.com/doriansarry47-creator/kok/issues)

## 🎉 Remerciements

Développé avec ❤️ pour la communauté de thérapie sensorimotrice.

---

**Version**: 1.0.0  
**Dernière mise à jour**: 2025-01-15
