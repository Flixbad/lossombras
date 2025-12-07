<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251205190325 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Ajout du champ type_drogue à la table vente_drogue pour gérer plusieurs types de drogues';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE vente_drogue ADD type_drogue VARCHAR(50) NOT NULL DEFAULT \'cocaine\'');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE vente_drogue DROP type_drogue');
    }
}
