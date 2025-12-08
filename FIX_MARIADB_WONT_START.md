# 🔧 Solution : MariaDB ne démarre pas

## Diagnostic du problème

### Étape 1 : Vérifier les détails de l'erreur

```bash
sudo systemctl status mariadb.service
```

Cela vous donnera des informations sur pourquoi le service ne démarre pas.

### Étape 2 : Voir les logs détaillés

```bash
sudo journalctl -xeu mariadb.service --no-pager | tail -50
```

Ou :

```bash
sudo tail -100 /var/log/mysql/error.log
```

---

## Solutions courantes

### Solution 1 : Problème de permissions (le plus courant)

```bash
# Vérifier les permissions du répertoire de données
sudo ls -la /var/lib/mysql/

# Corriger les permissions
sudo chown -R mysql:mysql /var/lib/mysql/
sudo chmod 700 /var/lib/mysql/
```

Puis redémarrer :

```bash
sudo systemctl start mariadb
```

---

### Solution 2 : Socket file déjà existant

```bash
# Vérifier si le socket existe déjà
ls -la /var/run/mysqld/

# Si le répertoire n'existe pas, le créer
sudo mkdir -p /var/run/mysqld
sudo chown mysql:mysql /var/run/mysqld

# Vérifier s'il y a un processus MySQL qui traîne
ps aux | grep mysql

# Si oui, le tuer
sudo pkill -9 mysqld
sudo pkill -9 mysqld_safe
```

Puis redémarrer :

```bash
sudo systemctl start mariadb
```

---

### Solution 3 : Réinitialiser la configuration MariaDB

Si MariaDB ne démarre toujours pas, réinitialisez la configuration :

```bash
# Arrêter complètement
sudo systemctl stop mariadb
sudo pkill -9 mysqld

# Vérifier s'il y a un fichier de lock
sudo rm -f /var/lib/mysql/mysql.sock.lock
sudo rm -f /var/run/mysqld/mysqld.sock.lock

# Réinitialiser les permissions
sudo chown -R mysql:mysql /var/lib/mysql/
sudo chmod 700 /var/lib/mysql/

# Redémarrer
sudo systemctl start mariadb
```

---

### Solution 4 : Réparer les tables (si les données sont corrompues)

```bash
# Démarrer en mode récupération
sudo mysqld_safe --skip-grant-tables &
sleep 3

# Réparer
mysqlcheck -u root -A --repair

# Arrêter le mode récupération
sudo pkill mysqld_safe
sudo pkill mysqld

# Redémarrer normalement
sudo systemctl start mariadb
```

---

### Solution 5 : Réinstaller MariaDB (DERNIER RECOURS)

⚠️ **ATTENTION : Cela supprimera toutes les données si vous n'avez pas de sauvegarde !**

```bash
# Sauvegarder les données (IMPORTANT !)
sudo cp -r /var/lib/mysql /var/lib/mysql.backup

# Désinstaller
sudo apt remove --purge mariadb-server mariadb-client
sudo apt autoremove

# Réinstaller
sudo apt update
sudo apt install mariadb-server mariadb-client

# Restaurer les données
sudo systemctl stop mariadb
sudo rm -rf /var/lib/mysql/*
sudo cp -r /var/lib/mysql.backup/* /var/lib/mysql/
sudo chown -R mysql:mysql /var/lib/mysql/
sudo systemctl start mariadb
```

---

## Script de diagnostic automatique

Utilisez le script `DIAGNOSE_MARIADB.sh` pour diagnostiquer automatiquement le problème.

---

## Une fois MariaDB démarré

Une fois que `sudo systemctl start mariadb` fonctionne, connectez-vous :

```bash
sudo mysql
```

Puis exécutez les commandes SQL pour marquer les migrations.

