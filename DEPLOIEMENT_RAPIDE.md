# ⚡ Guide de Déploiement Rapide - KOK

## 🎯 Déploiement en 5 minutes

Ce guide vous permet de déployer rapidement l'application sur Vercel.

### Projet Vercel ID
```
hIcZzJfKyVMFAGh2QVfMzXc6
```

---

## 📋 Prérequis

1. **Compte Vercel** (gratuit): https://vercel.com
2. **Backend déployé** avec URL accessible
3. **Base de données Neon** initialisée

---

## 🚀 Option 1: Déploiement via Vercel CLI (Recommandé)

### Étape 1: Installer Vercel CLI

```bash
npm install -g vercel
```

### Étape 2: Se connecter à Vercel

```bash
vercel login
```

### Étape 3: Déployer le frontend

```bash
# Aller dans le dossier frontend
cd frontend

# Lier au projet existant
vercel link --project-id hIcZzJfKyVMFAGh2QVfMzXc6

# Ajouter la variable d'environnement
vercel env add NEXT_PUBLIC_API_URL production
# Quand demandé, entrer: https://votre-backend-url.com

# Déployer en production
vercel --prod
```

✅ **Votre application est déployée !**

---

## 🌐 Option 2: Déploiement via Interface Vercel

### Étape 1: Accéder au projet

1. Aller sur https://vercel.com/dashboard
2. Chercher le projet avec l'ID: `hIcZzJfKyVMFAGh2QVfMzXc6`

### Étape 2: Configurer les variables d'environnement

1. Aller dans **Settings** > **Environment Variables**
2. Ajouter:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://votre-backend-url.com`
   - **Environment**: **Production**
3. Cliquer sur **Save**

### Étape 3: Connecter GitHub (si pas déjà fait)

1. Aller dans **Settings** > **Git**
2. Connecter votre repository GitHub
3. Sélectionner le repository `doriansarry47-creator/kok`
4. Sélectionner la branche `main`
5. Configurer le **Root Directory**: `frontend`

### Étape 4: Déployer

1. Aller dans **Deployments**
2. Cliquer sur **Redeploy** ou **Deploy**
3. Attendre la fin du build (2-3 minutes)

✅ **Votre application est déployée !**

---

## 🔧 Configuration du Backend

Si vous n'avez pas encore déployé le backend, voici les options rapides:

### Option A: Railway.app (Gratuit, Simple)

```bash
# Installer Railway CLI
npm install -g @railway/cli

# Se connecter
railway login

# Déployer
cd backend
railway init
railway up

# Configurer les variables d'environnement
railway variables set DATABASE_URL="postgresql://neondb_owner:npg_1zDVUWYjNB4s@ep-young-darkness-abdxzpai-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"
railway variables set JWT_SECRET="$(openssl rand -base64 32)"
railway variables set NODE_ENV="production"
railway variables set ADMIN_EMAIL="admin@example.com"
railway variables set ADMIN_PASSWORD="VotreMotDePasse123!"

# Initialiser la base de données
railway run npm run migrate
railway run npm run seed

# Obtenir l'URL publique
railway domain
```

### Option B: Render.com (Gratuit, Simple)

1. Aller sur https://render.com
2. Créer un nouveau **Web Service**
3. Connecter votre GitHub repository
4. Configurer:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Ajouter les variables d'environnement (voir ci-dessous)
6. Cliquer sur **Create Web Service**

### Variables d'environnement Backend

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://neondb_owner:npg_1zDVUWYjNB4s@ep-young-darkness-abdxzpai-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=<générer avec: openssl rand -base64 32>
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=VotreMotDePasseSecurise123!
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-application
FRONTEND_URL=https://votre-app.vercel.app
```

---

## 🧪 Tests Automatisés

Une fois déployé, tester automatiquement:

```bash
# Exécuter les tests
./test-user-scenarios.sh https://votre-backend-url.com
```

Ou tester manuellement:

### Test 1: Backend Health

```bash
curl https://votre-backend-url.com/health
```

**Réponse attendue**:
```json
{"status":"ok","timestamp":"2025-01-15T10:00:00.000Z"}
```

### Test 2: Frontend

Ouvrir dans le navigateur:
```
https://votre-app-hiczz.vercel.app
```

### Test 3: Inscription

```bash
curl -X POST https://votre-backend-url.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "firstName": "Test",
    "lastName": "User",
    "phone": "0612345678"
  }'
```

---

## 📊 URLs Importantes

| Service | URL |
|---------|-----|
| **Frontend Vercel** | `https://[auto-généré].vercel.app` |
| **Backend** | `https://[votre-backend].up.railway.app` |
| **Dashboard Vercel** | https://vercel.com/dashboard |
| **Dashboard Railway** | https://railway.app/dashboard |
| **Console Neon DB** | https://console.neon.tech |

---

## ✅ Checklist Rapide

- [ ] Backend déployé (Railway/Render)
- [ ] Variables d'environnement configurées (Backend)
- [ ] Migrations exécutées (`npm run migrate`)
- [ ] Seed exécuté (`npm run seed`)
- [ ] URL backend notée
- [ ] Frontend déployé sur Vercel
- [ ] Variable `NEXT_PUBLIC_API_URL` configurée (Frontend)
- [ ] Tests manuels effectués
- [ ] Application accessible

---

## 🚨 Dépannage Rapide

### Le frontend ne se connecte pas au backend

```bash
# Vérifier la variable d'environnement
vercel env ls

# Si incorrecte, la changer
vercel env rm NEXT_PUBLIC_API_URL production
vercel env add NEXT_PUBLIC_API_URL production
# Entrer la bonne URL

# Redéployer
vercel --prod
```

### Le backend ne démarre pas

```bash
# Voir les logs Railway
railway logs

# Voir les logs Render
# Aller sur le dashboard > Logs

# Vérifier la connexion DB
railway run node -e "const { Pool } = require('pg'); new Pool({ connectionString: process.env.DATABASE_URL }).query('SELECT NOW()').then(r => console.log('DB OK:', r.rows[0])).catch(e => console.error('DB Error:', e));"
```

---

## 📞 Aide

- **Documentation complète**: `GUIDE_DEPLOIEMENT_COMPLET.md`
- **Tests**: `./test-user-scenarios.sh`
- **GitHub**: https://github.com/doriansarry47-creator/kok

---

**Bon déploiement ! 🚀**
