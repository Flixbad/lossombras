#!/bin/bash

echo "🧪 Test de l'API"
echo "══════════════════════════════════════════════════════════════"
echo ""

cd /var/www/lossombras || exit

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}1️⃣  Test de connexion directe à l'API...${NC}"
echo ""

# Récupérer l'IP ou domaine du serveur
SERVER_IP=$(hostname -I | awk '{print $1}')
if [ -z "$SERVER_IP" ]; then
    SERVER_IP="localhost"
fi

echo "   Test sur http://$SERVER_IP/api/login"
echo ""

# Test de l'endpoint /api/login avec POST
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://$SERVER_IP/api/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"test"}')

if [ "$RESPONSE" = "401" ] || [ "$RESPONSE" = "200" ]; then
    echo -e "   ${GREEN}✅ L'API répond ! (code: $RESPONSE)${NC}"
    echo "   (401 = normal, c'est que l'API fonctionne mais l'utilisateur n'existe pas)"
else
    echo -e "   ${RED}❌ L'API ne répond pas correctement (code: $RESPONSE)${NC}"
fi

echo ""
echo -e "${BLUE}2️⃣  Test de /api/register...${NC}"
RESPONSE2=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://$SERVER_IP/api/register \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"test123"}')

if [ "$RESPONSE2" = "201" ] || [ "$RESPONSE2" = "400" ]; then
    echo -e "   ${GREEN}✅ L'API /register répond ! (code: $RESPONSE2)${NC}"
else
    echo -e "   ${RED}❌ L'API /register ne répond pas (code: $RESPONSE2)${NC}"
fi

echo ""
echo -e "${BLUE}3️⃣  Test du routing Nginx...${NC}"
# Vérifier si Nginx route correctement
NGINX_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://$SERVER_IP/api)
if [ "$NGINX_TEST" != "000" ]; then
    echo -e "   ${GREEN}✅ Nginx route vers /api (code: $NGINX_TEST)${NC}"
else
    echo -e "   ${RED}❌ Nginx ne route pas vers /api${NC}"
fi

echo ""
echo -e "${BLUE}4️⃣  Vérification des logs Nginx pour /api...${NC}"
echo "   Dernières lignes avec /api :"
sudo tail -5 /var/log/nginx/lossombras-access.log 2>/dev/null | grep "/api" || echo "   Aucune requête /api trouvée"

echo ""
echo -e "${BLUE}5️⃣  Vérification de PHP-FPM...${NC}"
PHP_VERSION=$(php -r "echo PHP_MAJOR_VERSION.'.'.PHP_MINOR_VERSION;" 2>/dev/null || echo "8.2")
if systemctl is-active --quiet php${PHP_VERSION}-fpm; then
    echo -e "   ${GREEN}✅ PHP-FPM est actif${NC}"
else
    echo -e "   ${RED}❌ PHP-FPM n'est pas actif${NC}"
fi

echo ""
echo -e "${BLUE}6️⃣  Test direct de index.php Symfony...${NC}"
cd backend/public
if php -r "require 'index.php';" > /dev/null 2>&1; then
    echo -e "   ${GREEN}✅ index.php est accessible${NC}"
else
    echo -e "   ${RED}❌ Problème avec index.php${NC}"
    php index.php 2>&1 | head -5
fi
cd ../..

echo ""
echo -e "${BLUE}7️⃣  Vérification de la base de données...${NC}"
cd backend
if php bin/console doctrine:query:sql "SELECT 1" > /dev/null 2>&1; then
    echo -e "   ${GREEN}✅ Connexion à la base de données OK${NC}"
else
    echo -e "   ${RED}❌ Problème de connexion à la base de données${NC}"
    php bin/console doctrine:query:sql "SELECT 1" 2>&1 | head -3
fi
cd ..

echo ""
echo "══════════════════════════════════════════════════════════════"
echo -e "${YELLOW}💡 Solutions possibles :${NC}"
echo ""
echo "Si l'API ne répond pas (code 500 ou erreur) :"
echo "  1. Vérifier PHP-FPM : sudo systemctl status php${PHP_VERSION}-fpm"
echo "  2. Vérifier le socket : ls -la /var/run/php/"
echo "  3. Vérifier les permissions : sudo chown -R www-data:www-data /var/www/lossombras"
echo "  4. Voir les logs : sudo tail -f /var/log/nginx/lossombras-error.log"
echo ""
echo "Si l'API retourne 404 :"
echo "  1. Vérifier la config Nginx : sudo nginx -t"
echo "  2. Vérifier que le routing Symfony est correct"
echo ""
echo "Si l'API retourne 401 (utilisateur invalide) :"
echo "  ✅ C'est normal ! L'API fonctionne, c'est juste que l'utilisateur n'existe pas"
echo ""

