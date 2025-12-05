#!/bin/bash

# Script pour créer uniquement la table argent_archive sans toucher aux autres migrations
# Usage: ./FIX_MIGRATION_ARGENT_ARCHIVE.sh

echo "🔧 Création de la table argent_archive manuellement"
echo "==================================================="
echo ""

cd /var/www/lossombras/backend

# Vérifier si la table existe déjà
TABLE_EXISTS=$(php bin/console doctrine:query:sql "SHOW TABLES LIKE 'argent_archive'" 2>/dev/null | grep -c "argent_archive" || echo "0")

if [ "$TABLE_EXISTS" != "0" ]; then
    echo "✅ La table argent_archive existe déjà. Rien à faire."
    exit 0
fi

echo "📝 Création de la table argent_archive..."
php bin/console doctrine:query:sql "
CREATE TABLE IF NOT EXISTS argent_archive (
    id INT AUTO_INCREMENT NOT NULL,
    solde NUMERIC(10, 2) NOT NULL,
    date_cloture DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)',
    semaine VARCHAR(10) NOT NULL,
    commentaire LONGTEXT DEFAULT NULL,
    closed_by_id INT DEFAULT NULL,
    created_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)',
    INDEX IDX_ARCHIVE_CLOSED_BY (closed_by_id),
    PRIMARY KEY(id)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB
" 2>/dev/null || echo "⚠️ Erreur lors de la création de la table"

echo ""
echo "📝 Ajout de la clé étrangère..."
php bin/console doctrine:query:sql "
ALTER TABLE argent_archive 
ADD CONSTRAINT FK_ARCHIVE_CLOSED_BY 
FOREIGN KEY (closed_by_id) REFERENCES \`user\` (id)
" 2>/dev/null || echo "⚠️ Clé étrangère déjà ajoutée ou erreur"

echo ""
echo "📝 Marquage de la migration comme exécutée..."
php bin/console doctrine:migrations:version DoctrineMigrations\\Version20251205112540 --add --no-interaction 2>/dev/null || echo "⚠️ Migration déjà marquée ou erreur"

echo ""
echo "✅ Terminé ! Vérifiez que la table existe :"
php bin/console doctrine:query:sql "SHOW TABLES LIKE 'argent_archive'"

