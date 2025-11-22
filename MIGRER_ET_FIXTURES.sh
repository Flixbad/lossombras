#!/bin/bash

set -e

echo "🚀 Migration et chargement des fixtures"
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
    echo "   Vérifiez votre configuration DATABASE_URL"
    exit 1
fi

# 1. Tester la connexion à la base
echo -e "${BLUE}📝 1/5 - Test de la connexion à la base de données...${NC}"
if php bin/console doctrine:query:sql "SELECT 1" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Connexion réussie !${NC}"
else
    echo -e "${RED}❌ Impossible de se connecter à la base de données${NC}"
    echo "   Vérifiez votre configuration DATABASE_URL dans .env.local"
    exit 1
fi
echo ""

# 2. Vérifier les migrations en attente
echo -e "${BLUE}📝 2/5 - Vérification des migrations...${NC}"
PENDING_MIGRATIONS=$(php bin/console doctrine:migrations:status 2>&1 | grep -c "not executed" || echo "0")
if [ "$PENDING_MIGRATIONS" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  $PENDING_MIGRATIONS migration(s) en attente${NC}"
    echo ""
    echo -e "${BLUE}📝 Génération d'une nouvelle migration (si nécessaire)...${NC}"
    # Générer une migration basée sur les différences entre les entités et le schéma
    php bin/console make:migration --no-interaction 2>&1 | grep -v "No database changes" || echo -e "${GREEN}✅ Pas de nouvelles migrations nécessaires${NC}"
    echo ""
else
    echo -e "${GREEN}✅ Toutes les migrations sont à jour${NC}"
    echo ""
    echo -e "${BLUE}📝 Vérification si de nouvelles migrations sont nécessaires...${NC}"
    php bin/console make:migration --no-interaction 2>&1 | grep -v "No database changes" || echo -e "${GREEN}✅ Pas de nouvelles migrations nécessaires${NC}"
    echo ""
fi

# 3. Exécuter les migrations
echo -e "${BLUE}📝 3/5 - Exécution des migrations...${NC}"
if php bin/console doctrine:migrations:migrate --no-interaction 2>&1; then
    echo -e "${GREEN}✅ Migrations exécutées avec succès !${NC}"
else
    echo -e "${RED}❌ Erreur lors de l'exécution des migrations${NC}"
    echo "   Vérifiez les erreurs ci-dessus"
    exit 1
fi
echo ""

# 4. Vérifier si le bundle Fixtures est disponible
echo -e "${BLUE}📝 4/5 - Vérification des fixtures...${NC}"
if php bin/console list | grep -q "doctrine:fixtures:load"; then
    echo -e "${GREEN}✅ Bundle Fixtures disponible${NC}"
    FIXTURES_CMD="php bin/console doctrine:fixtures:load --no-interaction"
else
    echo -e "${YELLOW}⚠️  Bundle Fixtures non disponible en production${NC}"
    echo "   Tentative avec l'environnement dev..."
    FIXTURES_CMD="php bin/console doctrine:fixtures:load --env=dev --no-interaction"
fi
echo ""

# 5. Charger les fixtures
echo -e "${BLUE}📝 5/5 - Chargement des fixtures...${NC}"
echo -e "${YELLOW}⚠️  Attention : Cela va vider et réinitialiser la base de données${NC}"
read -p "📝 Continuer ? [o/N] : " CONFIRM
CONFIRM=${CONFIRM:-N}

if [[ "$CONFIRM" =~ ^[oO]$ ]]; then
    if $FIXTURES_CMD 2>&1; then
        echo ""
        echo -e "${GREEN}✅ Fixtures chargées avec succès !${NC}"
    else
        echo -e "${YELLOW}⚠️  Erreur lors du chargement des fixtures${NC}"
        echo "   Tentative avec l'option --append..."
        if php bin/console doctrine:fixtures:load --append --no-interaction --env=dev 2>&1; then
            echo -e "${GREEN}✅ Fixtures chargées avec succès (mode append) !${NC}"
        else
            echo -e "${RED}❌ Impossible de charger les fixtures${NC}"
            echo "   Vérifiez que le bundle DoctrineFixturesBundle est installé"
            echo "   Commande : composer require --dev doctrine/doctrine-fixtures-bundle"
            exit 1
        fi
    fi
else
    echo -e "${YELLOW}⚠️  Chargement des fixtures annulé${NC}"
    echo ""
    echo "Pour charger les fixtures plus tard :"
    echo "  php bin/console doctrine:fixtures:load --env=dev --no-interaction"
fi

echo ""
echo "══════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ Migration et fixtures terminées !${NC}"
echo "══════════════════════════════════════════════════════════════"
echo ""
echo "📋 Informations importantes :"
echo "   - Utilisateur admin créé : admin@losombras.com"
echo "   - Mot de passe : admin123"
echo "   - Rôle : ROLE_JEFE"
echo ""
echo "🧪 Pour tester :"
echo "   php bin/console doctrine:query:sql \"SELECT COUNT(*) FROM user\""
echo "   php bin/console doctrine:query:sql \"SELECT COUNT(*) FROM article\""
echo ""

