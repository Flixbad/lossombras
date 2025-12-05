-- Script SQL pour corriger la structure de la table vente_drogue
-- À exécuter manuellement dans votre base de données

-- 1. Marquer la migration Version20251205165331 comme exécutée
INSERT INTO doctrine_migration_versions (version, executed_at, execution_time) 
VALUES ('DoctrineMigrations\\Version20251205165331', NOW(), 0)
ON DUPLICATE KEY UPDATE executed_at = NOW();

-- 2. Vérifier si la table vente_drogue existe et modifier sa structure
-- Si elle a déjà les colonnes montant_vente_total et cout_achat_total, ces commandes seront ignorées

-- Ajouter montant_vente_total si elle n'existe pas
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                   WHERE TABLE_SCHEMA = DATABASE() 
                   AND TABLE_NAME = 'vente_drogue' 
                   AND COLUMN_NAME = 'montant_vente_total');

SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE vente_drogue ADD COLUMN montant_vente_total NUMERIC(10, 2) DEFAULT NULL',
    'SELECT "Column montant_vente_total already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ajouter cout_achat_total si elle n'existe pas
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                   WHERE TABLE_SCHEMA = DATABASE() 
                   AND TABLE_NAME = 'vente_drogue' 
                   AND COLUMN_NAME = 'cout_achat_total');

SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE vente_drogue ADD COLUMN cout_achat_total NUMERIC(10, 2) DEFAULT NULL',
    'SELECT "Column cout_achat_total already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. Si prix_vente_unitaire existe, la renommer en montant_vente_total (si montant_vente_total n'existe pas déjà)
SET @prix_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_SCHEMA = DATABASE() 
                    AND TABLE_NAME = 'vente_drogue' 
                    AND COLUMN_NAME = 'prix_vente_unitaire');

SET @montant_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                       WHERE TABLE_SCHEMA = DATABASE() 
                       AND TABLE_NAME = 'vente_drogue' 
                       AND COLUMN_NAME = 'montant_vente_total');

SET @sql = IF(@prix_exists > 0 AND @montant_exists = 0, 
    'ALTER TABLE vente_drogue CHANGE prix_vente_unitaire montant_vente_total NUMERIC(10, 2) NOT NULL',
    'SELECT "No rename needed" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4. Supprimer nb_pochons si elle existe
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                   WHERE TABLE_SCHEMA = DATABASE() 
                   AND TABLE_NAME = 'vente_drogue' 
                   AND COLUMN_NAME = 'nb_pochons');

SET @sql = IF(@col_exists > 0, 
    'ALTER TABLE vente_drogue DROP COLUMN nb_pochons',
    'SELECT "Column nb_pochons does not exist" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Afficher la structure finale
DESCRIBE vente_drogue;

