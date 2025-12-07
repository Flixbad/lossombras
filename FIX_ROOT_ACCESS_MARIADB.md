# 🔐 Solution pour ERROR 1045 - Access denied for root

## Solution 1 : Utiliser sudo (RECOMMANDÉ)

Sur la plupart des systèmes Linux, MariaDB/MySQL est configuré pour permettre l'accès root via `sudo` :

```bash
sudo mysql
```

Cela devrait vous connecter directement sans demander de mot de passe.

---

## Solution 2 : Réinitialiser le mot de passe root

Si `sudo mysql` ne fonctionne pas, réinitialisez le mot de passe root :

### Étape 1 : Arrêter MariaDB

```bash
sudo systemctl stop mariadb
```

### Étape 2 : Démarrer MariaDB en mode sécurisé (skip-grant-tables)

```bash
sudo mysqld_safe --skip-grant-tables --skip-networking &
```

### Étape 3 : Se connecter sans mot de passe

```bash
mysql -u root
```

### Étape 4 : Réinitialiser le mot de passe

Une fois connecté, exécutez :

```sql
USE mysql;

-- Pour MariaDB 10.4+
ALTER USER 'root'@'localhost' IDENTIFIED BY 'nouveau_mot_de_passe';

-- Pour MySQL 8.0+
-- ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'nouveau_mot_de_passe';

FLUSH PRIVILEGES;
EXIT;
```

### Étape 5 : Arrêter le processus en mode sécurisé et redémarrer normalement

```bash
sudo pkill mysqld
sudo systemctl start mariadb
```

### Étape 6 : Tester la connexion avec le nouveau mot de passe

```bash
mysql -u root -p
# Entrez le nouveau mot de passe
```

---

## Solution 3 : Utiliser le plugin unix_socket (si activé)

Sur certains systèmes (notamment Ubuntu/Debian), root peut se connecter via le socket Unix :

```bash
sudo mysql -u root
```

Si ça ne marche pas, essayez :

```bash
sudo mysql -u root --socket=/var/run/mysqld/mysqld.sock
```

---

## Solution 4 : Modifier la configuration pour autoriser root sans mot de passe (NON RECOMMANDÉ en production)

**⚠️ À utiliser uniquement en développement !**

```bash
sudo mysql
```

Puis :

```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY '';
FLUSH PRIVILEGES;
```

---

## Solution 5 : Script automatique pour réinitialiser root

```bash
#!/bin/bash
echo "🔧 Réinitialisation du mot de passe root MariaDB/MySQL"
read -sp "Nouveau mot de passe pour root : " NEW_PASS
echo ""

sudo systemctl stop mariadb
sudo mysqld_safe --skip-grant-tables --skip-networking &
sleep 2

mysql -u root <<EOF
USE mysql;
ALTER USER 'root'@'localhost' IDENTIFIED BY '$NEW_PASS';
FLUSH PRIVILEGES;
EXIT;
EOF

sudo pkill mysqld
sudo systemctl start mariadb

echo "✅ Mot de passe root réinitialisé !"
mysql -u root -p"$NEW_PASS" -e "SELECT 'Connexion réussie !' AS Status;"
```

---

## Solution 6 : Créer un utilisateur administrateur alternatif

Si vous n'arrivez toujours pas à vous connecter en root, créez un autre utilisateur admin :

```bash
# Si vous pouvez utiliser sudo mysql une fois, créez un autre admin :
sudo mysql
```

Puis :

```sql
CREATE USER 'admin'@'localhost' IDENTIFIED BY 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON *.* TO 'admin'@'localhost' WITH GRANT OPTION;
FLUSH PRIVILEGES;
EXIT;
```

Puis utilisez cet utilisateur dans votre `.env` :

```
DATABASE_URL="mysql://admin:votre_mot_de_passe@127.0.0.1:3306/los_sombras?serverVersion=8.0.31&charset=utf8mb4"
```

---

## Solution la plus simple : Utiliser sudo mysql

Dans 99% des cas, cette commande fonctionne :

```bash
sudo mysql
```

Si ça ne fonctionne pas, essayez les solutions ci-dessus.

