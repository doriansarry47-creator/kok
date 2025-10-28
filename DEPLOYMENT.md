# 🚀 Guide de Déploiement en Production

Ce guide décrit comment déployer l'application KOK en production avec la base de données Neon PostgreSQL fournie.

## 📋 Prérequis

- Serveur Linux (Ubuntu 20.04+ recommandé) ou service cloud
- Docker et Docker Compose installés
- Accès SSH au serveur
- Nom de domaine (optionnel mais recommandé)
- Certificat SSL/TLS (Let's Encrypt recommandé)

## 🗄️ Base de données Neon (Fournie)

### Informations de connexion

Vous disposez d'une base de données PostgreSQL hébergée sur Neon :

```
Host: ep-young-darkness-abdxzpai-pooler.eu-west-2.aws.neon.tech
Database: neondb
User: neondb_owner
Password: npg_1zDVUWYjNB4s
Region: eu-west-2 (Londres, UK - Conforme RGPD)
SSL: Obligatoire
```

**URL complète** :
```
postgresql://neondb_owner:npg_1zDVUWYjNB4s@ep-young-darkness-abdxzpai-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

## 🔧 Configuration du serveur

### 1. Cloner le projet sur le serveur

```bash
# Connexion SSH
ssh user@votre-serveur.com

# Cloner le repository
git clone https://github.com/doriansarry47-creator/kok.git
cd kok
```

### 2. Créer le fichier .env de production

```bash
# Copier l'exemple
cp .env.example .env

# Éditer avec nano ou vi
nano .env
```

**Configuration minimale pour production** :

```env
# =======================================
# ENVIRONNEMENT
# =======================================
NODE_ENV=production

# =======================================
# BASE DE DONNÉES NEON
# =======================================
DATABASE_URL=postgresql://neondb_owner:npg_1zDVUWYjNB4s@ep-young-darkness-abdxzpai-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# =======================================
# SÉCURITÉ (À CHANGER ABSOLUMENT!)
# =======================================
# Générer un secret fort: openssl rand -base64 32
JWT_SECRET=CHANGEZ_CE_SECRET_AVEC_UNE_VALEUR_FORTE_DE_32_CARACTERES_MINIMUM

# =======================================
# ADMIN (À CHANGER!)
# =======================================
ADMIN_EMAIL=votre-email@domain.com
ADMIN_PASSWORD=VotreMotDePasseSecurise123!

# =======================================
# URLS
# =======================================
FRONTEND_URL=https://votre-domaine.com
NEXT_PUBLIC_API_URL=https://api.votre-domaine.com

# =======================================
# PORTS
# =======================================
BACKEND_PORT=3000
FRONTEND_PORT=3001

# =======================================
# EMAIL SMTP
# =======================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-application
FROM_EMAIL=noreply@votre-domaine.com

# =======================================
# LOGS
# =======================================
LOG_LEVEL=info
LOG_DIR=/app/logs
```

### 3. Modifier docker-compose.yml pour production

Comme vous utilisez Neon, **commentez le service PostgreSQL** :

```bash
nano docker-compose.yml
```

Commentez la section `postgres:` et `postgres` dans `depends_on` :

```yaml
version: '3.8'

services:
  # postgres:  <-- Commenté car on utilise Neon
  #   ...

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: kok-backend
    restart: unless-stopped
    # depends_on:  <-- Retiré car pas de postgres local
    environment:
      # ... reste identique
```

### 4. Générer un JWT Secret fort

```bash
# Générer un secret aléatoire de 32 caractères
openssl rand -base64 32

# Copier le résultat dans .env
# JWT_SECRET=le_resultat_genere
```

### 5. Build et démarrage

```bash
# Build des images Docker
docker-compose build

# Démarrer les services
docker-compose up -d

# Vérifier que tout fonctionne
docker-compose ps
```

### 6. Initialiser la base de données

```bash
# Exécuter les migrations sur Neon
docker-compose exec backend npm run migrate

# Créer le compte admin et données par défaut
docker-compose exec backend npm run seed
```

### 7. Vérifier le déploiement

```bash
# Tester le backend
curl http://localhost:3000/health

# Tester le frontend
curl http://localhost:3001

# Voir les logs
docker-compose logs -f
```

## 🌐 Configuration Nginx (Reverse Proxy)

Pour exposer l'application sur Internet avec un nom de domaine :

### Installer Nginx

```bash
sudo apt update
sudo apt install nginx
```

### Configuration Nginx

Créer `/etc/nginx/sites-available/kok` :

```nginx
# Frontend
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Backend API
server {
    listen 80;
    server_name api.votre-domaine.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Activer la configuration :

```bash
sudo ln -s /etc/nginx/sites-available/kok /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🔒 SSL/TLS avec Let's Encrypt

```bash
# Installer Certbot
sudo apt install certbot python3-certbot-nginx

# Obtenir les certificats SSL
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com -d api.votre-domaine.com

# Renouvellement automatique (déjà configuré par défaut)
sudo certbot renew --dry-run
```

## 🔥 Firewall

```bash
# Autoriser SSH, HTTP, HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## 📊 Monitoring et Logs

### Voir les logs

```bash
# Logs Docker
docker-compose logs -f backend
docker-compose logs -f frontend

# Logs Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Logs application
docker-compose exec backend cat /app/logs/combined.log
```

### Monitoring avec Portainer (optionnel)

```bash
docker volume create portainer_data
docker run -d -p 9000:9000 --name portainer \
    --restart=always \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v portainer_data:/data \
    portainer/portainer-ce
```

Accès : http://votre-serveur:9000

## 🔄 Mise à jour de l'application

```bash
# Arrêter les services
docker-compose down

# Mettre à jour le code
git pull origin main

# Reconstruire les images
docker-compose build

# Redémarrer
docker-compose up -d

# Vérifier
docker-compose ps
docker-compose logs -f
```

## 💾 Sauvegardes

### Automatiser les sauvegardes de la base Neon

Neon effectue des sauvegardes automatiques, mais vous pouvez aussi créer des exports :

```bash
# Script de backup
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/user/backups"

mkdir -p $BACKUP_DIR

# Export de la base via Docker
docker-compose exec -T backend pg_dump \
  "postgresql://neondb_owner:npg_1zDVUWYjNB4s@ep-young-darkness-abdxzpai-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require" \
  > $BACKUP_DIR/kok_backup_$DATE.sql

# Compression
gzip $BACKUP_DIR/kok_backup_$DATE.sql

# Garder seulement les 7 derniers jours
find $BACKUP_DIR -name "kok_backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: kok_backup_$DATE.sql.gz"
```

Automatiser avec cron :

```bash
# Éditer crontab
crontab -e

# Ajouter backup quotidien à 2h du matin
0 2 * * * /home/user/backup.sh >> /home/user/backup.log 2>&1
```

## 🔧 Variables d'environnement production

### Secrets à changer ABSOLUMENT

- ✅ `JWT_SECRET` : 32+ caractères aléatoires
- ✅ `ADMIN_PASSWORD` : Mot de passe fort
- ✅ `ADMIN_EMAIL` : Email réel

### Vérifier la configuration

```bash
# Tester la connexion à Neon
docker-compose exec backend node -e "
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
pool.query('SELECT NOW()', (err, res) => {
  console.log(err ? err : 'Connexion Neon OK:', res.rows[0]);
  pool.end();
});
"
```

## ✅ Checklist de déploiement

- [ ] Serveur configuré avec Docker
- [ ] Code cloné depuis GitHub
- [ ] `.env` configuré avec valeurs de production
- [ ] `JWT_SECRET` changé
- [ ] `ADMIN_PASSWORD` changé
- [ ] Connexion Neon testée
- [ ] Migrations exécutées
- [ ] Seed admin créé
- [ ] Nginx configuré
- [ ] SSL/TLS activé (Let's Encrypt)
- [ ] Firewall configuré
- [ ] SMTP configuré et testé
- [ ] Backups automatiques configurés
- [ ] Logs vérifiés
- [ ] Tests de connexion réussis
- [ ] Documentation lue et comprise

## 🆘 Troubleshooting

### Erreur de connexion à Neon

```bash
# Vérifier la variable DATABASE_URL
docker-compose exec backend printenv DATABASE_URL

# Tester la connexion manuellement
docker-compose exec backend npm install -g pg
docker-compose exec backend psql "$DATABASE_URL"
```

### Problème de permissions

```bash
# Donner les bonnes permissions aux logs
sudo chown -R 1001:1001 backend/logs
```

### Backend ne démarre pas

```bash
# Voir les logs détaillés
docker-compose logs backend

# Reconstruire l'image
docker-compose build --no-cache backend
docker-compose up -d backend
```

## 📞 Support

En cas de problème, consulter :
- README.md
- QUICKSTART.md
- Issues GitHub : https://github.com/doriansarry47-creator/kok/issues

---

**Bonne production ! 🚀**
