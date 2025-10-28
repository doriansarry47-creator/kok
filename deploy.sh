#!/bin/bash

# Script de déploiement automatisé KOK
# Usage: ./deploy.sh

set -e

echo "🚀 Déploiement de l'application KOK"
echo "===================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
BACKEND_DIR="backend"
FRONTEND_DIR="frontend"
VERCEL_PROJECT_ID="hIcZzJfKyVMFAGh2QVfMzXc6"

echo -e "${BLUE}📋 Prérequis${NC}"
echo "✓ Vercel CLI installé"
echo "✓ Compte Vercel configuré"
echo "✓ Backend déployé sur Railway/Render/Heroku"
echo ""

# Demander l'URL du backend
read -p "$(echo -e ${YELLOW}Entrez l\'URL de votre backend déployé \(ex: https://kok-backend.up.railway.app\): ${NC})" BACKEND_URL

if [ -z "$BACKEND_URL" ]; then
    echo -e "${RED}❌ URL du backend requise${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🔧 Configuration Frontend${NC}"

# Créer un fichier .env.production pour le frontend
cat > $FRONTEND_DIR/.env.production << EOF
NEXT_PUBLIC_API_URL=$BACKEND_URL
EOF

echo "✓ .env.production créé avec NEXT_PUBLIC_API_URL=$BACKEND_URL"
echo ""

# Déploiement sur Vercel
echo -e "${BLUE}🚀 Déploiement sur Vercel${NC}"
echo "Projet ID: $VERCEL_PROJECT_ID"
echo ""

cd $FRONTEND_DIR

# Installation des dépendances
echo "📦 Installation des dépendances..."
npm install

# Build local pour vérifier
echo "🔨 Build de vérification..."
npm run build

# Déploiement
echo "☁️  Déploiement vers Vercel..."
npx vercel --prod --yes --token=$VERCEL_TOKEN

cd ..

echo ""
echo -e "${GREEN}✅ Déploiement terminé !${NC}"
echo ""
echo -e "${BLUE}📝 Prochaines étapes:${NC}"
echo "1. Configurer les variables d'environnement sur Vercel:"
echo "   - NEXT_PUBLIC_API_URL=$BACKEND_URL"
echo ""
echo "2. Tester l'application déployée"
echo ""
echo "3. Configurer un domaine personnalisé (optionnel)"
echo ""
echo -e "${GREEN}🎉 Application déployée avec succès !${NC}"
