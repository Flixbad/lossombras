#!/bin/bash

set -e

echo "🔧 Correction de la configuration DATABASE_URL"
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
    echo -e "${YELLOW}⚠️  Fichier .env.local non trouvé${NC}"
    echo "   Création depuis .env..."
    if [ -f .env ]; then
        cp .env .env.local
    else
        echo -e "${RED}❌ Fichier .env non trouvé non plus${NC}"
        exit 1
    fi
fi

echo -e "${BLUE}📝 Configuration actuelle :${NC}"
grep "^DATABASE_URL=" .env.local || echo "   DATABASE_URL non trouvé"
echo ""

# Demander les informations de connexion
read -p "📝 Entrez le nom d'utilisateur MariaDB [los_sombras_user] : " DB_USER
DB_USER=${DB_USER:-los_sombras_user}

read -sp "📝 Entrez le mot de passe MariaDB : " DB_PASS
echo ""

read -p "📝 Entrez le nom de la base de données [los_sombras] : " DB_NAME
DB_NAME=${DB_NAME:-los_sombras}

read -p "📝 Entrez le port MariaDB [3306] : " DB_PORT
DB_PORT=${DB_PORT:-3306}

# Vérifier la version de MariaDB
echo -e "${BLUE}📝 Vérification de la version MariaDB...${NC}"
DB_VERSION=$(mysql -u "$DB_USER" -p"$DB_PASS" -h 127.0.0.1 -P "$DB_PORT" -e "SELECT VERSION();" -s -N 2>/dev/null | grep -oP '^[0-9]+\.[0-9]+\.[0-9]+' | head -1 || echo "8.0.32")

if [ -z "$DB_VERSION" ]; then
    echo -e "${YELLOW}⚠️  Impossible de détecter la version, utilisation de 8.0.32 par défaut${NC}"
    DB_VERSION="8.0.32"
else
    echo -e "${GREEN}✅ Version détectée : $DB_VERSION${NC}"
fi

# Tester la connexion
echo -e "${BLUE}📝 Test de la connexion à la base de données...${NC}"
if mysql -u "$DB_USER" -p"$DB_PASS" -h 127.0.0.1 -P "$DB_PORT" -e "USE $DB_NAME; SELECT 1;" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Connexion réussie !${NC}"
else
    echo -e "${RED}❌ Impossible de se connecter à la base de données${NC}"
    echo "   Vérifiez :"
    echo "   - Le nom d'utilisateur et le mot de passe"
    echo "   - Que la base de données existe : CREATE DATABASE $DB_NAME;"
    echo "   - Que l'utilisateur a les droits : GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';"
    exit 1
fi

# Construire la nouvelle DATABASE_URL
NEW_DATABASE_URL="mysql://${DB_USER}:${DB_PASS}@127.0.0.1:${DB_PORT}/${DB_NAME}?serverVersion=${DB_VERSION}&charset=utf8mb4"

# Sauvegarder l'ancien fichier
BACKUP_FILE=".env.local.backup.$(date +%Y%m%d_%H%M%S)"
cp .env.local "$BACKUP_FILE"
echo -e "${GREEN}✅ Sauvegarde créée : $BACKUP_FILE${NC}"

# Remplacer ou ajouter DATABASE_URL
if grep -q "^DATABASE_URL=" .env.local; then
    # Remplacer la ligne existante
    sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"${NEW_DATABASE_URL}\"|" .env.local
    echo -e "${GREEN}✅ DATABASE_URL mis à jour${NC}"
else
    # Ajouter la ligne si elle n'existe pas
    echo "" >> .env.local
    echo "DATABASE_URL=\"${NEW_DATABASE_URL}\"" >> .env.local
    echo -e "${GREEN}✅ DATABASE_URL ajouté${NC}"
fi

echo ""
echo -e "${BLUE}📝 Nouvelle configuration :${NC}"
grep "^DATABASE_URL=" .env.local
echo ""

# Tester avec Symfony
echo -e "${BLUE}📝 Test de la connexion avec Symfony...${NC}"
if php bin/console doctrine:query:sql "SELECT 1" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Connexion Symfony réussie !${NC}"
else
    echo -e "${YELLOW}⚠️  La commande Symfony a échoué, mais cela peut être normal${NC}"
    echo "   Vérifiez manuellement : php bin/console doctrine:query:sql \"SELECT 1\""
fi

echo ""
echo "══════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ Configuration DATABASE_URL corrigée avec succès !${NC}"
echo "══════════════════════════════════════════════════════════════"
echo ""
echo "🧪 Pour tester la connexion :"
echo "   php bin/console doctrine:query:sql \"SELECT 1\""
echo ""

