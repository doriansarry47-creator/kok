# 🚀 Déploiement Vercel - KOK Frontend

## 📋 Prérequis

1. Compte Vercel (https://vercel.com)
2. Backend déployé et accessible (API)
3. Base de données Neon configurée
4. Variables d'environnement préparées

## 🔧 Configuration

### Variables d'environnement Vercel

Ajoutez ces variables dans les paramètres du projet Vercel:

```
NEXT_PUBLIC_API_URL=https://votre-backend-api.com
```

## 📦 Déploiement via CLI

### 1. Installation de Vercel CLI

```bash
npm install -g vercel
```

### 2. Login Vercel

```bash
vercel login
```

### 3. Déployer le projet

```bash
# Depuis le répertoire frontend
cd frontend
vercel --prod
```

Ou pour lier à un projet existant avec l'ID: `hIcZzJfKyVMFAGh2QVfMzXc6`

```bash
vercel link --project-id hIcZzJfKyVMFAGh2QVfMzXc6
vercel --prod
```

## 🌐 Déploiement via GitHub

### Option automatique avec GitHub Integration

1. Connectez votre repository GitHub à Vercel
2. Configurez les variables d'environnement
3. Vercel déploiera automatiquement à chaque push

## 🔗 Backend Requirements

Le frontend nécessite un backend accessible. Options:

### Option 1: Railway (Recommandé)
```bash
# Installer Railway CLI
npm install -g @railway/cli

# Login
railway login

# Déployer le backend
cd backend
railway up
```

### Option 2: Render.com
- Créer un nouveau Web Service
- Connecter le repository
- Configurer les variables d'environnement
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

### Option 3: Heroku
```bash
# Installer Heroku CLI
npm install -g heroku

# Login
heroku login

# Créer l'app
cd backend
heroku create kok-backend

# Configurer les variables
heroku config:set DATABASE_URL="postgresql://neondb_owner:npg_1zDVUWYjNB4s@ep-young-darkness-abdxzpai-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"
heroku config:set JWT_SECRET="votre-secret-fort"
heroku config:set NODE_ENV="production"

# Déployer
git push heroku main
```

## ✅ Checklist de déploiement

- [ ] Backend déployé et accessible
- [ ] Base de données Neon initialisée (migrations + seed)
- [ ] Variables d'environnement configurées sur Vercel
- [ ] Frontend déployé sur Vercel
- [ ] URLs correctement configurées
- [ ] Tests de connexion réussis
- [ ] Tests utilisateurs effectués

## 🧪 Tests après déploiement

### Tests manuels à effectuer:

1. **Page d'accueil**
   - Accéder à l'URL Vercel
   - Vérifier l'affichage

2. **Inscription**
   - Créer un nouveau compte patient
   - Vérifier l'email de confirmation

3. **Connexion**
   - Se connecter avec le compte créé
   - Vérifier le token JWT

4. **Réservation**
   - Consulter les créneaux disponibles
   - Créer une réservation
   - Vérifier l'email de confirmation

5. **Admin**
   - Se connecter avec le compte admin
   - Créer des disponibilités
   - Voir les réservations

## 🔒 Sécurité

- ✅ HTTPS automatique sur Vercel
- ✅ Variables d'environnement sécurisées
- ✅ CORS configuré pour le domaine Vercel
- ✅ Rate limiting activé

## 📞 Support

En cas de problème:
- Logs Vercel: Dashboard > Project > Deployments > Functions
- Logs Backend: Selon le service choisi (Railway/Render/Heroku)

---

**Déploiement configuré le**: 2025-01-15
