# 🔐 Se connecter à MariaDB en root - Méthodes simples

## Méthode 1 : sudo mysql (LA PLUS SIMPLE)

```bash
sudo mysql
```

Si ça ne fonctionne pas, passez à la méthode 2.

---

## Méthode 2 : Vérifier que MariaDB utilise le plugin unix_socket

### Étape 1 : Vérifier le statut de MariaDB

```bash
sudo systemctl status mariadb
```

Si ce n'est pas démarré :
```bash
sudo systemctl start mariadb
```

### Étape 2 : Forcer la connexion via le socket Unix

```bash
sudo mysql -u root
```

Ou :

```bash
sudo mysql --defaults-file=/etc/mysql/debian.cnf
```

---

## Méthode 3 : Réinitialiser root avec la commande directe (SANS mysqld_safe)

### Étape 1 : Arrêter MariaDB proprement

```bash
sudo systemctl stop mariadb
```

### Étape 2 : Démarrer en mode recovery avec systemd

Créez un fichier temporaire :

```bash
sudo systemctl edit mariadb --full
```

Ou créez un fichier override :

```bash
sudo mkdir -p /etc/systemd/system/mariadb.service.d/
sudo nano /etc/systemd/system/mariadb.service.d/override.conf
```

Ajoutez :

```ini
[Service]
ExecStart=
ExecStart=/usr/bin/mysqld_safe --skip-grant-tables --skip-networking
```

Puis :

```bash
sudo systemctl daemon-reload
sudo systemctl start mariadb
```

### Étape 3 : Se connecter

```bash
mysql -u root
```

### Étape 4 : Réinitialiser le mot de passe

```sql
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY 'nouveau_mot_de_passe';
FLUSH PRIVILEGES;
EXIT;
```

### Étape 5 : Remettre la configuration normale

```bash
sudo rm /etc/systemd/system/mariadb.service.d/override.conf
sudo systemctl daemon-reload
sudo systemctl restart mariadb
```

---

## Méthode 4 : Utiliser mysql_secure_installation (si disponible)

```bash
sudo mysql_secure_installation
```

---

## Méthode 5 : Créer un nouvel utilisateur admin (si root est bloqué)

Si vous arrivez à vous connecter une fois (même temporairement), créez un autre admin :

```sql
CREATE USER 'admin'@'localhost' IDENTIFIED BY 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON *.* TO 'admin'@'localhost' WITH GRANT OPTION;
FLUSH PRIVILEGES;
```

Puis utilisez cet utilisateur dans votre `.env`.

---

## Solution de dépannage rapide

Exécutez ces commandes dans l'ordre :

```bash
# 1. Vérifier le statut
sudo systemctl status mariadb

# 2. Si arrêté, démarrer
sudo systemctl start mariadb

# 3. Essayer de se connecter
sudo mysql

# 4. Si ça ne marche pas, vérifier les logs
sudo tail -f /var/log/mysql/error.log
```

---

## Commande SQL pour marquer la migration (une fois connecté)

Peu importe la méthode utilisée pour vous connecter, une fois dans MariaDB, exécutez :

```sql
USE los_sombras;  -- Remplacez par votre nom de base

INSERT IGNORE INTO doctrine_migration_versions (version, executed_at, execution_time)
VALUES ('DoctrineMigrations\\Version20251121204144', NOW(), 0);

-- Marquer aussi les migrations de vente_drogue si elles existent déjà
INSERT IGNORE INTO doctrine_migration_versions (version, executed_at, execution_time)
VALUES ('DoctrineMigrations\\Version20251205171036', NOW(), 0);

INSERT IGNORE INTO doctrine_migration_versions (version, executed_at, execution_time)
VALUES ('DoctrineMigrations\\Version20251205190325', NOW(), 0);

-- Vérifier
SELECT * FROM doctrine_migration_versions ORDER BY executed_at DESC LIMIT 5;

EXIT;
```

