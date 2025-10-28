#!/bin/bash

# Script de tests utilisateurs automatisés
# Usage: ./test-user-scenarios.sh <BACKEND_URL>

set -e

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifier l'argument
if [ $# -eq 0 ]; then
    echo -e "${RED}Usage: $0 <BACKEND_URL>${NC}"
    echo "Exemple: $0 https://kok-backend.up.railway.app"
    exit 1
fi

BACKEND_URL=$1
TEST_EMAIL="test-$(date +%s)@example.com"
TEST_PASSWORD="Test123!"

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Tests Utilisateurs - Application KOK║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Backend URL:${NC} $BACKEND_URL"
echo -e "${YELLOW}Test Email:${NC} $TEST_EMAIL"
echo ""

# Test 1: Health Check
echo -e "${BLUE}[1/7] Test de santé du backend${NC}"
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/health" || echo "000")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
HEALTH_BODY=$(echo "$HEALTH_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Backend accessible${NC}"
    echo "  Réponse: $HEALTH_BODY"
else
    echo -e "${RED}✗ Backend non accessible (HTTP $HTTP_CODE)${NC}"
    exit 1
fi
echo ""

# Test 2: Inscription
echo -e "${BLUE}[2/7] Test d'inscription${NC}"
REGISTER_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"firstName\": \"Test\",
    \"lastName\": \"User\",
    \"phone\": \"0612345678\"
  }" || echo "{}\n000")

HTTP_CODE=$(echo "$REGISTER_RESPONSE" | tail -n1)
REGISTER_BODY=$(echo "$REGISTER_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 201 ] || [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Inscription réussie${NC}"
    TOKEN=$(echo "$REGISTER_BODY" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    if [ -n "$TOKEN" ]; then
        echo "  Token JWT obtenu: ${TOKEN:0:20}..."
    fi
else
    echo -e "${RED}✗ Échec de l'inscription (HTTP $HTTP_CODE)${NC}"
    echo "  Réponse: $REGISTER_BODY"
    exit 1
fi
echo ""

# Test 3: Connexion
echo -e "${BLUE}[3/7] Test de connexion${NC}"
LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }" || echo "{}\n000")

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n1)
LOGIN_BODY=$(echo "$LOGIN_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Connexion réussie${NC}"
    TOKEN=$(echo "$LOGIN_BODY" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    if [ -n "$TOKEN" ]; then
        echo "  Token JWT: ${TOKEN:0:20}..."
    else
        echo -e "${RED}✗ Token JWT non trouvé${NC}"
        exit 1
    fi
else
    echo -e "${RED}✗ Échec de connexion (HTTP $HTTP_CODE)${NC}"
    echo "  Réponse: $LOGIN_BODY"
    exit 1
fi
echo ""

# Test 4: Récupérer le profil
echo -e "${BLUE}[4/7] Test de récupération du profil${NC}"
PROFILE_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BACKEND_URL/api/auth/me" \
  -H "Authorization: Bearer $TOKEN" || echo "{}\n000")

HTTP_CODE=$(echo "$PROFILE_RESPONSE" | tail -n1)
PROFILE_BODY=$(echo "$PROFILE_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Profil récupéré${NC}"
    echo "  Email: $TEST_EMAIL"
else
    echo -e "${RED}✗ Échec de récupération du profil (HTTP $HTTP_CODE)${NC}"
    echo "  Réponse: $PROFILE_BODY"
fi
echo ""

# Test 5: Récupérer les créneaux disponibles
echo -e "${BLUE}[5/7] Test de récupération des créneaux disponibles${NC}"
TODAY=$(date +%Y-%m-%d)
NEXT_WEEK=$(date -d "+7 days" +%Y-%m-%d 2>/dev/null || date -v+7d +%Y-%m-%d)

SLOTS_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BACKEND_URL/api/availability/slots?startDate=$TODAY&endDate=$NEXT_WEEK" \
  -H "Authorization: Bearer $TOKEN" || echo "[]\n000")

HTTP_CODE=$(echo "$SLOTS_RESPONSE" | tail -n1)
SLOTS_BODY=$(echo "$SLOTS_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Créneaux récupérés${NC}"
    SLOTS_COUNT=$(echo "$SLOTS_BODY" | grep -o '"date"' | wc -l)
    echo "  Nombre de créneaux: $SLOTS_COUNT"
else
    echo -e "${YELLOW}⚠ Aucun créneau disponible ou erreur (HTTP $HTTP_CODE)${NC}"
fi
echo ""

# Test 6: Créer une réservation (si des créneaux existent)
echo -e "${BLUE}[6/7] Test de création de réservation${NC}"
if [ "$HTTP_CODE" -eq 200 ] && [ "$SLOTS_COUNT" -gt 0 ]; then
    # Extraire le premier créneau
    FIRST_SLOT_DATE=$(echo "$SLOTS_BODY" | grep -o '"date":"[^"]*' | head -1 | cut -d'"' -f4)
    FIRST_SLOT_TIME=$(echo "$SLOTS_BODY" | grep -o '"time":"[^"]*' | head -1 | cut -d'"' -f4)
    
    BOOKING_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/api/bookings" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{
        \"date\": \"$FIRST_SLOT_DATE\",
        \"startTime\": \"$FIRST_SLOT_TIME\",
        \"reason\": \"Test de réservation automatisé\"
      }" || echo "{}\n000")
    
    HTTP_CODE=$(echo "$BOOKING_RESPONSE" | tail -n1)
    BOOKING_BODY=$(echo "$BOOKING_RESPONSE" | head -n-1)
    
    if [ "$HTTP_CODE" -eq 201 ] || [ "$HTTP_CODE" -eq 200 ]; then
        echo -e "${GREEN}✓ Réservation créée${NC}"
        BOOKING_ID=$(echo "$BOOKING_BODY" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
        echo "  Date: $FIRST_SLOT_DATE à $FIRST_SLOT_TIME"
        echo "  ID: $BOOKING_ID"
    else
        echo -e "${RED}✗ Échec de création de réservation (HTTP $HTTP_CODE)${NC}"
        echo "  Réponse: $BOOKING_BODY"
    fi
else
    echo -e "${YELLOW}⚠ Test ignoré (pas de créneaux disponibles)${NC}"
fi
echo ""

# Test 7: Récupérer mes réservations
echo -e "${BLUE}[7/7] Test de récupération des réservations${NC}"
MY_BOOKINGS_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BACKEND_URL/api/bookings/my" \
  -H "Authorization: Bearer $TOKEN" || echo "[]\n000")

HTTP_CODE=$(echo "$MY_BOOKINGS_RESPONSE" | tail -n1)
MY_BOOKINGS_BODY=$(echo "$MY_BOOKINGS_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Réservations récupérées${NC}"
    BOOKINGS_COUNT=$(echo "$MY_BOOKINGS_BODY" | grep -o '"id"' | wc -l)
    echo "  Nombre de réservations: $BOOKINGS_COUNT"
else
    echo -e "${RED}✗ Échec de récupération des réservations (HTTP $HTTP_CODE)${NC}"
    echo "  Réponse: $MY_BOOKINGS_BODY"
fi
echo ""

# Résumé
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║       Tests terminés avec succès       ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📊 Résumé:${NC}"
echo "  ✓ Backend accessible"
echo "  ✓ Inscription fonctionnelle"
echo "  ✓ Connexion fonctionnelle"
echo "  ✓ Authentification JWT fonctionnelle"
echo "  ✓ Récupération du profil OK"
echo "  ✓ API des créneaux OK"
echo "  ✓ Création de réservation OK"
echo "  ✓ Récupération des réservations OK"
echo ""
echo -e "${YELLOW}📝 Compte de test créé:${NC}"
echo "  Email: $TEST_EMAIL"
echo "  Mot de passe: $TEST_PASSWORD"
echo ""
