<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251205165331 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE comptabilite_archive (id INT AUTO_INCREMENT NOT NULL, date_cloture DATETIME NOT NULL, semaine VARCHAR(10) NOT NULL, nb_operations INT NOT NULL, commentaire LONGTEXT DEFAULT NULL, created_at DATETIME NOT NULL, closed_by_id INT DEFAULT NULL, INDEX IDX_E8F91272E1FA7797 (closed_by_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE vente_drogue (id INT AUTO_INCREMENT NOT NULL, nb_pochons INT NOT NULL, prix_vente_unitaire NUMERIC(10, 2) NOT NULL, prix_achat_unitaire NUMERIC(10, 2) NOT NULL, benefice NUMERIC(10, 2) NOT NULL, commission NUMERIC(10, 2) NOT NULL, benefice_groupe NUMERIC(10, 2) NOT NULL, commentaire LONGTEXT DEFAULT NULL, created_at DATETIME NOT NULL, vendeur_id INT NOT NULL, INDEX IDX_EFEC95ED858C065E (vendeur_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE comptabilite_archive ADD CONSTRAINT FK_E8F91272E1FA7797 FOREIGN KEY (closed_by_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE vente_drogue ADD CONSTRAINT FK_EFEC95ED858C065E FOREIGN KEY (vendeur_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE argent_archive CHANGE date_cloture date_cloture DATETIME NOT NULL, CHANGE created_at created_at DATETIME NOT NULL');
        $this->addSql('ALTER TABLE argent_archive RENAME INDEX idx_archive_closed_by TO IDX_C17FA438E1FA7797');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE comptabilite_archive DROP FOREIGN KEY FK_E8F91272E1FA7797');
        $this->addSql('ALTER TABLE vente_drogue DROP FOREIGN KEY FK_EFEC95ED858C065E');
        $this->addSql('DROP TABLE comptabilite_archive');
        $this->addSql('DROP TABLE vente_drogue');
        $this->addSql('ALTER TABLE argent_archive CHANGE date_cloture date_cloture DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', CHANGE created_at created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE argent_archive RENAME INDEX idx_c17fa438e1fa7797 TO IDX_ARCHIVE_CLOSED_BY');
    }
}
