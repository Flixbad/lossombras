<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251122000824 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE arme (id INT AUTO_INCREMENT NOT NULL, nom VARCHAR(255) NOT NULL, type VARCHAR(100) DEFAULT NULL, description LONGTEXT DEFAULT NULL, date_sortie DATETIME DEFAULT NULL, commentaire_sortie LONGTEXT DEFAULT NULL, created_at DATETIME NOT NULL, sortie_par_id INT DEFAULT NULL, INDEX IDX_1820737941704C16 (sortie_par_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE arme ADD CONSTRAINT FK_1820737941704C16 FOREIGN KEY (sortie_par_id) REFERENCES `user` (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE arme DROP FOREIGN KEY FK_1820737941704C16');
        $this->addSql('DROP TABLE arme');
    }
}
