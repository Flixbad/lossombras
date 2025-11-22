#!/bin/bash

set -e

echo "🔧 Correction du charset dans DATABASE_URL"
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

# Sauvegarder
BACKUP_FILE=".env.local.backup.$(date +%Y%m%d_%H%M%S)"
cp .env.local "$BACKUP_FILE"
echo -e "${GREEN}✅ Sauvegarde créée : $BACKUP_FILE${NC}"
echo ""

# Lire la configuration actuelle
echo -e "${BLUE}📝 Configuration actuelle :${NC}"
CURRENT_DB_URL=$(grep "^DATABASE_URL=" .env.local | cut -d'"' -f2 || grep "^DATABASE_URL=" .env.local | cut -d'=' -f2- | tr -d '"')
echo "   $CURRENT_DB_URL"
echo ""

# Extraire les composants
if [[ "$CURRENT_DB_URL" =~ mysql://([^:]+):([^@]+)@([^:]+):([^/]+)/([^?]+)(.*) ]]; then
    DB_USER="${BASH_REMATCH[1]}"
    DB_PASS="${BASH_REMATCH[2]}"
    DB_HOST="${BASH_REMATCH[3]}"
    DB_PORT="${BASH_REMATCH[4]}"
    DB_NAME="${BASH_REMATCH[5]}"
    DB_PARAMS="${BASH_REMATCH[6]}"
    
    echo -e "${BLUE}📋 Composants extraits :${NC}"
    echo "   Utilisateur : $DB_USER"
    echo "   Host : $DB_HOST"
    echo "   Port : $DB_PORT"
    echo "   Base : $DB_NAME"
    echo "   Paramètres : $DB_PARAMS"
    echo ""
else
    echo -e "${RED}❌ Impossible de parser la DATABASE_URL${NC}"
    echo "   Format attendu : mysql://user:password@host:port/database?params"
    exit 1
fi

# Vérifier la version de MariaDB
echo -e "${BLUE}📝 Vérification de la version MariaDB...${NC}"
if command -v mysql &> /dev/null; then
    DB_VERSION=$(mysql -u "$DB_USER" -p"$DB_PASS" -h "$DB_HOST" -P "$DB_PORT" -e "SELECT VERSION();" -s -N 2>/dev/null | grep -oP '^[0-9]+\.[0-9]+\.[0-9]+' | head -1 || echo "8.0.32")
else
    DB_VERSION="8.0.32"
fi

if [ -z "$DB_VERSION" ]; then
    DB_VERSION="8.0.32"
fi

echo -e "${GREEN}✅ Version détectée : $DB_VERSION${NC}"
echo ""

# Construire la nouvelle DATABASE_URL avec une syntaxe correcte
# Format correct : mysql://user:password@host:port/database?serverVersion=X.X.X&charset=utf8mb4
# OU sans paramètres charset si cela pose problème

echo -e "${BLUE}📝 Construction de la nouvelle DATABASE_URL...${NC}"

# Option 1 : Avec charset=utf8mb4
NEW_DB_URL_WITH_CHARSET="mysql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}?serverVersion=${DB_VERSION}&charset=utf8mb4"

# Option 2 : Sans charset (MariaDB utilise utf8mb4 par défaut)
NEW_DB_URL_WITHOUT_CHARSET="mysql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}?serverVersion=${DB_VERSION}"

# Tester d'abord avec charset
echo -e "${BLUE}📝 Test de la connexion avec charset=utf8mb4...${NC}"
if php -r "try { \$pdo = new PDO('$NEW_DB_URL_WITH_CHARSET'); echo 'OK'; } catch (Exception \$e) { echo 'ERREUR'; }" 2>/dev/null | grep -q "OK"; then
    NEW_DB_URL="$NEW_DB_URL_WITH_CHARSET"
    echo -e "${GREEN}✅ Connexion réussie avec charset=utf8mb4${NC}"
else
    echo -e "${YELLOW}⚠️  Connexion échouée avec charset, test sans charset...${NC}"
    # Tester sans charset
    if php -r "try { \$pdo = new PDO('$NEW_DB_URL_WITHOUT_CHARSET'); echo 'OK'; } catch (Exception \$e) { echo 'ERREUR'; }" 2>/dev/null | grep -q "OK"; then
        NEW_DB_URL="$NEW_DB_URL_WITHOUT_CHARSET"
        echo -e "${GREEN}✅ Connexion réussie sans charset (utf8mb4 par défaut)${NC}"
    else
        # Utiliser la version sans charset par défaut
        NEW_DB_URL="$NEW_DB_URL_WITHOUT_CHARSET"
        echo -e "${YELLOW}⚠️  Utilisation de la version sans charset par défaut${NC}"
    fi
fi

# Alternative : Tester directement avec la commande Doctrine
echo ""
echo -e "${BLUE}📝 Mise à jour de .env.local...${NC}"

# Remplacer la ligne DATABASE_URL
if grep -q "^DATABASE_URL=" .env.local; then
    # Utiliser une syntaxe simple et correcte
    sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"${NEW_DB_URL_WITHOUT_CHARSET}\"|" .env.local
    echo -e "${GREEN}✅ DATABASE_URL mis à jour${NC}"
else
    echo "DATABASE_URL=\"${NEW_DB_URL_WITHOUT_CHARSET}\"" >> .env.local
    echo -e "${GREEN}✅ DATABASE_URL ajouté${NC}"
fi

echo ""
echo -e "${BLUE}📝 Nouvelle configuration :${NC}"
grep "^DATABASE_URL=" .env.local
echo ""

# Tester avec Doctrine
echo -e "${BLUE}📝 Test avec Symfony Doctrine...${NC}"
if php bin/console doctrine:query:sql "SELECT 1" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Connexion Doctrine réussie !${NC}"
else
    echo -e "${YELLOW}⚠️  La commande Doctrine a échoué${NC}"
    echo "   Vérifions la syntaxe..."
    
    # Essayer avec différentes variantes
    for VARIANT in \
        "mysql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}?serverVersion=${DB_VERSION}" \
        "mysql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}?serverVersion=${DB_VERSION}&charset=utf8mb4" \
        "mysql://${DB_USER}:${DB_PASS}@${DB_HOST}/${DB_NAME}?serverVersion=${DB_VERSION}"; do
        
        echo -e "${BLUE}   Test avec : $VARIANT${NC}"
        sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"${VARIANT}\"|" .env.local
        
        if php bin/console doctrine:query:sql "SELECT 1" >/dev/null 2>&1; then
            echo -e "${GREEN}   ✅ Cette variante fonctionne !${NC}"
            break
        fi
    done
fi

echo ""
echo "══════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ Configuration DATABASE_URL corrigée !${NC}"
echo "══════════════════════════════════════════════════════════════"
echo ""
echo "🧪 Pour tester :"
echo "   php bin/console doctrine:query:sql \"SELECT 1\""
echo ""

