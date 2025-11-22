<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251121202444 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // Vérifier si les tables existent avant de les modifier
        // Si les tables n'existent pas encore (première installation), ignorer cette migration
        
        if ($schema->hasTable('comptabilite')) {
            $this->addSql('ALTER TABLE comptabilite CHANGE created_at created_at DATETIME NOT NULL');
        }
        
        if ($schema->hasTable('contenu_vehicule')) {
            $this->addSql('ALTER TABLE contenu_vehicule CHANGE updated_at updated_at DATETIME NOT NULL');
        }
        
        if ($schema->hasTable('stock')) {
            $this->addSql('ALTER TABLE stock CHANGE updated_at updated_at DATETIME NOT NULL');
        }
        
        if ($schema->hasTable('user')) {
            $this->addSql('ALTER TABLE user CHANGE created_at created_at DATETIME NOT NULL');
        }
        
        if ($schema->hasTable('vehicule')) {
            $this->addSql('ALTER TABLE vehicule CHANGE created_at created_at DATETIME NOT NULL, CHANGE updated_at updated_at DATETIME NOT NULL');
        }
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE comptabilite CHANGE created_at created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE contenu_vehicule CHANGE updated_at updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE stock CHANGE updated_at updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE `user` CHANGE created_at created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE vehicule CHANGE created_at created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', CHANGE updated_at updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\'');
    }
}
