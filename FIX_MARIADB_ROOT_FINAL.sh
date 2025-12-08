#!/bin/bash
# Script final pour se connecter à MariaDB et marquer les migrations

echo "🔧 Connexion à MariaDB et correction des migrations"
echo ""

# Méthode 1 : Essayer sudo mysql
echo "📋 Tentative 1 : sudo mysql"
if sudo mysql -e "SELECT 1;" 2>/dev/null; then
    echo "✅ Connexion réussie avec sudo mysql"
    echo ""
    read -p "Nom de la base de données (par défaut: los_sombras) : " DB_NAME
    DB_NAME=${DB_NAME:-los_sombras}
    
    sudo mysql <<EOF
USE ${DB_NAME};
INSERT IGNORE INTO doctrine_migration_versions (version, executed_at, execution_time)
VALUES ('DoctrineMigrations\\\\Version20251121204144', NOW(), 0);

INSERT IGNORE INTO doctrine_migration_versions (version, executed_at, execution_time)
VALUES ('DoctrineMigrations\\\\Version20251205171036', NOW(), 0);

INSERT IGNORE INTO doctrine_migration_versions (version, executed_at, execution_time)
VALUES ('DoctrineMigrations\\\\Version20251205190325', NOW(), 0);

SELECT '✅ Migrations marquées comme exécutées' AS Status;
SELECT version, executed_at FROM doctrine_migration_versions 
WHERE version LIKE '%Version20251121204144%' 
   OR version LIKE '%Version20251205171036%' 
   OR version LIKE '%Version20251205190325%'
ORDER BY executed_at DESC;
EOF
    exit 0
fi

# Méthode 2 : Vérifier le statut de MariaDB
echo "⚠️  Échec avec sudo mysql"
echo ""
echo "📋 Vérification du statut de MariaDB..."
if ! sudo systemctl is-active --quiet mariadb && ! sudo systemctl is-active --quiet mysql; then
    echo "⚠️  MariaDB n'est pas démarré, démarrage en cours..."
    sudo systemctl start mariadb || sudo systemctl start mysql
    sleep 2
fi

# Méthode 3 : Essayer avec le socket Unix
echo "📋 Tentative 2 : Connexion via socket Unix"
if sudo mysql --socket=/var/run/mysqld/mysqld.sock -e "SELECT 1;" 2>/dev/null; then
    echo "✅ Connexion réussie via socket"
    read -p "Nom de la base de données (par défaut: los_sombras) : " DB_NAME
    DB_NAME=${DB_NAME:-los_sombras}
    
    sudo mysql --socket=/var/run/mysqld/mysqld.sock <<EOF
USE ${DB_NAME};
INSERT IGNORE INTO doctrine_migration_versions (version, executed_at, execution_time)
VALUES ('DoctrineMigrations\\\\Version20251121204144', NOW(), 0);
SELECT '✅ Migration marquée' AS Status;
EOF
    exit 0
fi

# Si rien ne fonctionne, proposer une connexion interactive
echo "❌ Aucune méthode automatique n'a fonctionné"
echo ""
echo "🔧 Options manuelles :"
echo ""
echo "1. Essayez manuellement : sudo mysql"
echo "2. Si ça ne fonctionne pas, vérifiez les logs :"
echo "   sudo tail -20 /var/log/mysql/error.log"
echo "3. Créez un nouvel utilisateur admin si root est bloqué"
echo ""
echo "💡 Commande SQL à exécuter une fois connecté :"
echo "   USE votre_base;"
echo "   INSERT IGNORE INTO doctrine_migration_versions (version, executed_at, execution_time)"
echo "   VALUES ('DoctrineMigrations\\\\Version20251121204144', NOW(), 0);"

