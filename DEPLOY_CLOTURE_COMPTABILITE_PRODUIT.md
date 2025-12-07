# Déploiement du système de clôture hebdomadaire - Comptabilité Produit

## 📋 Commandes pour le VPS

### 1. Récupérer les modifications
```bash
cd /var/www/lossombras
git pull origin main
```

### 2. Installer les dépendances backend (si nécessaire)
```bash
cd backend
composer install --no-dev --optimize-autoloader --no-scripts
```

### 3. Exécuter la migration OU créer la table manuellement

#### Option A : Migration (si possible)
```bash
cd /var/www/lossombras/backend
php bin/console doctrine:migrations:migrate --no-interaction
```

#### Option B : Créer la table manuellement (si erreur de migration)
```bash
cd /var/www/lossombras/backend

# Créer la table comptabilite_archive
php bin/console doctrine:query:sql "CREATE TABLE IF NOT EXISTS comptabilite_archive (
    id INT AUTO_INCREMENT NOT NULL,
    date_cloture DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)',
    semaine VARCHAR(10) NOT NULL,
    nb_operations INT NOT NULL,
    commentaire LONGTEXT DEFAULT NULL,
    closed_by_id INT DEFAULT NULL,
    created_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)',
    INDEX IDX_COMPTABILITE_ARCHIVE_CLOSED_BY (closed_by_id),
    PRIMARY KEY(id)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB"

# Ajouter la clé étrangère
php bin/console doctrine:query:sql "ALTER TABLE comptabilite_archive ADD CONSTRAINT FK_COMPTABILITE_ARCHIVE_CLOSED_BY FOREIGN KEY (closed_by_id) REFERENCES \`user\` (id)"

# Marquer la migration comme exécutée
php bin/console doctrine:migrations:version DoctrineMigrations\\Version20251205115123 --add --no-interaction
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
59 23 * * 0 cd /var/www/lossombras/backend && php bin/console app:close-week-comptabilite >> /var/log/cloture-comptabilite.log 2>&1
```

## ✅ Vérification

1. **Vérifier que la migration est appliquée :**
```bash
cd /var/www/lossombras/backend
php bin/console doctrine:migrations:status
```

2. **Vérifier que la table existe :**
```bash
php bin/console doctrine:query:sql "SHOW TABLES LIKE 'comptabilite_archive'"
```

3. **Tester la commande de clôture (optionnel) :**
```bash
php bin/console app:close-week-comptabilite
```

## 📝 Notes

- La clôture peut être faite manuellement depuis l'interface web
- Le système empêche de clôturer deux fois la même semaine
- L'historique est complètement effacé pour repartir à zéro
- Le nombre d'opérations archivées est conservé pour information

## 🚨 Important

- La clôture est **irréversible** - assurez-vous d'avoir fait une sauvegarde si nécessaire
- Les opérations sont supprimées mais le nombre est archivé
- Cette action améliore les performances en réduisant la quantité de données



