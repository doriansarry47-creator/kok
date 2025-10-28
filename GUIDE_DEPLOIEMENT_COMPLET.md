# 🚀 Guide de Déploiement Complet - Application KOK

## 📋 Vue d'ensemble

Ce guide vous accompagne pas à pas pour déployer l'application KOK (plateforme de prise de rendez-vous) en production avec:
- **Frontend**: Vercel (ID projet: `hIcZzJfKyVMFAGh2QVfMzXc6`)
- **Backend**: Railway.app (ou Render.com)
- **Base de données**: Neon PostgreSQL (déjà configurée)

## 🎯 Architecture du déploiement

```
┌─────────────────────┐
│   Vercel Frontend   │  ← Interface utilisateur (Next.js)
│  (Static + SSR)     │
└──────────┬──────────┘
           │ HTTPS
           ▼
┌─────────────────────┐
│   Railway Backend   │  ← API REST (Express + TypeScript)
│   (Node.js)         │
└──────────┬──────────┘
           │ PostgreSQL SSL
           ▼
┌─────────────────────┐
│  Neon PostgreSQL    │  ← Base de données (EU-West-2)
│  (Cloud Database)   │
└─────────────────────┘
```

---

## 📦 ÉTAPE 1: Préparation du Backend

### 1.1 Créer un compte Railway

1. Aller sur https://railway.app
2. S'inscrire avec GitHub
3. Confirmer votre email

### 1.2 Créer un nouveau projet

```bash
# Option A: Via l'interface Railway
1. Cliquer sur "New Project"
2. Sélectionner "Deploy from GitHub repo"
3. Connecter votre repository GitHub (doriansarry47-creator/kok)
4. Sélectionner le dossier "backend"

# Option B: Via Railway CLI (recommandé)
npm install -g @railway/cli
railway login
cd backend
railway init
railway up
```

### 1.3 Configurer les variables d'environnement Railway

Dans le dashboard Railway, aller dans **Variables** et ajouter:

```env
NODE_ENV=production
PORT=3000

# Base de données Neon (fournie)
DATABASE_URL=postgresql://neondb_owner:npg_1zDVUWYjNB4s@ep-young-darkness-abdxzpai-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Sécurité - GÉNÉRER UN NOUVEAU SECRET!
JWT_SECRET=<générer avec: openssl rand -base64 32>

# Admin
ADMIN_EMAIL=admin@votre-domaine.com
ADMIN_PASSWORD=VotreMotDePasseSecurise123!

# SMTP (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-application-gmail
FROM_EMAIL=noreply@votre-domaine.com

# Frontend URL (on configurera après)
FRONTEND_URL=https://votre-app.vercel.app

# Logs
LOG_LEVEL=info
LOG_DIR=/app/logs
```

### 1.4 Générer un JWT Secret fort

```bash
# Sur votre machine locale
openssl rand -base64 32

# Copier le résultat dans Railway comme JWT_SECRET
```

### 1.5 Initialiser la base de données

Une fois le backend déployé, exécuter les migrations:

```bash
# Via Railway CLI
railway run npm run migrate
railway run npm run seed
```

Ou via l'interface Railway:
1. Aller dans **Deployments**
2. Ouvrir un terminal
3. Exécuter:
```bash
npm run migrate
npm run seed
```

### 1.6 Récupérer l'URL du backend

Dans Railway, aller dans **Settings** > **Domains** et noter l'URL publique:
```
https://kok-backend-production-xxxx.up.railway.app
```

**⚠️ IMPORTANT**: Notez cette URL, vous en aurez besoin pour le frontend!

---

## 🎨 ÉTAPE 2: Déploiement du Frontend sur Vercel

### 2.1 Prérequis

- Compte Vercel (https://vercel.com)
- ID du projet: `hIcZzJfKyVMFAGh2QVfMzXc6`
- URL du backend Railway (de l'étape 1.6)

### 2.2 Configuration locale

Créer un fichier `.env.production` dans le dossier `frontend/`:

```env
NEXT_PUBLIC_API_URL=https://kok-backend-production-xxxx.up.railway.app
```

### 2.3 Déploiement via Vercel CLI

```bash
# Installer Vercel CLI globalement
npm install -g vercel

# Se connecter à Vercel
vercel login

# Aller dans le dossier frontend
cd frontend

# Lier au projet existant
vercel link --project-id hIcZzJfKyVMFAGh2QVfMzXc6

# Configurer la variable d'environnement
vercel env add NEXT_PUBLIC_API_URL production
# Coller l'URL du backend Railway

# Déployer en production
vercel --prod
```

### 2.4 Déploiement via interface Vercel

1. Aller sur https://vercel.com/dashboard
2. Trouver le projet avec l'ID `hIcZzJfKyVMFAGh2QVfMzXc6`
3. Aller dans **Settings** > **Environment Variables**
4. Ajouter:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://kok-backend-production-xxxx.up.railway.app`
   - **Environment**: Production
5. Cliquer sur **Save**
6. Aller dans **Deployments**
7. Cliquer sur **Redeploy** pour le dernier déploiement

### 2.5 Vérifier le déploiement

Une fois déployé, Vercel vous donnera une URL:
```
https://votre-app-hiczz.vercel.app
```

---

## 🔧 ÉTAPE 3: Configuration CORS

Le backend doit autoriser les requêtes depuis Vercel.

### 3.1 Ajouter l'URL Vercel dans les variables Railway

Dans Railway, ajouter/modifier:
```env
FRONTEND_URL=https://votre-app-hiczz.vercel.app
```

### 3.2 Vérifier la configuration CORS

Le backend doit avoir ce code dans `src/index.ts`:

```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true
}));
```

Si nécessaire, redéployer le backend après modification.

---

## 🧪 ÉTAPE 4: Tests Utilisateurs

### 4.1 Test de la page d'accueil

1. Ouvrir l'URL Vercel: `https://votre-app-hiczz.vercel.app`
2. Vérifier que la page se charge
3. Ouvrir la console du navigateur (F12) et vérifier qu'il n'y a pas d'erreurs

### 4.2 Test d'inscription

1. Cliquer sur "S'inscrire" ou "Créer un compte"
2. Remplir le formulaire:
   - Prénom: Jean
   - Nom: Dupont
   - Email: jean.dupont@test.com
   - Téléphone: 0612345678
   - Mot de passe: Test123!
3. Soumettre le formulaire
4. Vérifier que vous recevez un email de confirmation (si SMTP configuré)
5. Vérifier que vous êtes connecté automatiquement

### 4.3 Test de connexion

1. Se déconnecter
2. Cliquer sur "Se connecter"
3. Entrer les identifiants:
   - Email: jean.dupont@test.com
   - Mot de passe: Test123!
4. Vérifier que vous êtes connecté

### 4.4 Test de réservation

1. Une fois connecté, aller sur "Prendre rendez-vous"
2. Sélectionner une date disponible
3. Choisir un créneau horaire
4. Remplir le motif de consultation
5. Confirmer la réservation
6. Vérifier que:
   - Le rendez-vous apparaît dans "Mes rendez-vous"
   - Vous recevez un email de confirmation

### 4.5 Test de l'interface admin

1. Se connecter avec le compte admin:
   - Email: admin@votre-domaine.com (configuré dans Railway)
   - Mot de passe: VotreMotDePasseSecurise123!
2. Vérifier l'accès au tableau de bord admin
3. Tester la création de disponibilités:
   - Aller dans "Disponibilités"
   - Créer un nouveau créneau
   - Vérifier qu'il apparaît dans le calendrier
4. Vérifier la liste des réservations

### 4.6 Test d'annulation

1. Aller dans "Mes rendez-vous" (compte patient)
2. Sélectionner un rendez-vous futur
3. Cliquer sur "Annuler"
4. Confirmer l'annulation
5. Vérifier que:
   - Le statut passe à "Annulé"
   - Vous recevez un email de confirmation d'annulation

---

## 📊 ÉTAPE 5: Monitoring et Logs

### 5.1 Logs Railway (Backend)

```bash
# Via CLI
railway logs

# Via interface
Dashboard > Deployments > Logs
```

### 5.2 Logs Vercel (Frontend)

1. Aller sur https://vercel.com/dashboard
2. Sélectionner votre projet
3. Aller dans **Deployments** > Sélectionner un déploiement > **Functions**
4. Voir les logs en temps réel

### 5.3 Monitoring de la base de données

1. Aller sur https://console.neon.tech
2. Se connecter avec vos identifiants
3. Sélectionner votre projet
4. Voir:
   - Nombre de connexions actives
   - Utilisation CPU/Mémoire
   - Requêtes lentes

---

## 🔒 ÉTAPE 6: Sécurité Post-Déploiement

### 6.1 Checklist de sécurité

- [ ] JWT_SECRET changé (minimum 32 caractères)
- [ ] ADMIN_PASSWORD changé (fort, avec majuscules, chiffres, symboles)
- [ ] HTTPS activé (automatique sur Vercel et Railway)
- [ ] CORS configuré correctement
- [ ] Variables d'environnement sensibles non committées
- [ ] Logs vérifiés (pas d'erreurs critiques)

### 6.2 Changer le mot de passe admin

1. Se connecter avec le compte admin
2. Aller dans "Profil"
3. Cliquer sur "Changer le mot de passe"
4. Entrer un nouveau mot de passe fort

---

## 🚨 Troubleshooting

### Problème: Le frontend ne peut pas se connecter au backend

**Solution**:
1. Vérifier que `NEXT_PUBLIC_API_URL` est correct dans Vercel
2. Vérifier que le backend est en ligne sur Railway
3. Vérifier les logs Railway pour voir les erreurs
4. Vérifier que CORS autorise l'URL Vercel

```bash
# Tester l'API backend
curl https://kok-backend-production-xxxx.up.railway.app/health
```

### Problème: Erreur de base de données

**Solution**:
1. Vérifier que `DATABASE_URL` est correct dans Railway
2. Vérifier que les migrations sont exécutées:
```bash
railway run npm run migrate
```
3. Vérifier la connexion:
```bash
railway run node -e "const { Pool } = require('pg'); const pool = new Pool({ connectionString: process.env.DATABASE_URL }); pool.query('SELECT NOW()').then(res => console.log(res.rows)).catch(err => console.error(err));"
```

### Problème: Les emails ne sont pas envoyés

**Solution**:
1. Vérifier les variables SMTP dans Railway
2. Pour Gmail, créer un "mot de passe d'application":
   - https://myaccount.google.com/apppasswords
3. Tester l'envoi d'email:
```bash
railway run node -e "const nodemailer = require('nodemailer'); const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: process.env.SMTP_PORT, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } }); transporter.verify().then(() => console.log('SMTP OK')).catch(err => console.error(err));"
```

### Problème: Build Vercel échoue

**Solution**:
1. Vérifier les logs de build dans Vercel
2. Vérifier que `package.json` est correct
3. Essayer un build local:
```bash
cd frontend
npm install
npm run build
```

---

## 📝 Résumé des URLs

Après déploiement complet, vous aurez:

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | `https://votre-app-hiczz.vercel.app` | Interface utilisateur |
| Backend API | `https://kok-backend-production-xxxx.up.railway.app` | API REST |
| Base de données | `ep-young-darkness-abdxzpai-pooler.eu-west-2.aws.neon.tech` | PostgreSQL |
| Admin | `https://votre-app-hiczz.vercel.app/admin` | Interface admin |

---

## ✅ Checklist Finale

- [ ] Backend déployé sur Railway
- [ ] Variables d'environnement configurées (Railway)
- [ ] Migrations de base de données exécutées
- [ ] Compte admin créé (seed)
- [ ] Frontend déployé sur Vercel
- [ ] Variables d'environnement configurées (Vercel)
- [ ] CORS configuré
- [ ] Tests utilisateurs effectués:
  - [ ] Inscription
  - [ ] Connexion
  - [ ] Prise de rendez-vous
  - [ ] Annulation de rendez-vous
  - [ ] Interface admin
- [ ] Emails de confirmation fonctionnels
- [ ] Logs vérifiés (pas d'erreurs)
- [ ] Mot de passe admin changé
- [ ] Documentation lue

---

## 🎉 Félicitations !

Votre application KOK est maintenant déployée en production et prête à être utilisée !

## 📞 Support

- **Documentation**: README.md, DEPLOYMENT.md
- **GitHub Issues**: https://github.com/doriansarry47-creator/kok/issues
- **Email**: admin@therapie-sensorimotrice.fr

---

**Version**: 1.0.0  
**Date**: 2025-01-15  
**Déploiement**: Vercel (Frontend) + Railway (Backend) + Neon (Database)
