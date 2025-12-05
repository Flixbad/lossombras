<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Migration pour créer la table argent_archive pour l'archivage hebdomadaire
 */
final class Version20251205112540 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Création de la table argent_archive pour l\'archivage hebdomadaire de la comptabilité';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE argent_archive (
            id INT AUTO_INCREMENT NOT NULL,
            solde NUMERIC(10, 2) NOT NULL,
            date_cloture DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            semaine VARCHAR(10) NOT NULL,
            commentaire LONGTEXT DEFAULT NULL,
            closed_by_id INT DEFAULT NULL,
            created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            INDEX IDX_ARCHIVE_CLOSED_BY (closed_by_id),
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        
        $this->addSql('ALTER TABLE argent_archive ADD CONSTRAINT FK_ARCHIVE_CLOSED_BY FOREIGN KEY (closed_by_id) REFERENCES `user` (id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE argent_archive DROP FOREIGN KEY FK_ARCHIVE_CLOSED_BY');
        $this->addSql('DROP TABLE argent_archive');
    }
}

