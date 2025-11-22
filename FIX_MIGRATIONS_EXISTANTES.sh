#!/bin/bash

set -e

echo "🔧 Correction des migrations existantes"
echo "══════════════════════════════════════════════════════════════"
echo ""

cd /var/www/lossombras/backend || exit

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}📝 Ce script va marquer toutes les migrations existantes comme déjà exécutées${NC}"
echo -e "${YELLOW}⚠️  Utilisez ce script si vos tables existent déjà et que vous voulez simplement marquer les migrations${NC}"
echo ""
read -p "📝 Continuer ? [o/N] : " CONFIRM
CONFIRM=${CONFIRM:-N}

if [[ ! "$CONFIRM" =~ ^[oO]$ ]]; then
    echo -e "${YELLOW}⚠️  Opération annulée${NC}"
    exit 0
fi

echo ""

# 1. Synchroniser la table de métadonnées
echo -e "${BLUE}📝 1/3 - Synchronisation de la table de métadonnées...${NC}"
php bin/console doctrine:migrations:sync-metadata-storage --no-interaction
echo -e "${GREEN}✅ Synchronisation terminée${NC}"
echo ""

# 2. Marquer toutes les migrations comme exécutées
echo -e "${BLUE}📝 2/3 - Marquage de toutes les migrations comme exécutées...${NC}"
if php bin/console doctrine:migrations:version --add --all --no-interaction 2>&1; then
    echo -e "${GREEN}✅ Toutes les migrations marquées comme exécutées${NC}"
else
    echo -e "${YELLOW}⚠️  Marquage en lot échoué, essai une par une...${NC}"
    
    # Lister et marquer chaque migration
    for MIGRATION_FILE in migrations/Version*.php; do
        if [ -f "$MIGRATION_FILE" ]; then
            MIGRATION_NAME=$(basename "$MIGRATION_FILE" .php)
            echo -e "${BLUE}   Marquage de $MIGRATION_NAME...${NC}"
            php bin/console doctrine:migrations:version "$MIGRATION_NAME" --add --no-interaction 2>&1 || {
                echo -e "${YELLOW}   ⚠️  Impossible de marquer $MIGRATION_NAME (peut-être déjà marquée)${NC}"
            }
        fi
    done
    echo -e "${GREEN}✅ Marquage terminé${NC}"
fi
echo ""

# 3. Vérifier le statut
echo -e "${BLUE}📝 3/3 - Vérification du statut des migrations...${NC}"
php bin/console doctrine:migrations:status | head -20
echo ""

echo "══════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ Correction terminée !${NC}"
echo "══════════════════════════════════════════════════════════════"
echo ""
echo "📋 Prochaines étapes :"
echo "   1. Vérifier le statut : php bin/console doctrine:migrations:status"
echo "   2. Charger les fixtures : php bin/console doctrine:fixtures:load --env=dev --no-interaction"
echo ""

