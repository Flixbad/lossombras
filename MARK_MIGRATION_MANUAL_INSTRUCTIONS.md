# 📋 Instructions manuelles pour marquer la migration

## Si les scripts automatiques ne fonctionnent pas

Exécutez ces commandes **manuellement** dans l'ordre :

### Étape 1 : Vérifier que MariaDB est démarré

```bash
sudo systemctl status mariadb
```

Si ce n'est pas actif :
```bash
sudo systemctl start mariadb
```

### Étape 2 : Se connecter à MariaDB

```bash
sudo mysql
```

### Étape 3 : Une fois dans MariaDB, exécutez ces commandes SQL

Remplacez `los_sombras` par votre nom de base si différent :

```sql
USE los_sombras;

INSERT IGNORE INTO doctrine_migration_versions (version, executed_at, execution_time)
VALUES ('DoctrineMigrations\\Version20251122000824', NOW(), 0);

SELECT 'Migration marquée' AS Status;
SELECT version, executed_at FROM doctrine_migration_versions 
WHERE version = 'DoctrineMigrations\\Version20251122000824';

EXIT;
```

### Étape 4 : Relancer les migrations

```bash
cd /var/www/lossombras/backend
php bin/console doctrine:migrations:migrate --no-interaction
```

---

## Alternative : Commande SQL directe en une ligne

Si `sudo mysql` fonctionne, essayez :

```bash
echo "USE los_sombras; INSERT IGNORE INTO doctrine_migration_versions (version, executed_at, execution_time) VALUES ('DoctrineMigrations\\\\Version20251122000824', NOW(), 0);" | sudo mysql
```

---

## Si sudo mysql ne fonctionne toujours pas

Il y a peut-être un problème plus profond avec MariaDB. Vérifiez :

```bash
# Voir les logs d'erreur
sudo journalctl -xeu mariadb.service --no-pager | tail -50

# Voir le fichier de log
sudo tail -50 /var/log/mysql/error.log
```

Et essayez de redémarrer complètement :

```bash
sudo systemctl stop mariadb
sudo pkill -9 mysqld
sudo systemctl start mariadb
```

