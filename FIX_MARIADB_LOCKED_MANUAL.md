# 🔧 Solution : Fichiers verrouillés MariaDB (error: 11)

## Problème identifié

Les erreurs indiquent que :
- `Unable to lock ./ibdata1 error: 11` - Fichiers InnoDB verrouillés
- `Can't lock aria_log_control error: 11` - Fichier Aria verrouillé
- Un processus MySQL utilise déjà ces fichiers

## Solution automatique (RECOMMANDÉE)

```bash
cd /var/www/lossombras
bash FIX_MARIADB_LOCKED_FILES.sh
```

---

## Solution manuelle (si le script ne fonctionne pas)

### Étape 1 : Tuer tous les processus MySQL

```bash
# Voir les processus
ps aux | grep mysql

# Tuer tous les processus MySQL
sudo pkill -9 mysqld
sudo pkill -9 mariadbd
sudo pkill -9 mysqld_safe

# Vérifier qu'ils sont bien arrêtés
ps aux | grep mysql
```

### Étape 2 : Vérifier avec lsof quels fichiers sont verrouillés

```bash
# Vérifier ibdata1
sudo lsof /var/lib/mysql/ibdata1

# Vérifier aria_log_control
sudo lsof /var/lib/mysql/aria_log_control
```

Si des processus apparaissent, tuez-les avec `kill -9 PID`.

### Étape 3 : Supprimer les fichiers de lock

```bash
sudo rm -f /var/lib/mysql/*.lock
sudo rm -f /var/lib/mysql/aria_log_control.lock
sudo rm -f /var/run/mysqld/*.lock
sudo rm -f /var/run/mysqld/mysqld.sock
```

### Étape 4 : Redémarrer

```bash
sudo systemctl start mariadb
```

---

## Solution radicale : Redémarrer le serveur

Si rien ne fonctionne, redémarrer le serveur peut libérer tous les verrous :

```bash
sudo reboot
```

⚠️ **Attention** : Cela redémarrera tout le serveur.

---

## Une fois MariaDB démarré

Connectez-vous et marquez les migrations :

```bash
sudo mysql
```

Puis :

```sql
USE los_sombras;  -- Remplacez par votre nom de base

INSERT IGNORE INTO doctrine_migration_versions (version, executed_at, execution_time)
VALUES ('DoctrineMigrations\\Version20251121204144', NOW(), 0);

INSERT IGNORE INTO doctrine_migration_versions (version, executed_at, execution_time)
VALUES ('DoctrineMigrations\\Version20251205171036', NOW(), 0);

INSERT IGNORE INTO doctrine_migration_versions (version, executed_at, execution_time)
VALUES ('DoctrineMigrations\\Version20251205190325', NOW(), 0);

EXIT;
```

