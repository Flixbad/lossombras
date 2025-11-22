#!/bin/bash

set -e

echo "🚀 Mise à jour depuis Git et déploiement"
echo "══════════════════════════════════════════════════════════════"
echo ""

cd /var/www/lossombras || exit

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 1. Stasher les changements locaux s'il y en a
echo -e "${BLUE}📦 Vérification des changements locaux...${NC}"
if ! git diff --quiet || ! git diff --cached --quiet; then
    echo -e "${YELLOW}⚠️  Changements locaux détectés, sauvegarde temporaire...${NC}"
    git stash push -m "Sauvegarde avant pull $(date +%Y-%m-%d_%H-%M-%S)"
    STASHED=true
else
    STASHED=false
fi

# 2. Supprimer les fichiers non trackés qui causent des conflits
if [ -f "mise_a_jour_rapide.sh" ]; then
    echo -e "${YELLOW}🗑️  Suppression de l'ancien fichier mise_a_jour_rapide.sh...${NC}"
    rm -f mise_a_jour_rapide.sh
fi

# 3. Pull depuis Git
echo -e "${BLUE}📥 Pull depuis Git...${NC}"
git pull origin main || git pull origin master || {
    echo -e "${RED}❌ Erreur lors du pull${NC}"
    if [ "$STASHED" = true ]; then
        echo -e "${YELLOW}🔄 Restauration des changements locaux...${NC}"
        git stash pop || true
    fi
    exit 1
}
echo -e "${GREEN}✅ Pull réussi${NC}"
echo ""

# 4. Réappliquer les changements stashés si nécessaire (optionnel)
if [ "$STASHED" = true ]; then
    echo -e "${YELLOW}💡 Vous aviez des changements locaux qui ont été sauvegardés${NC}"
    echo "   Pour les voir : git stash list"
    echo "   Pour les réappliquer : git stash pop"
    echo "   Pour les supprimer : git stash drop"
    echo ""
fi

# 5. Backend - Mise à jour
echo -e "${BLUE}🔧 Mise à jour Backend...${NC}"
cd backend
composer install --no-dev --optimize-autoloader --quiet
php bin/console cache:clear --env=prod --no-debug --quiet
echo -e "${GREEN}✅ Backend mis à jour${NC}"
echo ""

# 6. Frontend - Rebuild
echo -e "${BLUE}🎨 Build Frontend...${NC}"
cd ../frontend
npm install --legacy-peer-deps --silent
ng build --configuration production --output-hashing=all
echo -e "${GREEN}✅ Frontend buildé${NC}"
echo ""

# 7. Permissions
echo -e "${YELLOW}🔐 Mise à jour des permissions...${NC}"
cd ..
sudo chown -R www-data:www-data /var/www/lossombras
sudo chmod -R 755 /var/www/lossombras
sudo chmod -R 775 /var/www/lossombras/backend/var
echo -e "${GREEN}✅ Permissions mises à jour${NC}"
echo ""

# 8. Mise à jour Nginx config si nécessaire
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

# 9. Redémarrage PHP-FPM
echo -e "${YELLOW}🔄 Redémarrage PHP-FPM...${NC}"
PHP_VERSION=$(php -r "echo PHP_MAJOR_VERSION.'.'.PHP_MINOR_VERSION;" 2>/dev/null || echo "8.2")
sudo systemctl restart php${PHP_VERSION}-fpm || sudo systemctl restart php-fpm
echo -e "${GREEN}✅ PHP-FPM redémarré${NC}"
echo ""

echo "══════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ Mise à jour terminée avec succès !${NC}"
echo "══════════════════════════════════════════════════════════════"
echo ""

