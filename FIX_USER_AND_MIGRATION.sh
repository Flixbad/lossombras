#!/bin/bash
# Script pour corriger l'utilisateur MariaDB et marquer la migration comme exécutée

echo "🔧 Correction de l'accès MariaDB et de la migration"
echo ""

# Demander le nom de la base de données
read -p "Nom de la base de données (par défaut: los_sombras) : " DB_NAME
DB_NAME=${DB_NAME:-los_sombras}

# Demander le mot de passe souhaité pour l'utilisateur
read -sp "Nouveau mot de passe pour 'los_sombras_user' : " NEW_PASSWORD
echo ""

if [ -z "$NEW_PASSWORD" ]; then
    echo "❌ Le mot de passe ne peut pas être vide"
    exit 1
fi

echo ""
echo "📋 Correction en cours..."
echo ""

# Exécuter les corrections
sudo mysql <<EOF
-- Créer l'utilisateur s'il n'existe pas ou réinitialiser le mot de passe
CREATE USER IF NOT EXISTS 'los_sombras_user'@'localhost' IDENTIFIED BY '$NEW_PASSWORD';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO 'los_sombras_user'@'localhost';
FLUSH PRIVILEGES;

-- Vérifier que l'utilisateur existe
SELECT User, Host FROM mysql.user WHERE User = 'los_sombras_user';

-- Marquer la migration comme exécutée
USE ${DB_NAME};
INSERT IGNORE INTO doctrine_migration_versions (version, executed_at, execution_time)
VALUES ('DoctrineMigrations\\\\Version20251121204144', NOW(), 0);

SELECT '✅ Utilisateur créé/modifié et migration marquée' AS Status;
EOF

echo ""
echo "✅ Corrections effectuées !"
echo ""
echo "📝 N'oubliez pas de mettre à jour le fichier .env avec le nouveau mot de passe :"
echo "   DATABASE_URL=\"mysql://los_sombras_user:${NEW_PASSWORD}@127.0.0.1:3306/${DB_NAME}?serverVersion=8.0.31&charset=utf8mb4\""
echo ""
echo "📋 Vous pouvez maintenant relancer :"
echo "   cd /var/www/lossombras/backend"
echo "   php bin/console doctrine:migrations:migrate --no-interaction"

