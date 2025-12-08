#!/bin/bash
# Script pour marquer la migration arme comme exécutée

echo "🔧 Marquage de la migration Version20251122000824 comme exécutée"
echo ""

read -p "Nom de la base de données (par défaut: los_sombras) : " DB_NAME
DB_NAME=${DB_NAME:-los_sombras}

echo ""
echo "📋 Marquage en cours..."
echo ""

# Se connecter et marquer la migration
sudo mysql <<EOF
USE ${DB_NAME};
INSERT IGNORE INTO doctrine_migration_versions (version, executed_at, execution_time)
VALUES ('DoctrineMigrations\\\\Version20251122000824', NOW(), 0);

SELECT '✅ Migration marquée comme exécutée' AS Status;
SELECT version, executed_at FROM doctrine_migration_versions 
WHERE version = 'DoctrineMigrations\\\\Version20251122000824';
EOF

echo ""
echo "✅ Migration marquée !"
echo ""
echo "📋 Vous pouvez maintenant relancer :"
echo "   cd /var/www/lossombras/backend"
echo "   php bin/console doctrine:migrations:migrate --no-interaction"

