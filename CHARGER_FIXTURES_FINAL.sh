#!/bin/bash

set -e

echo "🚀 Chargement des fixtures (version finale)"
echo "══════════════════════════════════════════════════════════════"
echo ""

cd /var/www/lossombras/backend || exit

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 1. Vider le cache pour que la nouvelle commande soit reconnue
echo -e "${BLUE}📝 1/4 - Vidage du cache Symfony...${NC}"
php bin/console cache:clear --no-interaction
echo -e "${GREEN}✅ Cache vidé${NC}"
echo ""

# 2. Vérifier que la commande existe
echo -e "${BLUE}📝 2/4 - Vérification de la commande...${NC}"
if php bin/console list | grep -q "app:load-fixtures"; then
    echo -e "${GREEN}✅ Commande trouvée${NC}"
else
    echo -e "${YELLOW}⚠️  Commande non trouvée, régénération de l'autoloader...${NC}"
    composer dump-autoload --no-interaction
    php bin/console cache:clear --no-interaction
    echo ""
    if php bin/console list | grep -q "app:load-fixtures"; then
        echo -e "${GREEN}✅ Commande maintenant disponible${NC}"
    else
        echo -e "${RED}❌ Commande toujours non trouvée${NC}"
        echo "   Vérifiez que le fichier backend/src/Command/LoadFixturesCommand.php existe"
        exit 1
    fi
fi
echo ""

# 3. Charger les fixtures
echo -e "${BLUE}📝 3/4 - Chargement des fixtures...${NC}"
if php bin/console app:load-fixtures --no-interaction 2>&1; then
    echo -e "${GREEN}✅ Fixtures chargées avec succès !${NC}"
else
    echo -e "${YELLOW}⚠️  Erreur (peut-être besoin de confirmation)...${NC}"
    echo -e "${BLUE}📝 Nouvelle tentative avec confirmation...${NC}"
    echo "yes" | php bin/console app:load-fixtures 2>&1 || {
        echo -e "${RED}❌ Erreur lors du chargement des fixtures${NC}"
        exit 1
    }
fi
echo ""

# 4. Vérification
echo -e "${BLUE}📝 4/4 - Vérification...${NC}"
ARTICLE_COUNT=$(php bin/console doctrine:query:sql "SELECT COUNT(*) FROM article" --no-interaction 2>/dev/null | grep -oP '\d+' | head -1 || echo "0")
USER_COUNT=$(php bin/console doctrine:query:sql "SELECT COUNT(*) FROM \`user\`" --no-interaction 2>/dev/null | grep -oP '\d+' | head -1 || echo "0")

echo "   Articles : $ARTICLE_COUNT"
echo "   Utilisateurs : $USER_COUNT"

if [ "$ARTICLE_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ Données créées avec succès !${NC}"
else
    echo -e "${YELLOW}⚠️  Aucun article trouvé${NC}"
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

