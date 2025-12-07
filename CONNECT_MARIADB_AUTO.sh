#!/bin/bash
# Script automatique pour se connecter à MariaDB en utilisant les identifiants du .env

echo "🔍 Recherche des identifiants dans le fichier .env..."
echo ""

cd /var/www/html/los-sombras/backend || cd backend || exit 1

if [ ! -f .env ]; then
    echo "❌ Fichier .env non trouvé dans le répertoire backend"
    echo "   Cherché dans : $(pwd)"
    exit 1
fi

# Extraire DATABASE_URL
DB_URL=$(grep "^DATABASE_URL=" .env | cut -d '=' -f 2- | tr -d '"' | tr -d "'")

if [ -z "$DB_URL" ]; then
    echo "❌ DATABASE_URL non trouvé dans .env"
    exit 1
fi

# Extraire les composants
DB_USER=$(echo "$DB_URL" | sed -n 's/.*mysql:\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo "$DB_URL" | sed -n 's/.*mysql:\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo "$DB_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo "$DB_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo "$DB_URL" | sed -n 's/.*\/\([^?]*\).*/\1/p')

echo "📋 Informations extraites :"
echo "   User: $DB_USER"
echo "   Host: ${DB_HOST:-localhost}"
echo "   Port: ${DB_PORT:-3306}"
echo "   Database: $DB_NAME"
echo ""

if [ -z "$DB_USER" ] || [ -z "$DB_PASS" ] || [ -z "$DB_NAME" ]; then
    echo "❌ Impossible d'extraire toutes les informations nécessaires"
    echo "   DATABASE_URL trouvé : $DB_URL"
    exit 1
fi

echo "🔌 Connexion à MariaDB/MySQL..."
echo ""

# Tester la connexion
if mysql -u "$DB_USER" -p"$DB_PASS" -h "${DB_HOST:-localhost}" -P "${DB_PORT:-3306}" "$DB_NAME" -e "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Connexion réussie !"
    echo ""
    echo "📝 Vous pouvez maintenant exécuter des commandes SQL"
    echo "   Tapez 'exit' pour quitter"
    echo ""
    mysql -u "$DB_USER" -p"$DB_PASS" -h "${DB_HOST:-localhost}" -P "${DB_PORT:-3306}" "$DB_NAME"
else
    echo "❌ Échec de la connexion"
    echo ""
    echo "🔧 Tentatives alternatives :"
    echo ""
    echo "1. Essayez avec sudo :"
    echo "   sudo mysql -u $DB_USER -p$DB_NAME"
    echo ""
    echo "2. Essayez en tant que root :"
    echo "   sudo mysql"
    echo ""
    echo "3. Vérifiez que MariaDB est démarré :"
    echo "   sudo systemctl status mariadb"
    echo ""
    exit 1
fi

