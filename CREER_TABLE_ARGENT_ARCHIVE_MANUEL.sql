-- Script SQL pour créer manuellement la table argent_archive
-- À exécuter si la migration ne fonctionne pas

-- Vérifier si la table existe déjà
SELECT 'Vérification de l''existence de la table...' AS info;

-- Créer la table argent_archive
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
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB;

-- Ajouter la clé étrangère (si elle n'existe pas déjà)
-- Note: Modifiez cette commande si vous avez une erreur de contrainte existante
ALTER TABLE argent_archive 
ADD CONSTRAINT FK_ARCHIVE_CLOSED_BY 
FOREIGN KEY (closed_by_id) REFERENCES `user` (id);

-- Vérifier que la table a été créée
SHOW TABLES LIKE 'argent_archive';
DESCRIBE argent_archive;

