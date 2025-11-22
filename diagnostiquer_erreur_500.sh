#!/bin/bash

echo "🔍 Diagnostic de l'erreur 500"
echo "══════════════════════════════════════════════════════════════"
echo ""

cd /var/www/lossombras || exit

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}1️⃣  Vérification de PHP-FPM...${NC}"
PHP_VERSION=$(php -r "echo PHP_MAJOR_VERSION.'.'.PHP_MINOR_VERSION;" 2>/dev/null || echo "8.2")
echo "   Version PHP détectée : $PHP_VERSION"

if systemctl is-active --quiet php${PHP_VERSION}-fpm; then
    echo -e "   ${GREEN}✅ PHP-FPM est actif${NC}"
else
    echo -e "   ${RED}❌ PHP-FPM n'est pas actif${NC}"
    echo "   Démarrage de PHP-FPM..."
    sudo systemctl start php${PHP_VERSION}-fpm
fi

echo ""
echo -e "${BLUE}2️⃣  Vérification du socket PHP-FPM...${NC}"
SOCKET_PATH="/var/run/php/php${PHP_VERSION}-fpm.sock"
if [ -S "$SOCKET_PATH" ]; then
    echo -e "   ${GREEN}✅ Socket trouvé : $SOCKET_PATH${NC}"
    ls -la "$SOCKET_PATH"
else
    echo -e "   ${RED}❌ Socket non trouvé : $SOCKET_PATH${NC}"
    echo "   Sockets disponibles :"
    ls -la /var/run/php/ 2>/dev/null || echo "   Aucun socket trouvé"
fi

echo ""
echo -e "${BLUE}3️⃣  Vérification des permissions...${NC}"
if [ -d "backend/var" ]; then
    PERMS=$(stat -c "%a" backend/var 2>/dev/null || stat -f "%OLp" backend/var 2>/dev/null)
    echo "   Permissions de backend/var : $PERMS"
    if [ "$PERMS" != "775" ] && [ "$PERMS" != "2775" ]; then
        echo -e "   ${YELLOW}⚠️  Permissions incorrectes, correction...${NC}"
        sudo chmod -R 775 backend/var
        sudo chown -R www-data:www-data backend/var
    fi
fi

echo ""
echo -e "${BLUE}4️⃣  Vérification de la configuration Nginx...${NC}"
if sudo nginx -t 2>&1 | grep -q "successful"; then
    echo -e "   ${GREEN}✅ Configuration Nginx valide${NC}"
else
    echo -e "   ${RED}❌ Erreur dans la configuration Nginx${NC}"
    sudo nginx -t
    exit 1
fi

echo ""
echo -e "${BLUE}5️⃣  Vérification des logs Nginx...${NC}"
echo "   Dernières erreurs Nginx :"
sudo tail -20 /var/log/nginx/lossombras-error.log 2>/dev/null || echo "   Aucun log d'erreur trouvé"

echo ""
echo -e "${BLUE}6️⃣  Vérification des logs PHP-FPM...${NC}"
echo "   Dernières erreurs PHP-FPM :"
sudo tail -20 /var/log/php${PHP_VERSION}-fpm.log 2>/dev/null || sudo journalctl -u php${PHP_VERSION}-fpm -n 20 --no-pager

echo ""
echo -e "${BLUE}7️⃣  Vérification des logs Symfony...${NC}"
if [ -f "backend/var/log/prod.log" ]; then
    echo "   Dernières erreurs Symfony :"
    sudo tail -20 backend/var/log/prod.log
else
    echo "   Aucun log Symfony trouvé"
fi

echo ""
echo -e "${BLUE}8️⃣  Test de l'API directement...${NC}"
if php backend/public/index.php > /dev/null 2>&1; then
    echo -e "   ${GREEN}✅ L'index.php est accessible${NC}"
else
    echo -e "   ${RED}❌ Problème avec index.php${NC}"
    php backend/public/index.php
fi

echo ""
echo -e "${BLUE}9️⃣  Vérification de .env.local...${NC}"
if [ -f "backend/.env.local" ]; then
    echo -e "   ${GREEN}✅ .env.local existe${NC}"
    if grep -q "DATABASE_URL" backend/.env.local; then
        echo "   DATABASE_URL configuré"
    else
        echo -e "   ${YELLOW}⚠️  DATABASE_URL non trouvé${NC}"
    fi
else
    echo -e "   ${YELLOW}⚠️  .env.local n'existe pas${NC}"
fi

echo ""
echo -e "${BLUE}🔟 Test de connexion à la base de données...${NC}"
cd backend
if php bin/console doctrine:query:sql "SELECT 1" > /dev/null 2>&1; then
    echo -e "   ${GREEN}✅ Connexion à la base de données OK${NC}"
else
    echo -e "   ${RED}❌ Problème de connexion à la base de données${NC}"
    php bin/console doctrine:query:sql "SELECT 1" 2>&1 | head -5
fi
cd ..

echo ""
echo "══════════════════════════════════════════════════════════════"
echo -e "${YELLOW}💡 Solutions possibles :${NC}"
echo ""
echo "1. Si PHP-FPM n'est pas actif :"
echo "   sudo systemctl start php${PHP_VERSION}-fpm"
echo ""
echo "2. Si les permissions sont incorrectes :"
echo "   sudo chown -R www-data:www-data /var/www/lossombras"
echo "   sudo chmod -R 775 /var/www/lossombras/backend/var"
echo ""
echo "3. Si la config Nginx est invalide :"
echo "   sudo nginx -t"
echo "   sudo nano /etc/nginx/sites-available/lossombras"
echo ""
echo "4. Vérifier les logs en temps réel :"
echo "   sudo tail -f /var/log/nginx/lossombras-error.log"
echo ""
echo "5. Redémarrer tous les services :"
echo "   sudo systemctl restart php${PHP_VERSION}-fpm"
echo "   sudo systemctl reload nginx"
echo ""

