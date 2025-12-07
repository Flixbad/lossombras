-- Script SQL pour corriger le problème de migration
-- Marquer la migration Version20251205165331 comme exécutée
INSERT INTO doctrine_migration_versions (version, executed_at, execution_time) 
VALUES ('DoctrineMigrations\\Version20251205165331', NOW(), 0)
ON DUPLICATE KEY UPDATE executed_at = NOW();

-- Vérifier la structure actuelle de vente_drogue
-- Si elle a encore nb_pochons et prix_vente_unitaire, on la modifie :

-- 1. Ajouter les nouvelles colonnes si elles n'existent pas
ALTER TABLE vente_drogue 
ADD COLUMN IF NOT EXISTS montant_vente_total NUMERIC(10, 2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS cout_achat_total NUMERIC(10, 2) DEFAULT NULL;

-- 2. Si prix_vente_unitaire existe, copier les valeurs vers montant_vente_total (si besoin)
-- Pour l'instant, on va juste renommer et supprimer
-- ATTENTION: Cela supprimera les données existantes de nb_pochons et prix_vente_unitaire

-- Si vous avez des données importantes, sauvegardez-les d'abord !



