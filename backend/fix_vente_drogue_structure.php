<?php

require __DIR__.'/vendor/autoload.php';

use Symfony\Component\Dotenv\Dotenv;

$dotenv = new Dotenv();
$dotenv->loadEnv(__DIR__.'/.env.local');

$kernel = new \App\Kernel($_ENV['APP_ENV'] ?? 'dev', (bool) ($_ENV['APP_DEBUG'] ?? false));
$kernel->boot();

$container = $kernel->getContainer();
$connection = $container->get('doctrine.dbal.default_connection');

echo "🔧 Correction de la structure de la table vente_drogue...\n\n";

try {
    // Vérifier si la table existe
    $sm = $connection->createSchemaManager();
    $tables = $sm->listTableNames();
    
    if (!in_array('vente_drogue', $tables)) {
        echo "❌ La table vente_drogue n'existe pas. Création...\n";
        $connection->executeStatement("
            CREATE TABLE vente_drogue (
                id INT AUTO_INCREMENT NOT NULL,
                montant_vente_total NUMERIC(10, 2) NOT NULL,
                prix_achat_unitaire NUMERIC(10, 2) NOT NULL DEFAULT '625.00',
                cout_achat_total NUMERIC(10, 2) DEFAULT NULL,
                benefice NUMERIC(10, 2) NOT NULL,
                commission NUMERIC(10, 2) NOT NULL,
                benefice_groupe NUMERIC(10, 2) NOT NULL,
                commentaire LONGTEXT DEFAULT NULL,
                created_at DATETIME NOT NULL,
                vendeur_id INT NOT NULL,
                INDEX IDX_EFEC95ED858C065E (vendeur_id),
                PRIMARY KEY(id)
            ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        ");
        $connection->executeStatement("
            ALTER TABLE vente_drogue 
            ADD CONSTRAINT FK_EFEC95ED858C065E FOREIGN KEY (vendeur_id) REFERENCES `user` (id)
        ");
        echo "✅ Table créée avec la nouvelle structure\n";
    } else {
        echo "📝 Table vente_drogue existe. Vérification de la structure...\n";
        
        $columns = $sm->listTableColumns('vente_drogue');
        $columnNames = array_keys($columns);
        
        // Vérifier et ajouter montant_vente_total
        if (!in_array('montant_vente_total', $columnNames)) {
            echo "  ➕ Ajout de la colonne montant_vente_total...\n";
            if (in_array('prix_vente_unitaire', $columnNames)) {
                // Renommer prix_vente_unitaire en montant_vente_total
                $connection->executeStatement("
                    ALTER TABLE vente_drogue 
                    CHANGE prix_vente_unitaire montant_vente_total NUMERIC(10, 2) NOT NULL
                ");
                echo "  ✅ Colonne prix_vente_unitaire renommée en montant_vente_total\n";
            } else {
                $connection->executeStatement("
                    ALTER TABLE vente_drogue 
                    ADD COLUMN montant_vente_total NUMERIC(10, 2) NOT NULL
                ");
                echo "  ✅ Colonne montant_vente_total ajoutée\n";
            }
        } else {
            echo "  ✓ Colonne montant_vente_total existe déjà\n";
        }
        
        // Vérifier et ajouter cout_achat_total
        if (!in_array('cout_achat_total', $columnNames)) {
            echo "  ➕ Ajout de la colonne cout_achat_total...\n";
            $connection->executeStatement("
                ALTER TABLE vente_drogue 
                ADD COLUMN cout_achat_total NUMERIC(10, 2) DEFAULT NULL
            ");
            echo "  ✅ Colonne cout_achat_total ajoutée\n";
        } else {
            echo "  ✓ Colonne cout_achat_total existe déjà\n";
        }
        
        // Supprimer nb_pochons si elle existe
        if (in_array('nb_pochons', $columnNames)) {
            echo "  ➖ Suppression de la colonne nb_pochons...\n";
            $connection->executeStatement("
                ALTER TABLE vente_drogue 
                DROP COLUMN nb_pochons
            ");
            echo "  ✅ Colonne nb_pochons supprimée\n";
        } else {
            echo "  ✓ Colonne nb_pochons n'existe pas (déjà supprimée)\n";
        }
        
        // Supprimer prix_vente_unitaire si elle existe encore (ne devrait pas arriver)
        if (in_array('prix_vente_unitaire', $columnNames)) {
            echo "  ➖ Suppression de la colonne prix_vente_unitaire...\n";
            $connection->executeStatement("
                ALTER TABLE vente_drogue 
                DROP COLUMN prix_vente_unitaire
            ");
            echo "  ✅ Colonne prix_vente_unitaire supprimée\n";
        }
    }
    
    // Marquer les migrations comme exécutées
    echo "\n📝 Marquage des migrations comme exécutées...\n";
    try {
        $connection->executeStatement("
            INSERT INTO doctrine_migration_versions (version, executed_at, execution_time) 
            VALUES ('DoctrineMigrations\\\\Version20251205165331', NOW(), 0)
            ON DUPLICATE KEY UPDATE executed_at = NOW()
        ");
        echo "  ✅ Migration Version20251205165331 marquée comme exécutée\n";
    } catch (\Exception $e) {
        echo "  ⚠️  Impossible de marquer la migration (peut-être déjà marquée): " . $e->getMessage() . "\n";
    }
    
    try {
        $connection->executeStatement("
            INSERT INTO doctrine_migration_versions (version, executed_at, execution_time) 
            VALUES ('DoctrineMigrations\\\\Version20251205171036', NOW(), 0)
            ON DUPLICATE KEY UPDATE executed_at = NOW()
        ");
        echo "  ✅ Migration Version20251205171036 marquée comme exécutée\n";
    } catch (\Exception $e) {
        echo "  ⚠️  Impossible de marquer la migration (peut-être déjà marquée): " . $e->getMessage() . "\n";
    }
    
    echo "\n✅ Structure de la table corrigée avec succès !\n";
    echo "\n📋 Structure finale de la table vente_drogue :\n";
    $columns = $sm->listTableColumns('vente_drogue');
    foreach ($columns as $name => $column) {
        $type = get_class($column->getType());
        $type = str_replace('Doctrine\\DBAL\\Types\\', '', $type);
        $notNull = $column->getNotnull() ? 'NOT NULL' : 'NULL';
        echo "  - $name: $type $notNull\n";
    }
    
} catch (\Exception $e) {
    echo "\n❌ Erreur: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
    exit(1);
}

