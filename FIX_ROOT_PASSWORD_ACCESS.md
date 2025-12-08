# 🔐 Solution : Impossible de se connecter en root malgré le changement de mot de passe

## Diagnostic

Plusieurs raisons peuvent expliquer pourquoi vous ne pouvez pas vous connecter :

1. Le mot de passe n'a pas été correctement modifié
2. Vous utilisez le mauvais utilisateur (root vs root@localhost)
3. MariaDB utilise le plugin `unix_socket` qui ignore le mot de passe
4. Vous utilisez la mauvaise commande de connexion

---

## Solution 1 : Utiliser sudo mysql (RECOMMANDÉ)

Sur beaucoup de systèmes, root peut se connecter sans mot de passe via `sudo` :

```bash
sudo mysql
```

Cette méthode fonctionne même si vous avez changé le mot de passe.

---

## Solution 2 : Vérifier et modifier avec le bon utilisateur

MariaDB peut avoir plusieurs utilisateurs "root" :
- `root@localhost`
- `root@127.0.0.1`
- `root@%`

### Vérifier les utilisateurs root

```bash
sudo mysql
```

Puis :

```sql
SELECT User, Host, plugin, authentication_string FROM mysql.user WHERE User = 'root';
EXIT;
```

### Modifier TOUS les utilisateurs root

```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'votre_mot_de_passe';
ALTER USER 'root'@'127.0.0.1' IDENTIFIED BY 'votre_mot_de_passe';
ALTER USER 'root'@'%' IDENTIFIED BY 'votre_mot_de_passe';
FLUSH PRIVILEGES;
```

---

## Solution 3 : Désactiver le plugin unix_socket (si actif)

Si le plugin est `unix_socket`, root se connecte via le système sans mot de passe.

### Vérifier le plugin

```bash
sudo mysql -e "SELECT User, Host, plugin FROM mysql.user WHERE User = 'root';"
```

### Changer pour mysql_native_password

```bash
sudo mysql
```

Puis :

```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'votre_mot_de_passe';
FLUSH PRIVILEGES;
EXIT;
```

---

## Solution 4 : Utiliser un autre utilisateur (workaround)

Au lieu d'utiliser root, créez un utilisateur admin :

```bash
sudo mysql
```

Puis :

```sql
CREATE USER 'admin'@'localhost' IDENTIFIED BY 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON *.* TO 'admin'@'localhost' WITH GRANT OPTION;
FLUSH PRIVILEGES;
EXIT;
```

Puis connectez-vous avec :

```bash
mysql -u admin -p
```

---

## Solution 5 : Réinitialiser complètement le mot de passe root

### Méthode avec mysqld_safe (si disponible)

```bash
sudo systemctl stop mariadb
sudo mysqld_safe --skip-grant-tables --skip-networking &
sleep 3
mysql -u root
```

Puis :

```sql
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY 'nouveau_mot_de_passe';
FLUSH PRIVILEGES;
EXIT;
```

Puis :

```bash
sudo pkill mysqld_safe
sudo pkill mysqld
sudo systemctl start mariadb
```

---

## Solution 6 : Utiliser root directement pour les migrations (SANS mot de passe)

Modifiez temporairement votre `.env` pour utiliser root sans mot de passe :

```bash
cd /var/www/lossombras/backend
nano .env
```

Changez :

```
DATABASE_URL="mysql://root:@127.0.0.1:3306/los_sombras?serverVersion=8.0.31&charset=utf8mb4"
```

Puis exécutez les migrations :

```bash
sudo php bin/console doctrine:migrations:migrate --no-interaction
```

⚠️ **Note** : Utilisez `sudo` car Symfony essaiera de se connecter avec root sans mot de passe.

---

## Solution RECOMMANDÉE : Utiliser sudo mysql directement

Pour marquer les migrations, utilisez directement `sudo mysql` :

```bash
sudo mysql
```

Puis :

```sql
USE los_sombras;

INSERT IGNORE INTO doctrine_migration_versions (version, executed_at, execution_time)
VALUES ('DoctrineMigrations\\Version20251122000824', NOW(), 0);

EXIT;
```

Cette méthode fonctionne toujours, même si vous avez changé le mot de passe !

---

## Script pour marquer la migration directement (avec sudo mysql)

```bash
cd /var/www/lossombras

# Marquer la migration directement avec sudo mysql
sudo mysql los_sombras <<EOF
INSERT IGNORE INTO doctrine_migration_versions (version, executed_at, execution_time)
VALUES ('DoctrineMigrations\\\\Version20251122000824', NOW(), 0);

SELECT '✅ Migration marquée' AS Status;
SELECT version, executed_at FROM doctrine_migration_versions 
WHERE version = 'DoctrineMigrations\\\\Version20251122000824';
EOF
```

Puis :

```bash
cd backend
php bin/console doctrine:migrations:migrate --no-interaction
```

