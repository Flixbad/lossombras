#!/bin/bash

# Script de déploiement complet pour le VPS
# Ce script met à jour le projet avec toutes les modifications récentes

set -e  # Arrêter en cas d'erreur

echo "══════════════════════════════════════════════════════════════"
echo "🚀 DÉPLOIEMENT DU PROJET SUR LE VPS"
echo "══════════════════════════════════════════════════════════════"
echo ""

# Variables
PROJECT_DIR="/var/www/lossombras"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
NGINX_CONFIG="/etc/nginx/sites-available/lossombras"

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les erreurs
error() {
    echo -e "${RED}❌ Erreur: $1${NC}"
    exit 1
}

# Fonction pour afficher les succès
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Fonction pour afficher les informations
info() {
    echo -e "${YELLOW}📋 $1${NC}"
}

# Vérifier qu'on est dans le bon répertoire
if [ ! -d "$PROJECT_DIR" ]; then
    error "Le répertoire $PROJECT_DIR n'existe pas. Êtes-vous sur le VPS ?"
fi

cd "$PROJECT_DIR" || error "Impossible d'accéder au répertoire du projet"

info "Répertoire de travail: $(pwd)"
echo ""

# 📝 Étape 1 : Sauvegarde des fichiers critiques
info "Étape 1/6 - Sauvegarde des fichiers critiques..."
if [ -f "$BACKEND_DIR/.env.local" ]; then
    cp "$BACKEND_DIR/.env.local" "$BACKEND_DIR/.env.local.backup.$(date +%Y%m%d_%H%M%S)" || error "Erreur lors de la sauvegarde de .env.local"
    success "Fichier .env.local sauvegardé"
fi
echo ""

# 📥 Étape 2 : Récupération des modifications depuis Git
info "Étape 2/6 - Récupération des modifications depuis Git..."

# Sauvegarder les modifications locales si nécessaire
if [ -n "$(git status --porcelain)" ]; then
    info "Modifications locales détectées, création d'un stash..."
    git stash save "Auto-stash avant déploiement $(date +%Y%m%d_%H%M%S)" || true
fi

# Pull les modifications
git fetch origin || error "Erreur lors du fetch Git"
git pull origin main || error "Erreur lors du pull Git"
success "Modifications récupérées depuis Git"
echo ""

# 📦 Étape 3 : Mise à jour du backend
info "Étape 3/6 - Mise à jour du backend Symfony..."
cd "$BACKEND_DIR" || error "Impossible d'accéder au répertoire backend"

# Installer/mettre à jour les dépendances Composer
composer install --no-dev --optimize-autoloader || error "Erreur lors de l'installation des dépendances Composer"

# Vider le cache Symfony
php bin/console cache:clear --env=prod --no-debug || error "Erreur lors du vidage du cache"

# Mettre à jour l'autoloader
composer dump-autoload --optimize --classmap-authoritative || error "Erreur lors de la mise à jour de l'autoloader"

success "Backend mis à jour"
echo ""

# 🎨 Étape 4 : Build du frontend
info "Étape 4/6 - Build du frontend Angular..."
cd "$FRONTEND_DIR" || error "Impossible d'accéder au répertoire frontend"

# Installer/mettre à jour les dépendances npm
npm install --legacy-peer-deps || error "Erreur lors de l'installation des dépendances npm"

# Build de production
npm run build -- --configuration production || error "Erreur lors du build du frontend"

success "Frontend compilé avec succès"
echo ""

# 🔧 Étape 5 : Vérification de la configuration Nginx
info "Étape 5/6 - Vérification de la configuration Nginx..."

if [ -f "$NGINX_CONFIG" ]; then
    # Tester la configuration Nginx
    nginx -t || error "Erreur dans la configuration Nginx"
    success "Configuration Nginx valide"
else
    info "Configuration Nginx non trouvée, création nécessaire..."
fi
echo ""

# 🔄 Étape 6 : Redémarrage des services
info "Étape 6/6 - Redémarrage des services..."

# Détecter la version de PHP
PHP_VERSION=$(php -v | head -n 1 | cut -d " " -f 2 | cut -c 1-3)
PHP_FPM_SERVICE="php${PHP_VERSION}-fpm"

# Redémarrer PHP-FPM
if systemctl is-active --quiet "$PHP_FPM_SERVICE"; then
    systemctl restart "$PHP_FPM_SERVICE" || error "Erreur lors du redémarrage de PHP-FPM"
    success "PHP-FPM redémarré"
else
    info "PHP-FPM n'est pas actif, démarrage..."
    systemctl start "$PHP_FPM_SERVICE" || error "Erreur lors du démarrage de PHP-FPM"
    success "PHP-FPM démarré"
fi

# Recharger Nginx
systemctl reload nginx || error "Erreur lors du rechargement de Nginx"
success "Nginx rechargé"
echo ""

# ✅ Résumé final
echo "══════════════════════════════════════════════════════════════"
success "DÉPLOIEMENT TERMINÉ AVEC SUCCÈS !"
echo "══════════════════════════════════════════════════════════════"
echo ""
info "Résumé des actions effectuées :"
echo "  ✅ Modifications récupérées depuis Git"
echo "  ✅ Dépendances backend mises à jour"
echo "  ✅ Cache Symfony vidé"
echo "  ✅ Frontend compilé en production"
echo "  ✅ Services redémarrés (PHP-FPM, Nginx)"
echo ""
info "Votre site devrait maintenant être à jour avec toutes les modifications."
echo ""
info "Pour vérifier les logs en cas de problème :"
echo "  • Backend: tail -f $BACKEND_DIR/var/log/prod.log"
echo "  • Nginx: tail -f /var/log/nginx/error.log"
echo "  • PHP-FPM: journalctl -u $PHP_FPM_SERVICE -f"
echo ""

