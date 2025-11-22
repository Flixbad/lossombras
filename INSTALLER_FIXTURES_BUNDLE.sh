#!/bin/bash

set -e

echo "📦 Installation du bundle DoctrineFixturesBundle"
echo "══════════════════════════════════════════════════════════════"
echo ""

cd /var/www/lossombras/backend || exit

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}📝 Le bundle DoctrineFixturesBundle est nécessaire pour charger les fixtures${NC}"
echo -e "${YELLOW}⚠️  Il est actuellement dans require-dev, donc pas installé en production${NC}"
echo ""
echo "Options :"
echo "  1. Installer les dépendances dev (recommandé pour charger les fixtures)"
echo "  2. Créer une commande personnalisée sans le bundle (plus complexe)"
echo ""
read -p "📝 Choisir l'option [1] : " OPTION
OPTION=${OPTION:-1}

if [ "$OPTION" = "1" ]; then
    echo ""
    echo -e "${BLUE}📝 Installation des dépendances dev...${NC}"
    
    # Installer les dépendances dev
    if composer install --no-interaction 2>&1; then
        echo ""
        echo -e "${GREEN}✅ Dépendances dev installées !${NC}"
    else
        echo -e "${RED}❌ Erreur lors de l'installation${NC}"
        exit 1
    fi
    
    echo ""
    echo -e "${BLUE}📝 Vérification que le bundle est disponible...${NC}"
    if php bin/console list | grep -q "doctrine:fixtures:load"; then
        echo -e "${GREEN}✅ Bundle DoctrineFixturesBundle disponible !${NC}"
        echo ""
        echo -e "${BLUE}📝 Vous pouvez maintenant charger les fixtures :${NC}"
        echo "   php bin/console doctrine:fixtures:load --no-interaction"
        echo "   OU"
        echo "   php bin/console doctrine:fixtures:load --env=dev --no-interaction"
    else
        echo -e "${RED}❌ Bundle toujours non disponible${NC}"
        echo "   Vérifiez que doctrine/doctrine-fixtures-bundle est dans composer.json"
        exit 1
    fi
else
    echo ""
    echo -e "${YELLOW}⚠️  Option 2 non implémentée pour le moment${NC}"
    echo "   Utilisez l'option 1 pour installer les dépendances dev"
    exit 1
fi

echo ""
echo "══════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ Installation terminée !${NC}"
echo "══════════════════════════════════════════════════════════════"
echo ""

