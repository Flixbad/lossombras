#!/bin/bash

# Script de déploiement du système de clôture hebdomadaire sur le VPS
# Usage: ./DEPLOY_CLOTURE_VPS.sh

set -e  # Arrêter en cas d'erreur

echo "🚀 Déploiement du système de clôture hebdomadaire"
echo "=================================================="
echo ""

# Variables
PROJECT_DIR="/var/www/lossombras"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

# Vérifier qu'on est dans le bon répertoire
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Erreur: Le répertoire $PROJECT_DIR n'existe pas"
    exit 1
fi

cd "$PROJECT_DIR"

echo "📥 1/6 - Récupération des modifications depuis Git..."
git pull origin main
echo "✅ Modifications récupérées"
echo ""

echo "📦 2/6 - Installation des dépendances backend..."
cd "$BACKEND_DIR"
composer install --no-dev --optimize-autoloader --no-scripts --quiet
echo "✅ Dépendances backend installées"
echo ""

echo "🗄️  3/6 - Exécution de la migration..."
php bin/console doctrine:migrations:migrate --no-interaction
echo "✅ Migration appliquée"
echo ""

echo "🧹 4/6 - Vidage du cache Symfony..."
php bin/console cache:clear --no-warmup
echo "✅ Cache vidé"
echo ""

echo "📦 5/6 - Rebuild du frontend..."
cd "$FRONTEND_DIR"
npm install --silent
npm run build
echo "✅ Frontend reconstruit"
echo ""

echo "🔄 6/6 - Redémarrage des services..."
sudo systemctl restart php8.4-fpm
sudo systemctl reload nginx
echo "✅ Services redémarrés"
echo ""

echo "✅ Déploiement terminé avec succès !"
echo ""
echo "📝 Prochaines étapes :"
echo "   1. Vérifiez que la table argent_archive existe :"
echo "      cd $BACKEND_DIR && php bin/console doctrine:query:sql \"SHOW TABLES LIKE 'argent_archive'\""
echo ""
echo "   2. Testez la commande de clôture (optionnel) :"
echo "      cd $BACKEND_DIR && php bin/console app:close-week-argent"
echo ""
echo "   3. Pour automatiser la clôture chaque dimanche, ajoutez au crontab :"
echo "      sudo crontab -e"
echo "      # Ajouter: 59 23 * * 0 cd $BACKEND_DIR && php bin/console app:close-week-argent >> /var/log/cloture-argent.log 2>&1"

