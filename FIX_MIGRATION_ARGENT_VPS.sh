#!/bin/bash
# Script pour corriger l'erreur de migration sur le VPS

echo "🔧 Correction de l'erreur de migration : Table 'argent' already exists"
echo ""

# Demander les informations de connexion à la base de données
read -p "Nom de la base de données : " DB_NAME
read -p "Utilisateur MySQL/MariaDB : " DB_USER
read -sp "Mot de passe MySQL/MariaDB : " DB_PASS
echo ""

# Exécuter le script SQL pour marquer la migration comme exécutée
mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" <<EOF
-- Marquer la migration Version20251121204144 comme exécutée
INSERT IGNORE INTO doctrine_migration_versions (version, executed_at, execution_time)
VALUES ('DoctrineMigrations\\\\Version20251121204144', NOW(), 0);

-- Vérifier l'état
SELECT version, executed_at FROM doctrine_migration_versions 
WHERE version LIKE '%Version20251121204144%' OR version LIKE '%Version20251205171036%' OR version LIKE '%Version20251205190325%'
ORDER BY executed_at DESC;
EOF

echo ""
echo "✅ Migration marquée comme exécutée"
echo ""
echo "📋 Vous pouvez maintenant relancer :"
echo "   php bin/console doctrine:migrations:migrate --no-interaction"

