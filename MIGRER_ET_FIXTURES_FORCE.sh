#!/bin/bash

set -e

echo "🚀 Migration et chargement des fixtures (FORCÉ)"
echo "══════════════════════════════════════════════════════════════"
echo ""

cd /var/www/lossombras/backend || exit

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Vérifier que .env.local existe
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ Fichier .env.local non trouvé${NC}"
    exit 1
fi

# 1. Tester la connexion
echo -e "${BLUE}📝 1/4 - Test de la connexion...${NC}"
php bin/console doctrine:query:sql "SELECT 1" >/dev/null 2>&1 || {
    echo -e "${RED}❌ Impossible de se connecter à la base de données${NC}"
    exit 1
}
echo -e "${GREEN}✅ Connexion réussie !${NC}"
echo ""

# 2. Générer une migration si nécessaire
echo -e "${BLUE}📝 2/4 - Génération d'une migration...${NC}"
php bin/console make:migration --no-interaction 2>&1 | grep -v "No database changes" || true
echo ""

# 3. Exécuter les migrations
echo -e "${BLUE}📝 3/4 - Exécution des migrations...${NC}"
php bin/console doctrine:migrations:migrate --no-interaction
echo -e "${GREEN}✅ Migrations exécutées !${NC}"
echo ""

# 4. Charger les fixtures
echo -e "${BLUE}📝 4/4 - Chargement des fixtures (FORCÉ)...${NC}"
echo -e "${YELLOW}⚠️  La base de données va être vidée et réinitialisée${NC}"
echo ""

# Essayer d'abord en production
if php bin/console doctrine:fixtures:load --no-interaction 2>/dev/null; then
    echo -e "${GREEN}✅ Fixtures chargées avec succès !${NC}"
elif php bin/console doctrine:fixtures:load --env=dev --no-interaction 2>/dev/null; then
    echo -e "${GREEN}✅ Fixtures chargées avec succès (env=dev) !${NC}"
else
    # Charger avec append en dernier recours
    php bin/console doctrine:fixtures:load --append --env=dev --no-interaction
    echo -e "${GREEN}✅ Fixtures chargées avec succès (mode append) !${NC}"
fi

echo ""
echo "══════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ Terminé !${NC}"
echo "══════════════════════════════════════════════════════════════"
echo ""
echo "📋 Compte admin :"
echo "   Email : admin@losombras.com"
echo "   Mot de passe : admin123"
echo ""

