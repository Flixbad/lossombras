# 🔧 Solution : Migration arme - Table already exists

## Problème

La migration `Version20251122000824` essaie de créer la table `arme` qui existe déjà.

## Solution rapide : Marquer la migration comme exécutée

### Option 1 : Script automatique

```bash
cd /var/www/lossombras
bash FIX_MIGRATION_ARME.sh
```

### Option 2 : Manuellement avec sudo mysql

```bash
sudo mysql
```

Puis :

```sql
USE los_sombras;  -- Remplacez par votre nom de base

INSERT IGNORE INTO doctrine_migration_versions (version, executed_at, execution_time)
VALUES ('DoctrineMigrations\\Version20251122000824', NOW(), 0);

-- Vérifier
SELECT version, executed_at FROM doctrine_migration_versions 
WHERE version = 'DoctrineMigrations\\Version20251122000824';

EXIT;
```

---

## Après avoir marqué la migration

Relancez les migrations :

```bash
cd /var/www/lossombras/backend
php bin/console doctrine:migrations:migrate --no-interaction
```

Cela devrait maintenant passer cette migration et exécuter les suivantes (notamment celles pour `vente_drogue`).

---

## Si d'autres migrations échouent avec le même problème

Si vous rencontrez d'autres erreurs "Table already exists", marquez-les aussi comme exécutées :

```sql
INSERT IGNORE INTO doctrine_migration_versions (version, executed_at, execution_time)
VALUES ('DoctrineMigrations\\VERSION_ICI', NOW(), 0);
```

Remplacez `VERSION_ICI` par le nom de la migration qui échoue.

