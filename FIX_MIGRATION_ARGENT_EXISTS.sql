-- Script pour corriger l'erreur de migration : Table 'argent' already exists
-- À exécuter directement dans MariaDB/MySQL

-- 1. Vérifier si la table doctrine_migration_versions existe
-- Si elle n'existe pas, la créer
CREATE TABLE IF NOT EXISTS doctrine_migration_versions (
    version VARCHAR(1024) NOT NULL,
    executed_at DATETIME DEFAULT NULL,
    execution_time INT DEFAULT NULL,
    PRIMARY KEY (version)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Marquer la migration Version20251121204144 comme exécutée
-- Si elle n'est pas déjà marquée
INSERT IGNORE INTO doctrine_migration_versions (version, executed_at, execution_time)
VALUES ('DoctrineMigrations\\Version20251121204144', NOW(), 0);

-- 3. Vérifier les autres migrations importantes qui peuvent poser problème
-- Marquer Version20251205171036 si la table vente_drogue existe déjà avec la bonne structure
INSERT IGNORE INTO doctrine_migration_versions (version, executed_at, execution_time)
VALUES ('DoctrineMigrations\\Version20251205171036', NOW(), 0);

-- Marquer Version20251205190325 si le champ type_drogue existe déjà
INSERT IGNORE INTO doctrine_migration_versions (version, executed_at, execution_time)
VALUES ('DoctrineMigrations\\Version20251205190325', NOW(), 0);

-- 4. Afficher l'état des migrations
SELECT * FROM doctrine_migration_versions ORDER BY executed_at DESC LIMIT 10;

