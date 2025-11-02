# 🚀 Guide de Déploiement Vercel - Corrigé

## ✅ Corrections Appliquées

Les problèmes suivants ont été résolus :

### 1. Configuration `vercel.json` ✓
**Problème** : Le fichier référençait `api/index.js` qui n'existe pas
**Solution** : Configuration mise à jour pour les fichiers TypeScript avec routes individuelles

### 2. Script de build ✓
**Problème** : `vercel-build` référençait des scripts inexistants
**Solution** : Simplifié pour utiliser `vite build` directement

## 📋 Étapes de Déploiement

### Option 1 : Déploiement Automatique via GitHub (RECOMMANDÉ)

1. **Connectez votre repository à Vercel** :
   - Allez sur [vercel.com](https://vercel.com)
   - Cliquez sur "Add New Project"
   - Sélectionnez le repository : `doriansarry47-creator/kok`
   - Vercel détectera automatiquement la configuration

2. **Configurez les variables d'environnement** dans le dashboard Vercel :
   ```
   DATABASE_URL=postgresql://neondb_owner:password@ep-autumn-bar-abt09oc2-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   JWT_SECRET=medplan-jwt-secret-key-2024-production
   JWT_EXPIRES_IN=24h
   SESSION_SECRET=medplan-session-secret-2024-production
   NODE_ENV=production
   VITE_API_URL=/api
   ```

3. **Déclenchez le déploiement** :
   - Le push GitHub que nous venons de faire devrait automatiquement déclencher un déploiement
   - Sinon, cliquez sur "Deploy" dans le dashboard Vercel

### Option 2 : Déploiement via CLI Vercel

Si vous avez un token Vercel valide :

```bash
# Obtenir un nouveau token sur https://vercel.com/account/tokens
export VERCEL_TOKEN="votre-nouveau-token"

# Lier le projet
npx vercel link

# Configurer les variables d'environnement
npx vercel env add DATABASE_URL production
npx vercel env add JWT_SECRET production
npx vercel env add JWT_EXPIRES_IN production
npx vercel env add SESSION_SECRET production
npx vercel env add NODE_ENV production
npx vercel env add VITE_API_URL production

# Déployer en production
npx vercel --prod
```

## 🔧 Structure des API Routes

Les routes API sont maintenant correctement configurées :

- `/api/auth/login` → `api/auth/login.ts`
- `/api/auth/register` → `api/auth/register.ts`
- `/api/auth/verify` → `api/auth/verify.ts`
- `/api/appointments` → `api/appointments/index.ts`
- `/api/practitioners` → `api/practitioners/index.ts`
- `/api/test` → `api/test.ts`

## 🔐 Sécurité - IMPORTANT

⚠️ **ATTENTION** : Ne partagez JAMAIS vos tokens publiquement !

1. **Token GitHub** :
   - Allez sur https://github.com/settings/tokens
   - Révoquez tout token compromis
   - Créez-en un nouveau avec les permissions appropriées

2. **Token Vercel** :
   - Allez sur https://vercel.com/account/tokens
   - Créez un nouveau token si nécessaire
   - Gardez-le en sécurité (ne le committez jamais)

## ✅ Vérification Post-Déploiement

Une fois déployé, testez ces endpoints :

1. **Page d'accueil** : `https://votre-app.vercel.app/`
2. **API Test** : `https://votre-app.vercel.app/api/test`
3. **Auth Verify** : `https://votre-app.vercel.app/api/auth/verify`

## 🐛 Troubleshooting

### Si vous voyez "Function Runtimes must have a valid version"
✓ **Résolu** - Ce problème a été corrigé dans le `vercel.json`

### Si le build échoue
- Vérifiez les logs Vercel
- Assurez-vous que toutes les dépendances sont dans `package.json`
- Vérifiez que les variables d'environnement sont configurées

### Si l'API ne répond pas
- Vérifiez que `DATABASE_URL` est correcte
- Testez la connexion à la base de données Neon
- Consultez les logs des functions Vercel

## 📞 Support

Si vous rencontrez des problèmes :
1. Consultez les logs Vercel dans le dashboard
2. Vérifiez les variables d'environnement
3. Testez les endpoints API individuellement

---

**Les corrections ont été appliquées et pushées sur GitHub !** 🎉

Commit : `394fe49 - fix: Update Vercel configuration for TypeScript API functions`
