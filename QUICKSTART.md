# 🚀 Guide de démarrage rapide - KOK

Ce guide vous permet de démarrer l'application en **5 minutes**.

## Prérequis

- Docker et Docker Compose installés
- Git installé

## Installation en 4 étapes

### 1️⃣ Cloner le projet

```bash
git clone https://github.com/doriansarry47-creator/kok.git
cd kok
```

### 2️⃣ Configurer l'environnement

```bash
# Copier le fichier d'environnement
cp .env.example .env

# Éditer les variables (optionnel pour le développement)
# Les valeurs par défaut fonctionnent pour un environnement local
nano .env
```

**Variables minimales à vérifier** :
```env
# Base de données (valeurs par défaut OK)
DATABASE_URL=postgresql://kok_user:kok_password@postgres:5432/kok

# JWT Secret (changez en production!)
JWT_SECRET=votre-secret-jwt-super-securise-changez-moi

# Email SMTP (optionnel, pour les notifications)
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-application
```

### 3️⃣ Démarrer l'application

```bash
# Construire et démarrer tous les services
docker-compose up -d

# Attendre que PostgreSQL soit prêt (environ 10 secondes)
sleep 10

# Exécuter les migrations de base de données
docker-compose exec backend npm run migrate

# Créer le compte admin et données par défaut
docker-compose exec backend npm run seed
```

### 4️⃣ Accéder à l'application

- **Frontend** : http://localhost:3001
- **Backend API** : http://localhost:3000
- **Health check** : http://localhost:3000/health

## 🔑 Identifiants par défaut

**Compte Admin** :
```
Email: admin@therapie-sensorimotrice.fr
Mot de passe: Admin123!
```

⚠️ **IMPORTANT** : Changez ce mot de passe après la première connexion !

## 📊 Vérification

### Vérifier que les services fonctionnent

```bash
# Voir l'état des conteneurs
docker-compose ps

# Voir les logs
docker-compose logs -f

# Tester le backend
curl http://localhost:3000/health
# Devrait retourner: {"status":"OK","timestamp":"..."}

# Tester le frontend
curl http://localhost:3001
# Devrait retourner du HTML
```

### Résoudre les problèmes

```bash
# Redémarrer les services
docker-compose restart

# Voir les logs d'un service spécifique
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Tout arrêter et supprimer
docker-compose down

# Tout supprimer (y compris la base de données)
docker-compose down -v
```

## 📱 Utilisation

### Créer un compte patient

1. Allez sur http://localhost:3001
2. Cliquez sur "S'inscrire"
3. Remplissez le formulaire
4. Vous êtes automatiquement connecté

### Prendre un rendez-vous

1. Connectez-vous avec votre compte patient
2. Allez dans "Prendre un rendez-vous"
3. Choisissez une date et un créneau disponible
4. Confirmez votre réservation
5. Vous recevrez un email de confirmation (si SMTP configuré)

### Gérer les disponibilités (Admin)

1. Connectez-vous avec le compte admin
2. Allez dans "Disponibilités"
3. Ajoutez des plages horaires récurrentes
4. Ajoutez des exceptions (congés, jours fériés)

## 🛑 Arrêter l'application

```bash
# Arrêter sans supprimer les données
docker-compose stop

# Arrêter et supprimer les conteneurs (données conservées)
docker-compose down

# Tout supprimer y compris la base de données
docker-compose down -v
```

## 📝 Commandes utiles

```bash
# Accéder au shell du backend
docker-compose exec backend sh

# Accéder à PostgreSQL
docker-compose exec postgres psql -U kok_user -d kok

# Voir les logs en temps réel
docker-compose logs -f backend

# Réexécuter les migrations
docker-compose exec backend npm run migrate

# Réinitialiser les données par défaut
docker-compose exec backend npm run seed
```

## 🔧 Configuration avancée

### Utiliser une base de données externe

Si vous avez déjà une base PostgreSQL (par exemple Neon) :

```bash
# Modifier .env
DATABASE_URL=postgresql://neondb_owner:npg_...@ep-young-darkness-...pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require

# Commenter le service postgres dans docker-compose.yml
# Démarrer uniquement backend et frontend
docker-compose up -d backend frontend

# Exécuter les migrations sur la base externe
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed
```

### Configuration SMTP (Gmail)

1. Créer un mot de passe d'application Gmail :
   - https://myaccount.google.com/apppasswords
2. Modifier `.env` :
   ```env
   SMTP_USER=votre-email@gmail.com
   SMTP_PASS=votre-mot-de-passe-application-16-caracteres
   ```
3. Redémarrer : `docker-compose restart backend`

## 🆘 Problèmes fréquents

### Port déjà utilisé

```bash
# Modifier les ports dans .env
BACKEND_PORT=3002
FRONTEND_PORT=3003

# Relancer
docker-compose down
docker-compose up -d
```

### Erreur de connexion à la base

```bash
# Vérifier que PostgreSQL est démarré
docker-compose ps postgres

# Voir les logs
docker-compose logs postgres

# Redémarrer PostgreSQL
docker-compose restart postgres

# Attendre 10 secondes puis relancer les migrations
sleep 10
docker-compose exec backend npm run migrate
```

### Backend ne démarre pas

```bash
# Voir les logs détaillés
docker-compose logs backend

# Reconstruire l'image
docker-compose build backend
docker-compose up -d backend
```

## 🎉 Prêt !

Votre application de prise de rendez-vous est maintenant fonctionnelle !

- Frontend patient : http://localhost:3001
- Dashboard admin : http://localhost:3001/admin/dashboard (après connexion)
- API documentation : Voir README.md section "API Endpoints"

---

**Besoin d'aide ?** Consultez le [README.md](README.md) complet ou créez une issue sur GitHub.
