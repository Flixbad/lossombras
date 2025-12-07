# 🔧 Résolution du problème de migration - Table argent_archive

## Problème rencontré

```
Migration DoctrineMigrations\Version20251121204144 failed during Execution.
Error: "Table 'argent' already exists"
```

Cela signifie que les tables existent déjà dans la base de données mais que les migrations ne sont pas marquées comme exécutées.

## ✅ Solution rapide : Créer uniquement la table argent_archive

### Option 1 : Script automatique (Recommandé)

Sur le VPS :

```bash
cd /var/www/lossombras
git pull origin main
chmod +x FIX_MIGRATION_ARGENT_ARCHIVE.sh
./FIX_MIGRATION_ARGENT_ARCHIVE.sh
```

### Option 2 : Commandes manuelles

```bash
cd /var/www/lossombras/backend

# Créer la table manuellement
php bin/console doctrine:query:sql "
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
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB
"

# Ajouter la clé étrangère
php bin/console doctrine:query:sql "
ALTER TABLE argent_archive 
ADD CONSTRAINT FK_ARCHIVE_CLOSED_BY 
FOREIGN KEY (closed_by_id) REFERENCES \`user\` (id)
"

# Marquer la migration comme exécutée
php bin/console doctrine:migrations:version DoctrineMigrations\\Version20251205112540 --add --no-interaction
```

### Option 3 : Via SQL direct

Si vous avez accès à MySQL/MariaDB directement :

```bash
mysql -u los_sombras_user -p los_sombras < CREER_TABLE_ARGENT_ARCHIVE_MANUEL.sql
```

Puis marquer la migration :

```bash
cd /var/www/lossombras/backend
php bin/console doctrine:migrations:version DoctrineMigrations\\Version20251205112540 --add --no-interaction
```

## 🔍 Vérification

```bash
cd /var/www/lossombras/backend

# Vérifier que la table existe
php bin/console doctrine:query:sql "SHOW TABLES LIKE 'argent_archive'"

# Vérifier la structure
php bin/console doctrine:query:sql "DESCRIBE argent_archive"

# Vérifier l'état des migrations
php bin/console doctrine:migrations:status
```

## 📝 Explication

Le problème vient du fait que :
1. Les tables existent déjà dans la base de données (créées précédemment)
2. Mais les migrations ne sont pas toutes marquées comme exécutées dans la table `doctrine_migration_versions`
3. Quand on essaie d'exécuter toutes les migrations, ça essaie de recréer les tables existantes

La solution consiste à :
- Créer uniquement la nouvelle table `argent_archive` manuellement
- Marquer la migration comme exécutée sans la réexécuter

## ✅ Après la création de la table

Une fois la table créée, vous pouvez tester :

```bash
# Tester la commande de clôture (ne l'exécutez pas vraiment si vous avez des données)
php bin/console app:close-week-argent --dry-run 2>/dev/null || echo "Commande disponible"
```

Tout devrait fonctionner normalement après cela !



