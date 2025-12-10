<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Migration pour créer la table comptabilite_archive pour l'archivage hebdomadaire
 */
final class Version20251205115123 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Création de la table comptabilite_archive pour l\'archivage hebdomadaire de la comptabilité produit';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE comptabilite_archive (
            id INT AUTO_INCREMENT NOT NULL,
            date_cloture DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            semaine VARCHAR(10) NOT NULL,
            nb_operations INT NOT NULL,
            commentaire LONGTEXT DEFAULT NULL,
            closed_by_id INT DEFAULT NULL,
            created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            INDEX IDX_COMPTABILITE_ARCHIVE_CLOSED_BY (closed_by_id),
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        
        $this->addSql('ALTER TABLE comptabilite_archive ADD CONSTRAINT FK_COMPTABILITE_ARCHIVE_CLOSED_BY FOREIGN KEY (closed_by_id) REFERENCES `user` (id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE comptabilite_archive DROP FOREIGN KEY FK_COMPTABILITE_ARCHIVE_CLOSED_BY');
        $this->addSql('DROP TABLE comptabilite_archive');
    }
}




