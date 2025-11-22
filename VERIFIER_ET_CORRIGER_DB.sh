#!/bin/bash

set -e

echo "🔍 Vérification et correction de la base de données"
echo "══════════════════════════════════════════════════════════════"
echo ""

cd /var/www/lossombras/backend || exit

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 1. Lire la configuration actuelle
echo -e "${BLUE}📝 Configuration actuelle dans .env.local :${NC}"
if [ -f .env.local ]; then
    CURRENT_DB_URL=$(grep "^DATABASE_URL=" .env.local | cut -d'"' -f2 || echo "")
    if [ -n "$CURRENT_DB_URL" ]; then
        echo "   $CURRENT_DB_URL"
        # Extraire les infos de la DATABASE_URL
        DB_USER=$(echo "$CURRENT_DB_URL" | sed -n 's|mysql://\([^:]*\):.*|\1|p')
        DB_PASS=$(echo "$CURRENT_DB_URL" | sed -n 's|mysql://[^:]*:\([^@]*\)@.*|\1|p')
        DB_HOST=$(echo "$CURRENT_DB_URL" | sed -n 's|mysql://[^@]*@\([^:]*\):.*|\1|p')
        DB_PORT=$(echo "$CURRENT_DB_URL" | sed -n 's|mysql://[^@]*@[^:]*:\([^/]*\)/.*|\1|p')
        DB_NAME=$(echo "$CURRENT_DB_URL" | sed -n 's|mysql://[^/]*/\([^?]*\).*|\1|p')
        
        echo ""
        echo -e "${BLUE}📋 Informations extraites :${NC}"
        echo "   Utilisateur : $DB_USER"
        echo "   Host : $DB_HOST"
        echo "   Port : $DB_PORT"
        echo "   Base : $DB_NAME"
    else
        echo -e "${RED}❌ DATABASE_URL non trouvé dans .env.local${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Fichier .env.local non trouvé${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}📝 Connexion à MariaDB pour vérifier...${NC}"

# 2. Vérifier quelle base existe
echo -e "${BLUE}📋 Bases de données disponibles :${NC}"
mysql -u root -p -e "SHOW DATABASES;" 2>/dev/null | grep -E "(los|Database)" || {
    read -sp "📝 Entrez le mot de passe root MariaDB : " ROOT_PASS
    echo ""
    mysql -u root -p"$ROOT_PASS" -e "SHOW DATABASES;" | grep -E "(los|Database)"
}

echo ""
read -p "📝 Utilisez-vous root ou un autre mot de passe ? [root] : " USE_ROOT
USE_ROOT=${USE_ROOT:-root}

if [ "$USE_ROOT" = "root" ]; then
    read -sp "📝 Entrez le mot de passe root MariaDB : " ROOT_PASS
    echo ""
    MYSQL_CMD="mysql -u root -p${ROOT_PASS}"
else
    MYSQL_CMD="mysql -u ${DB_USER} -p${DB_PASS}"
fi

# 3. Lister les bases existantes
echo -e "${BLUE}📋 Bases de données contenant 'los' :${NC}"
$MYSQL_CMD -e "SHOW DATABASES;" 2>/dev/null | grep los || echo "   Aucune base trouvée"

echo ""
read -p "📝 Nom de la base de données à utiliser [los_sombras] : " TARGET_DB
TARGET_DB=${TARGET_DB:-los_sombras}

# 4. Vérifier si la base existe
echo -e "${BLUE}📝 Vérification de la base '$TARGET_DB'...${NC}"
if $MYSQL_CMD -e "USE $TARGET_DB;" 2>/dev/null; then
    echo -e "${GREEN}✅ Base '$TARGET_DB' existe${NC}"
else
    echo -e "${YELLOW}⚠️  Base '$TARGET_DB' n'existe pas${NC}"
    read -p "📝 Voulez-vous la créer ? [o/N] : " CREATE_DB
    CREATE_DB=${CREATE_DB:-N}
    if [[ "$CREATE_DB" =~ ^[oO]$ ]]; then
        echo -e "${BLUE}📝 Création de la base '$TARGET_DB'...${NC}"
        $MYSQL_CMD -e "CREATE DATABASE IF NOT EXISTS $TARGET_DB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
        echo -e "${GREEN}✅ Base créée${NC}"
    else
        echo -e "${RED}❌ Base non créée, arrêt${NC}"
        exit 1
    fi
fi

# 5. Vérifier les droits de l'utilisateur
echo ""
echo -e "${BLUE}📝 Vérification des droits pour '$DB_USER' sur '$TARGET_DB'...${NC}"
if $MYSQL_CMD -e "SHOW GRANTS FOR '${DB_USER}'@'localhost';" 2>/dev/null | grep -q "$TARGET_DB"; then
    echo -e "${GREEN}✅ L'utilisateur a déjà des droits${NC}"
else
    echo -e "${YELLOW}⚠️  L'utilisateur n'a pas de droits explicites${NC}"
    read -p "📝 Voulez-vous accorder tous les droits ? [o/N] : " GRANT_ACCESS
    GRANT_ACCESS=${GRANT_ACCESS:-N}
    if [[ "$GRANT_ACCESS" =~ ^[oO]$ ]]; then
        echo -e "${BLUE}📝 Attribution des droits...${NC}"
        $MYSQL_CMD -e "GRANT ALL PRIVILEGES ON $TARGET_DB.* TO '${DB_USER}'@'localhost';"
        $MYSQL_CMD -e "FLUSH PRIVILEGES;"
        echo -e "${GREEN}✅ Droits accordés${NC}"
    fi
fi

# 6. Tester la connexion avec les nouvelles informations
echo ""
echo -e "${BLUE}📝 Test de la connexion avec les nouvelles informations...${NC}"
if mysql -u "$DB_USER" -p"$DB_PASS" -h "$DB_HOST" -P "$DB_PORT" -e "USE $TARGET_DB; SELECT 1;" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Connexion réussie !${NC}"
else
    echo -e "${RED}❌ Impossible de se connecter${NC}"
    echo "   Vérifiez le mot de passe et les droits"
    exit 1
fi

# 7. Mettre à jour .env.local si nécessaire
if [ "$DB_NAME" != "$TARGET_DB" ]; then
    echo ""
    echo -e "${YELLOW}⚠️  Le nom de la base dans .env.local est différent ($DB_NAME vs $TARGET_DB)${NC}"
    read -p "📝 Voulez-vous mettre à jour .env.local ? [O/n] : " UPDATE_ENV
    UPDATE_ENV=${UPDATE_ENV:-O}
    if [[ "$UPDATE_ENV" =~ ^[oO]$ ]] || [ -z "$UPDATE_ENV" ]; then
        # Sauvegarder
        BACKUP_FILE=".env.local.backup.$(date +%Y%m%d_%H%M%S)"
        cp .env.local "$BACKUP_FILE"
        echo -e "${GREEN}✅ Sauvegarde créée : $BACKUP_FILE${NC}"
        
        # Extraire la version de MariaDB
        DB_VERSION=$(echo "$CURRENT_DB_URL" | sed -n 's|.*serverVersion=\([^&]*\).*|\1|p')
        if [ -z "$DB_VERSION" ]; then
            DB_VERSION="8.0.32"
        fi
        
        # Construire la nouvelle URL
        NEW_DATABASE_URL="mysql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${TARGET_DB}?serverVersion=${DB_VERSION}&charset=utf8mb4"
        
        # Remplacer dans .env.local
        sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"${NEW_DATABASE_URL}\"|" .env.local
        
        echo -e "${GREEN}✅ .env.local mis à jour${NC}"
        echo ""
        echo -e "${BLUE}📝 Nouvelle configuration :${NC}"
        grep "^DATABASE_URL=" .env.local
    fi
fi

# 8. Tester avec Symfony
echo ""
echo -e "${BLUE}📝 Test avec Symfony...${NC}"
if php bin/console doctrine:query:sql "SELECT 1" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Connexion Symfony réussie !${NC}"
else
    echo -e "${YELLOW}⚠️  La commande Symfony a échoué${NC}"
    echo "   Vérifiez manuellement : php bin/console doctrine:query:sql \"SELECT 1\""
fi

echo ""
echo "══════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ Vérification terminée !${NC}"
echo "══════════════════════════════════════════════════════════════"
echo ""
echo "🧪 Pour tester :"
echo "   cd /var/www/lossombras/backend"
echo "   php bin/console doctrine:query:sql \"SELECT 1\""
echo ""

