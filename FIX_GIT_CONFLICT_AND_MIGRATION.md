# 🔧 Correction des problèmes Git et Migration

## Problème 1 : Conflit Git

Des fichiers locaux entrent en conflit avec le dépôt. Solution :

### Solution rapide : Supprimer les fichiers locaux (ils sont déjà dans le repo)

```bash
cd /var/www/lossombras

# Supprimer les fichiers locaux qui sont en conflit
rm -f CONNECT_MARIADB_AUTO.sh
rm -f DIAGNOSE_MARIADB.sh
rm -f FIX_MARIADB_LOCKED_FILES.sh
rm -f FIX_MARIADB_PERMISSIONS.sh
rm -f FIX_MARIADB_ROOT_FINAL.sh
rm -f RESET_ROOT_PASSWORD.sh

# Récupérer les versions du dépôt
git pull origin main
```

---

## Problème 2 : Connexion MariaDB refusée

L'erreur `Connection refused` signifie que MariaDB n'est pas démarré ou n'écoute pas.

### Vérifier et démarrer MariaDB

```bash
# Vérifier le statut
sudo systemctl status mariadb

# Si ce n'est pas actif, démarrer
sudo systemctl start mariadb

# Vérifier qu'il écoute bien
sudo netstat -tlnp | grep 3306
# ou
sudo ss -tlnp | grep 3306
```

### Si MariaDB ne démarre toujours pas

```bash
cd /var/www/lossombras
bash FIX_MARIADB_LOCKED_FILES.sh
```

---

## Commandes complètes à exécuter

```bash
cd /var/www/lossombras

# 1. Nettoyer les conflits Git
rm -f CONNECT_MARIADB_AUTO.sh DIAGNOSE_MARIADB.sh FIX_MARIADB_LOCKED_FILES.sh FIX_MARIADB_PERMISSIONS.sh FIX_MARIADB_ROOT_FINAL.sh RESET_ROOT_PASSWORD.sh
git pull origin main

# 2. Vérifier et démarrer MariaDB
sudo systemctl start mariadb
sudo systemctl status mariadb

# 3. Exécuter les migrations
cd backend
php bin/console doctrine:migrations:migrate --no-interaction

# 4. Vider le cache
php bin/console cache:clear --env=prod --no-debug

# 5. Redémarrer PM2
pm2 restart all
```

---

## Note sur npm

L'erreur npm avec `ng2-charts` est un avertissement de dépendances mais le build a réussi. Si vous voulez corriger les warnings :

```bash
cd /var/www/lossombras/frontend
npm install --legacy-peer-deps
npm run build
```

Mais ce n'est pas obligatoire car le build fonctionne déjà.

