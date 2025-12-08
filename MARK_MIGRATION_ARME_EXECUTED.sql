-- Script pour marquer la migration Version20251122000824 comme exécutée
-- La table 'arme' existe déjà, donc on marque juste la migration comme faite

-- Marquer la migration comme exécutée
INSERT IGNORE INTO doctrine_migration_versions (version, executed_at, execution_time)
VALUES ('DoctrineMigrations\\Version20251122000824', NOW(), 0);

-- Vérifier
SELECT version, executed_at FROM doctrine_migration_versions 
WHERE version = 'DoctrineMigrations\\Version20251122000824';

