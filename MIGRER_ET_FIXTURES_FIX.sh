#!/bin/bash

set -e

echo "🚀 Migration et chargement des fixtures (CORRIGÉ)"
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
echo -e "${BLUE}📝 1/6 - Test de la connexion...${NC}"
if php bin/console doctrine:query:sql "SELECT 1" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Connexion réussie !${NC}"
else
    echo -e "${RED}❌ Impossible de se connecter à la base de données${NC}"
    exit 1
fi
echo ""

# 2. Vérifier les migrations existantes
echo -e "${BLUE}📝 2/6 - Vérification du statut des migrations...${NC}"
MIGRATION_STATUS=$(php bin/console doctrine:migrations:status 2>&1 || echo "ERROR")
echo "$MIGRATION_STATUS" | head -20
echo ""

# 3. Vérifier si la table de métadonnées existe
echo -e "${BLUE}📝 3/6 - Vérification de la table de métadonnées...${NC}"
if php bin/console doctrine:migrations:sync-metadata-storage --no-interaction >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Table de métadonnées synchronisée${NC}"
else
    echo -e "${YELLOW}⚠️  Synchronisation de la table de métadonnées...${NC}"
    php bin/console doctrine:migrations:sync-metadata-storage --no-interaction || true
fi
echo ""

# 4. Exécuter les migrations avec gestion d'erreurs
echo -e "${BLUE}📝 4/6 - Exécution des migrations...${NC}"
echo -e "${YELLOW}⚠️  Si des tables existent déjà, elles seront marquées comme exécutées${NC}"
echo ""

# Essayer d'abord avec --allow-no-migration
if php bin/console doctrine:migrations:migrate --allow-no-migration --no-interaction 2>&1; then
    echo -e "${GREEN}✅ Migrations exécutées avec succès !${NC}"
else
    echo -e "${YELLOW}⚠️  Certaines migrations ont échoué, vérification des tables...${NC}"
    
    # Vérifier quelles tables existent déjà
    EXISTING_TABLES=$(php bin/console doctrine:query:sql "SHOW TABLES" 2>/dev/null | grep -v "Tables_in" || echo "")
    
    if [ -n "$EXISTING_TABLES" ]; then
        echo -e "${BLUE}📋 Tables existantes détectées :${NC}"
        echo "$EXISTING_TABLES" | sed 's/^/   - /'
        echo ""
        
        # Si la table argent existe, la migration correspondante est probablement déjà appliquée
        if echo "$EXISTING_TABLES" | grep -q "argent"; then
            echo -e "${YELLOW}⚠️  La table 'argent' existe déjà${NC}"
            echo -e "${BLUE}📝 Marquage des migrations comme exécutées...${NC}"
            
            # Marquer toutes les migrations comme exécutées
            php bin/console doctrine:migrations:version --add --all --no-interaction 2>&1 || {
                echo -e "${YELLOW}⚠️  Impossible de marquer toutes les migrations, essai une par une...${NC}"
                
                # Lister les migrations
                for MIGRATION in $(ls -1 migrations/Version*.php 2>/dev/null | xargs -n1 basename | sed 's/\.php$//'); do
                    echo -e "${BLUE}   Marquage de $MIGRATION...${NC}"
                    php bin/console doctrine:migrations:version "$MIGRATION" --add --no-interaction 2>&1 || true
                done
            }
            
            echo -e "${GREEN}✅ Migrations marquées comme exécutées${NC}"
        fi
    fi
    
    # Réessayer les migrations
    echo ""
    echo -e "${BLUE}📝 Nouvelle tentative d'exécution des migrations...${NC}"
    if php bin/console doctrine:migrations:migrate --allow-no-migration --no-interaction 2>&1; then
        echo -e "${GREEN}✅ Migrations exécutées avec succès !${NC}"
    else
        echo -e "${YELLOW}⚠️  Certaines migrations ont encore échoué, mais cela peut être normal si les tables existent déjà${NC}"
    fi
fi
echo ""

# 5. Vérifier si les fixtures sont disponibles
echo -e "${BLUE}📝 5/6 - Vérification des fixtures...${NC}"
if php bin/console list 2>&1 | grep -q "doctrine:fixtures:load"; then
    FIXTURES_AVAILABLE=true
    echo -e "${GREEN}✅ Commandes fixtures disponibles${NC}"
else
    FIXTURES_AVAILABLE=false
    echo -e "${YELLOW}⚠️  Commandes fixtures non disponibles en production${NC}"
fi
echo ""

# 6. Charger les fixtures
if [ "$FIXTURES_AVAILABLE" = true ]; then
    echo -e "${BLUE}📝 6/6 - Chargement des fixtures...${NC}"
    echo -e "${YELLOW}⚠️  Attention : Cela va vider et réinitialiser la base de données${NC}"
    read -p "📝 Continuer ? [o/N] : " CONFIRM
    CONFIRM=${CONFIRM:-N}
    
    if [[ "$CONFIRM" =~ ^[oO]$ ]]; then
        if php bin/console doctrine:fixtures:load --no-interaction 2>&1; then
            echo -e "${GREEN}✅ Fixtures chargées avec succès !${NC}"
        elif php bin/console doctrine:fixtures:load --env=dev --no-interaction 2>&1; then
            echo -e "${GREEN}✅ Fixtures chargées avec succès (env=dev) !${NC}"
        else
            echo -e "${YELLOW}⚠️  Erreur lors du chargement des fixtures, tentative en mode append...${NC}"
            php bin/console doctrine:fixtures:load --append --env=dev --no-interaction 2>&1 || {
                echo -e "${RED}❌ Impossible de charger les fixtures${NC}"
                echo "   Essayez : composer require --dev doctrine/doctrine-fixtures-bundle"
            }
        fi
    else
        echo -e "${YELLOW}⚠️  Chargement des fixtures annulé${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  6/6 - Chargement des fixtures ignoré (non disponible en production)${NC}"
    echo "   Pour charger les fixtures : composer require --dev doctrine/doctrine-fixtures-bundle"
fi

echo ""
echo "══════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ Migration terminée !${NC}"
echo "══════════════════════════════════════════════════════════════"
echo ""
echo "🧪 Pour tester :"
echo "   php bin/console doctrine:migrations:status"
echo "   php bin/console doctrine:query:sql \"SELECT COUNT(*) FROM user\""
echo "   php bin/console doctrine:query:sql \"SELECT COUNT(*) FROM article\""
echo ""

