# Déploiement du système de clôture hebdomadaire - Comptabilité Argent

## 📋 Commandes pour le VPS

### 1. Récupérer les modifications
```bash
cd /var/www/lossombras
git pull origin main
```

### 2. Installer les dépendances backend (si nécessaire)
```bash
cd backend
composer install --no-dev --optimize-autoloader
```

### 3. Exécuter la migration
```bash
cd /var/www/lossombras/backend
php bin/console doctrine:migrations:migrate --no-interaction
```

### 4. Vider le cache Symfony
```bash
php bin/console cache:clear
```

### 5. Rebuild le frontend
```bash
cd /var/www/lossombras/frontend
npm install
npm run build
```

### 6. Redémarrer les services
```bash
sudo systemctl restart php8.4-fpm
sudo systemctl reload nginx
```

## 🔄 Configuration automatique (Optionnel)

Pour automatiser la clôture chaque dimanche à 23h59, ajoutez cette ligne au crontab :

```bash
# Éditer le crontab
sudo crontab -e

# Ajouter cette ligne (remplacez le chemin si différent)
59 23 * * 0 cd /var/www/lossombras/backend && php bin/console app:close-week-argent >> /var/log/cloture-argent.log 2>&1
```

## ✅ Vérification

1. **Vérifier que la migration est appliquée :**
```bash
cd /var/www/lossombras/backend
php bin/console doctrine:migrations:status
```

2. **Tester la commande de clôture (manuellement) :**
```bash
php bin/console app:close-week-argent
```

3. **Vérifier que la table existe :**
```bash
php bin/console doctrine:query:sql "SHOW TABLES LIKE 'argent_archive'"
```

## 📝 Notes

- La clôture peut être faite manuellement depuis l'interface web
- Le système empêche de clôturer deux fois la même semaine
- Le solde est automatiquement reporté comme une opération "ajout" après clôture
- L'historique est complètement effacé pour repartir à zéro

## 🚨 Important

- La clôture est **irréversible** - assurez-vous d'avoir fait une sauvegarde si nécessaire
- Le solde est toujours préservé et reporté dans la nouvelle semaine
- L'historique des opérations est supprimé mais le solde reste intact

