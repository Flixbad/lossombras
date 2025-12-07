<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251205171036 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE argent_archive CHANGE date_cloture date_cloture DATETIME NOT NULL, CHANGE created_at created_at DATETIME NOT NULL');
        $this->addSql('ALTER TABLE argent_archive RENAME INDEX idx_archive_closed_by TO IDX_C17FA438E1FA7797');
        $this->addSql('ALTER TABLE comptabilite_archive CHANGE date_cloture date_cloture DATETIME NOT NULL, CHANGE created_at created_at DATETIME NOT NULL');
        $this->addSql('ALTER TABLE comptabilite_archive RENAME INDEX idx_comptabilite_archive_closed_by TO IDX_E8F91272E1FA7797');
        $this->addSql('ALTER TABLE vente_drogue ADD cout_achat_total NUMERIC(10, 2) DEFAULT NULL, DROP nb_pochons, CHANGE prix_vente_unitaire montant_vente_total NUMERIC(10, 2) NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE argent_archive CHANGE date_cloture date_cloture DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', CHANGE created_at created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE argent_archive RENAME INDEX idx_c17fa438e1fa7797 TO IDX_ARCHIVE_CLOSED_BY');
        $this->addSql('ALTER TABLE comptabilite_archive CHANGE date_cloture date_cloture DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', CHANGE created_at created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE comptabilite_archive RENAME INDEX idx_e8f91272e1fa7797 TO IDX_COMPTABILITE_ARCHIVE_CLOSED_BY');
        $this->addSql('ALTER TABLE vente_drogue ADD nb_pochons INT NOT NULL, DROP cout_achat_total, CHANGE montant_vente_total prix_vente_unitaire NUMERIC(10, 2) NOT NULL');
    }
}
