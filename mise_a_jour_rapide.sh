#!/bin/bash

set -e

echo "🚀 Mise à jour rapide du site Los Sombras"
echo "══════════════════════════════════════════════════════════════"
echo ""

cd /var/www/lossombras || exit

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 1. Pull depuis Git (si repo existe)
if [ -d ".git" ]; then
    echo -e "${BLUE}📥 Mise à jour depuis Git...${NC}"
    git pull origin main || git pull origin master || echo -e "${YELLOW}⚠️  Aucun repo Git ou erreur${NC}"
    echo ""
fi

# 2. Backend - Mise à jour des dépendances
echo -e "${BLUE}🔧 Mise à jour Backend...${NC}"
cd backend
composer install --no-dev --optimize-autoloader --quiet
php bin/console cache:clear --env=prod --no-debug --quiet
echo -e "${GREEN}✅ Backend mis à jour${NC}"
echo ""

# 3. Frontend - Rebuild
echo -e "${BLUE}🎨 Build Frontend...${NC}"
cd ../frontend
npm install --legacy-peer-deps --silent
ng build --configuration production --output-hashing=all
echo -e "${GREEN}✅ Frontend buildé${NC}"
echo ""

# 4. Permissions
echo -e "${YELLOW}🔐 Mise à jour des permissions...${NC}"
cd ..
sudo chown -R www-data:www-data /var/www/lossombras
sudo chmod -R 755 /var/www/lossombras
sudo chmod -R 775 /var/www/lossombras/backend/var
echo -e "${GREEN}✅ Permissions mises à jour${NC}"
echo ""

# 5. Mise à jour Nginx config si nécessaire
if [ -f "nginx-config.conf" ]; then
    echo -e "${BLUE}⚙️  Vérification de la config Nginx...${NC}"
    sudo cp nginx-config.conf /etc/nginx/sites-available/lossombras
    
    # Tester la config
    if sudo nginx -t > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Config Nginx valide${NC}"
        sudo systemctl reload nginx
    else
        echo -e "${RED}❌ Erreur dans la config Nginx${NC}"
        sudo nginx -t
        exit 1
    fi
    echo ""
fi

# 6. Redémarrage PHP-FPM
echo -e "${YELLOW}🔄 Redémarrage PHP-FPM...${NC}"
PHP_VERSION=$(php -r "echo PHP_MAJOR_VERSION.'.'.PHP_MINOR_VERSION;" 2>/dev/null || echo "8.2")
sudo systemctl restart php${PHP_VERSION}-fpm || sudo systemctl restart php-fpm
echo -e "${GREEN}✅ PHP-FPM redémarré${NC}"
echo ""

# 7. Vider le cache du navigateur (instructions)
echo -e "${YELLOW}💡 Pour vider le cache du navigateur :${NC}"
echo "   - Chrome/Edge : Ctrl+Shift+R (Windows) ou Cmd+Shift+R (Mac)"
echo "   - Firefox : Ctrl+F5 (Windows) ou Cmd+Shift+R (Mac)"
echo "   - Safari : Cmd+Option+R (Mac)"
echo ""

echo "══════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ Mise à jour terminée avec succès !${NC}"
echo "══════════════════════════════════════════════════════════════"
echo ""

