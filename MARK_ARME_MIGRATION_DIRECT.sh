#!/bin/bash
# Script pour marquer la migration arme directement avec sudo mysql

echo "🔧 Marquage de la migration Version20251122000824"
echo ""

read -p "Nom de la base de données (par défaut: los_sombras) : " DB_NAME
DB_NAME=${DB_NAME:-los_sombras}

echo ""
echo "📋 Marquage en cours avec sudo mysql..."
echo ""

# Utiliser sudo mysql directement (pas besoin de mot de passe)
# D'abord vérifier que MariaDB est démarré
if ! sudo systemctl is-active --quiet mariadb; then
    echo "⚠️  MariaDB n'est pas démarré, démarrage en cours..."
    sudo systemctl start mariadb
    sleep 2
fi

# Se connecter avec sudo mysql et utiliser la base
sudo mysql <<EOF
USE ${DB_NAME};
INSERT IGNORE INTO doctrine_migration_versions (version, executed_at, execution_time)
VALUES ('DoctrineMigrations\\\\Version20251122000824', NOW(), 0);

SELECT '✅ Migration marquée comme exécutée' AS Status;
SELECT version, executed_at FROM doctrine_migration_versions 
WHERE version = 'DoctrineMigrations\\\\Version20251122000824';
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration marquée avec succès !"
    echo ""
    echo "📋 Vous pouvez maintenant relancer :"
    echo "   cd /var/www/lossombras/backend"
    echo "   php bin/console doctrine:migrations:migrate --no-interaction"
else
    echo ""
    echo "❌ Erreur lors du marquage de la migration"
    echo "   Essayez manuellement : sudo mysql"
fi

