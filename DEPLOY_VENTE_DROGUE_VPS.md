# Guide de déploiement VPS - Système de rémunération par vente de drogue

## Commandes à exécuter sur le VPS

### 1. Se connecter au VPS et aller dans le répertoire du projet

```bash
cd /var/www/lossombras
```

### 2. Récupérer les dernières modifications depuis Git

```bash
git pull origin main
```

### 3. Backend - Installer les dépendances PHP (si nécessaire)

```bash
cd backend
composer install --no-dev --optimize-autoloader --no-scripts
```

### 4. Backend - Exécuter les migrations de base de données

```bash
php bin/console doctrine:migrations:migrate --no-interaction
```

**Note importante :** Les migrations suivantes doivent être exécutées :
- `Version20251205171036` - Modifie la structure de la table `vente_drogue`
- `Version20251205190325` - Ajoute le champ `type_drogue` à la table `vente_drogue`

Si vous rencontrez une erreur disant que la table `vente_drogue` n'existe pas, vous pouvez créer la table manuellement ou laisser la migration la créer.

### 5. Backend - Vider le cache

```bash
php bin/console cache:clear --env=prod --no-debug
```

### 6. Frontend - Installer les dépendances npm (si nécessaire)

```bash
cd ../frontend
npm install
```

### 7. Frontend - Builder l'application en mode production

```bash
npm run build
```

### 8. Redémarrer les services (si vous utilisez PM2 ou systemd)

**Si vous utilisez PM2 :**
```bash
pm2 restart all
```

**Si vous utilisez systemd :**
```bash
sudo systemctl restart nginx
sudo systemctl restart php8.1-fpm  # ou la version de PHP que vous utilisez
```

### 9. Vérifier que tout fonctionne

- Accéder à votre site et vérifier que la page "Comptabilité Argent" s'affiche correctement
- Vérifier que la section "Ventes de Drogue" est visible
- Tester l'enregistrement d'une vente de drogue

## Résumé des commandes complètes (à copier-coller)

```bash
# Se connecter au VPS puis :
cd /var/www/lossombras
git pull origin main
cd backend
composer install --no-dev --optimize-autoloader --no-scripts
php bin/console doctrine:migrations:migrate --no-interaction
php bin/console cache:clear --env=prod --no-debug
cd ../frontend
npm install
npm run build
pm2 restart all  # ou sudo systemctl restart nginx && sudo systemctl restart php8.1-fpm
```

## Notes importantes

1. **Permissions** : Assurez-vous que les permissions des fichiers sont correctes (www-data:www-data ou votre utilisateur web)
2. **Variables d'environnement** : Vérifiez que votre fichier `.env` contient les bonnes variables
3. **Base de données** : Les migrations créeront automatiquement la table `vente_drogue` si elle n'existe pas
4. **Cache** : Pensez à vider le cache après chaque déploiement

## En cas de problème

Si la table `vente_drogue` existe déjà avec une structure différente, vous pouvez :
1. Vérifier la structure actuelle : `SHOW CREATE TABLE vente_drogue;`
2. Si besoin, supprimer la table : `DROP TABLE vente_drogue;` (ATTENTION : supprime les données !)
3. Relancer les migrations : `php bin/console doctrine:migrations:migrate --no-interaction`

