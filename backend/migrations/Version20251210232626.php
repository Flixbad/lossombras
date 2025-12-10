<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251210232626 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE pari_boxe (id INT AUTO_INCREMENT NOT NULL, montant_mise NUMERIC(10, 2) NOT NULL, combat_id VARCHAR(255) NOT NULL, combat_titre VARCHAR(255) NOT NULL, combatant_parie VARCHAR(255) NOT NULL, statut VARCHAR(50) NOT NULL, gain_calcule NUMERIC(10, 2) DEFAULT NULL, commission_organisateur NUMERIC(10, 2) DEFAULT NULL, commentaire LONGTEXT DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, groupe_id INT NOT NULL, INDEX IDX_EC3E65687A45358C (groupe_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE pari_boxe ADD CONSTRAINT FK_EC3E65687A45358C FOREIGN KEY (groupe_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE vente_drogue CHANGE prix_achat_unitaire prix_achat_unitaire NUMERIC(10, 2) NOT NULL, CHANGE type_drogue type_drogue VARCHAR(50) NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE pari_boxe DROP FOREIGN KEY FK_EC3E65687A45358C');
        $this->addSql('DROP TABLE pari_boxe');
        $this->addSql('ALTER TABLE vente_drogue CHANGE type_drogue type_drogue VARCHAR(50) DEFAULT \'cocaine\' NOT NULL, CHANGE prix_achat_unitaire prix_achat_unitaire NUMERIC(10, 2) DEFAULT \'625.00\' NOT NULL');
    }
}
