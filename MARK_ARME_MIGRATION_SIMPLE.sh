#!/bin/bash
# Script simple pour marquer la migration arme

echo "🔧 Marquage de la migration Version20251122000824"
echo ""

# Vérifier que MariaDB est démarré
if ! sudo systemctl is-active --quiet mariadb; then
    echo "⚠️  MariaDB n'est pas démarré, démarrage en cours..."
    sudo systemctl start mariadb
    sleep 3
fi

# Demander le nom de la base
read -p "Nom de la base de données (par défaut: los_sombras) : " DB_NAME
DB_NAME=${DB_NAME:-los_sombras}

echo ""
echo "📋 Marquage en cours..."
echo ""

# Essayer différentes méthodes
echo "Méthode 1 : sudo mysql avec USE..."
sudo mysql <<EOF 2>&1
USE ${DB_NAME};
INSERT IGNORE INTO doctrine_migration_versions (version, executed_at, execution_time)
VALUES ('DoctrineMigrations\\\\Version20251122000824', NOW(), 0);
SELECT '✅ Migration marquée' AS Status;
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration marquée avec succès !"
    exit 0
fi

echo ""
echo "⚠️  Méthode 1 a échoué, essai avec connexion interactive..."
echo ""
echo "Exécutez manuellement ces commandes :"
echo ""
echo "sudo mysql"
echo ""
echo "Puis dans MySQL :"
echo "USE ${DB_NAME};"
echo "INSERT IGNORE INTO doctrine_migration_versions (version, executed_at, execution_time)"
echo "VALUES ('DoctrineMigrations\\\\Version20251122000824', NOW(), 0);"
echo "EXIT;"

