#!/bin/bash
set -e

echo "🚀 Déploiement Los Sombras..."

# Couleurs pour les messages
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Aller dans le répertoire
cd /var/www/lossombras

# Pull les dernières modifications
echo -e "${BLUE}📥 Pull depuis Git...${NC}"
git pull origin main || git pull origin master

# Backend
echo -e "${BLUE}🔧 Configuration Backend...${NC}"
cd backend
composer install --no-dev --optimize-autoloader

# Migrations
echo -e "${YELLOW}🗄️  Exécution des migrations...${NC}"
php bin/console doctrine:migrations:migrate --no-interaction

# Vider le cache
echo -e "${YELLOW}🧹 Nettoyage du cache...${NC}"
php bin/console cache:clear --env=prod

# Frontend
echo -e "${BLUE}🎨 Build Frontend...${NC}"
cd ../frontend
npm install --legacy-peer-deps
ng build --configuration production

# Permissions
echo -e "${YELLOW}🔐 Mise à jour des permissions...${NC}"
cd ..
sudo chown -R www-data:www-data /var/www/lossombras
sudo chmod -R 755 /var/www/lossombras
sudo chmod -R 775 /var/www/lossombras/backend/var

# Redémarrer les services
echo -e "${YELLOW}🔄 Redémarrage des services...${NC}"
sudo systemctl restart php8.2-fpm || sudo systemctl restart php-fpm
sudo systemctl reload nginx

echo -e "${GREEN}✅ Déploiement terminé avec succès !${NC}"

