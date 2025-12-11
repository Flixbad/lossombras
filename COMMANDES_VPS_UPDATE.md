# Commandes pour mettre à jour le VPS

## 1. Se connecter au VPS
```bash
ssh root@VOTRE_IP_VPS
# ou
ssh root@srv1143295.contaboserver.net
```

## 2. Aller dans le répertoire du projet
```bash
cd /var/www/lossombras
```

## 3. Récupérer les dernières modifications
```bash
git pull origin main
```

## 4. Backend - Installer les dépendances (si nécessaire)
```bash
cd backend
composer install --no-dev --optimize-autoloader
```

## 5. Backend - Exécuter les migrations
```bash
php bin/console doctrine:migrations:migrate --no-interaction
```

## 6. Backend - Vider le cache
```bash
php bin/console cache:clear --env=prod
```

## 7. Frontend - Installer les dépendances (si nécessaire)
```bash
cd ../frontend
npm install
```

## 8. Frontend - Builder l'application
```bash
npm run build
```

## 9. Redémarrer les services
```bash
# Redémarrer PHP-FPM
sudo systemctl restart php8.4-fpm

# Redémarrer Nginx (recharger la configuration)
sudo systemctl reload nginx

# Si vous utilisez PM2 pour le frontend (s'il tourne en mode dev)
# pm2 restart all
```

## 10. Vérifier que tout fonctionne
```bash
# Vérifier le statut de PHP-FPM
sudo systemctl status php8.4-fpm

# Vérifier le statut de Nginx
sudo systemctl status nginx

# Vérifier les logs en cas d'erreur
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/php8.4-fpm.log
```

---

## Commandes complètes en une seule fois (copier-coller)

```bash
cd /var/www/lossombras && \
git pull origin main && \
cd backend && \
composer install --no-dev --optimize-autoloader && \
php bin/console doctrine:migrations:migrate --no-interaction && \
php bin/console cache:clear --env=prod && \
cd ../frontend && \
npm install && \
npm run build && \
cd .. && \
sudo systemctl restart php8.4-fpm && \
sudo systemctl reload nginx && \
echo "✅ Mise à jour terminée !"
```

---

## Notes importantes

- **Migrations** : Les nouvelles migrations créent la table `pari_boxe` et ajoutent la colonne `nom_groupe`
- **Cache** : Pensez à vider le cache Symfony après les migrations
- **Build** : Le build Angular peut prendre quelques minutes
- **Permissions** : Si vous avez des erreurs de permissions, utilisez `sudo` où nécessaire

## En cas d'erreur

### Erreur de migration
Si une migration échoue, vous pouvez la marquer comme exécutée manuellement via Adminer :
```sql
INSERT IGNORE INTO doctrine_migration_versions (version, executed_at, execution_time)
VALUES ('DoctrineMigrations\\Version20251210232626', NOW(), 0),
       ('DoctrineMigrations\\Version20251210234415', NOW(), 0);
```

### Erreur npm ERESOLVE (conflit de dépendances)
Si vous avez une erreur de conflit de dépendances npm (comme avec ng2-charts), utilisez `--legacy-peer-deps` :
```bash
cd frontend
rm -rf node_modules dist
npm install --legacy-peer-deps
npm run build
```

**Note** : Le build a réussi malgré l'erreur car les dépendances étaient déjà installées. Mais pour éviter l'erreur à l'avenir, utilisez `--legacy-peer-deps`.

### Erreur Composer
```bash
cd backend
rm -rf vendor
composer install --no-dev --optimize-autoloader
```

