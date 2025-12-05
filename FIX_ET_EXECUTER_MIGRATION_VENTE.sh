#!/bin/bash

echo "🔧 Correction de la migration vente_drogue..."
echo ""

cd backend || exit 1

# 1. Marquer manuellement la migration Version20251205165331 comme exécutée
echo "📝 Étape 1: Marquage de la migration Version20251205165331 comme exécutée..."

# Obtenir les informations de connexion à la base de données
DB_URL=$(php -r "require 'vendor/autoload.php'; \$env = file_get_contents('.env.local'); preg_match('/DATABASE_URL=(.+)/', \$env, \$matches); echo \$matches[1] ?? 'mysql://root:root@127.0.0.1:3306/los-sombras';")

# Extraire les informations de connexion
if [[ $DB_URL == mysql://* ]]; then
    DB_URL=${DB_URL#mysql://}
    IFS='@' read -r USER_PASS HOST_DB <<< "$DB_URL"
    IFS=':' read -r DB_USER DB_PASS <<< "$USER_PASS"
    IFS='/' read -r HOST_PORT DB_NAME <<< "$HOST_DB"
    IFS=':' read -r DB_HOST DB_PORT <<< "$HOST_PORT"
    DB_PORT=${DB_PORT:-3306}
    
    echo "Connexion à la base de données: $DB_NAME sur $DB_HOST:$DB_PORT"
    
    # Marquer la migration comme exécutée
    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "
    INSERT INTO doctrine_migration_versions (version, executed_at, execution_time) 
    VALUES ('DoctrineMigrations\\\\Version20251205165331', NOW(), 0)
    ON DUPLICATE KEY UPDATE executed_at = NOW();
    " 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "✅ Migration marquée comme exécutée"
    else
        echo "⚠️  Impossible de marquer automatiquement. Vous devrez le faire manuellement."
    fi
else
    echo "⚠️  Format de DATABASE_URL non reconnu. Marquez la migration manuellement."
fi

echo ""
echo "📝 Étape 2: Vérification et modification de la structure de vente_drogue..."

# Vérifier si la table existe et sa structure
mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "
-- Ajouter montant_vente_total si elle n'existe pas
SET @dbname = DATABASE();
SET @tablename = 'vente_drogue';
SET @columnname = 'montant_vente_total';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' NUMERIC(10, 2) DEFAULT NULL')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Ajouter cout_achat_total si elle n'existe pas
SET @columnname = 'cout_achat_total';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' NUMERIC(10, 2) DEFAULT NULL')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;
" 2>/dev/null

echo ""
echo "📝 Étape 3: Exécution de la migration Version20251205171036..."
php bin/console doctrine:migrations:migrate --no-interaction

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration terminée avec succès !"
    echo ""
    echo "La table vente_drogue devrait maintenant avoir la bonne structure."
else
    echo ""
    echo "⚠️  Il y a eu des erreurs. Vérifiez les messages ci-dessus."
    echo ""
    echo "Si la table vente_drogue a encore l'ancienne structure, exécutez manuellement :"
    echo "ALTER TABLE vente_drogue DROP COLUMN nb_pochons;"
    echo "ALTER TABLE vente_drogue CHANGE prix_vente_unitaire montant_vente_total NUMERIC(10, 2) NOT NULL;"
fi

