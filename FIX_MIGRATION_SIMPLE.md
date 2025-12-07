# 🔧 Correction de l'erreur de migration - Table 'argent' already exists

## Solution rapide (2 méthodes)

### Méthode 1 : Commandes SQL directes (RECOMMANDÉE)

Connectez-vous à MariaDB et exécutez :

```bash
mysql -u VOTRE_USER -p VOTRE_DB_NAME
```

Puis dans MySQL/MariaDB, exécutez :

```sql
-- Marquer la migration comme exécutée
INSERT IGNORE INTO doctrine_migration_versions (version, executed_at, execution_time)
VALUES ('DoctrineMigrations\\Version20251121204144', NOW(), 0);

-- Vérifier que c'est bien marqué
SELECT * FROM doctrine_migration_versions WHERE version LIKE '%Version20251121204144%';
```

### Méthode 2 : Une seule ligne en bash

Remplacez `DB_USER`, `DB_PASS` et `DB_NAME` par vos valeurs :

```bash
mysql -u DB_USER -pDB_PASS DB_NAME -e "INSERT IGNORE INTO doctrine_migration_versions (version, executed_at, execution_time) VALUES ('DoctrineMigrations\\\\Version20251121204144', NOW(), 0);"
```

## Ensuite, relancez les migrations

```bash
cd /var/www/html/los-sombras/backend
php bin/console doctrine:migrations:migrate --no-interaction
```

## Si vous avez besoin de trouver vos identifiants

Les identifiants de la base de données sont dans votre fichier `.env` :

```bash
cd /var/www/lossombras/backend
cat .env | grep DATABASE_URL
```

Ou dans un fichier `.env.local` si vous en avez un.

## Vérification

Pour voir toutes les migrations exécutées :

```sql
SELECT * FROM doctrine_migration_versions ORDER BY executed_at DESC;
```

