# 🔧 Étapes finales pour démarrer MariaDB

## Problème : MariaDB ne démarre toujours pas

MariaDB a toujours des fichiers verrouillés. Utilisez le script de correction :

## Solution : Exécuter le script de correction

```bash
cd /var/www/lossombras
bash FIX_MARIADB_LOCKED_FILES.sh
```

Ce script va :
- Tuer tous les processus MySQL qui traînent
- Supprimer tous les fichiers de lock
- Redémarrer MariaDB proprement

---

## Après que le script ait réussi

Une fois que MariaDB est démarré, exécutez les migrations :

```bash
cd /var/www/lossombras/backend
php bin/console doctrine:migrations:migrate --no-interaction
```

---

## Si le script ne fonctionne toujours pas

Essayez cette solution manuelle plus radicale :

```bash
# 1. Tuer TOUS les processus MySQL
sudo pkill -9 -f mysql
sudo pkill -9 -f mariadb

# 2. Attendre un peu
sleep 5

# 3. Vérifier qu'il n'en reste plus
ps aux | grep -E "mysql|mariadb" | grep -v grep

# 4. Supprimer TOUS les fichiers de lock
sudo rm -f /var/lib/mysql/*.lock
sudo rm -f /var/run/mysqld/*.lock
sudo rm -f /var/run/mysqld/mysqld.sock

# 5. Trouver et tuer les processus qui verrouillent les fichiers
sudo lsof /var/lib/mysql/ibdata1 2>/dev/null | grep -v COMMAND | awk '{print $2}' | xargs -r sudo kill -9
sudo lsof /var/lib/mysql/aria_log_control 2>/dev/null | grep -v COMMAND | awk '{print $2}' | xargs -r sudo kill -9

# 6. Attendre encore
sleep 3

# 7. Redémarrer
sudo systemctl start mariadb
sudo systemctl status mariadb
```

---

## Si RIEN ne fonctionne : Redémarrer le serveur

Parfois, le seul moyen de libérer tous les verrous est de redémarrer le serveur :

```bash
sudo reboot
```

⚠️ **Attention** : Cela redémarrera tout le serveur et coupera temporairement votre site.

Une fois le serveur redémarré, MariaDB devrait démarrer automatiquement.

---

## Commandes complètes une fois MariaDB démarré

```bash
# 1. Vérifier que MariaDB fonctionne
sudo systemctl status mariadb

# 2. Exécuter les migrations
cd /var/www/lossombras/backend
php bin/console doctrine:migrations:migrate --no-interaction

# 3. Vider le cache
php bin/console cache:clear --env=prod --no-debug

# 4. Redémarrer PM2
pm2 restart all
```

