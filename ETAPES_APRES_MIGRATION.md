# 📋 Étapes après avoir marqué la migration

## 1. Exécuter les migrations restantes

Maintenant que la migration `Version20251121204144` est marquée comme exécutée, vous pouvez exécuter les autres migrations :

```bash
cd /var/www/lossombras/backend
php bin/console doctrine:migrations:migrate --no-interaction
```

Cela va exécuter les migrations pour :
- `Version20251205171036` - Modification de la structure `vente_drogue`
- `Version20251205190325` - Ajout du champ `type_drogue` à `vente_drogue`
- Toutes les autres migrations en attente

---

## 2. Vérifier l'état des migrations

Pour voir quelles migrations sont exécutées :

```bash
cd /var/www/lossombras/backend
php bin/console doctrine:migrations:status
```

---

## 3. Vider le cache Symfony

```bash
cd /var/www/lossombras/backend
php bin/console cache:clear --env=prod --no-debug
```

---

## 4. Builder le frontend (si nécessaire)

```bash
cd /var/www/lossombras/frontend
npm install
npm run build
```

---

## 5. Redémarrer les services

**Si vous utilisez PM2 :**
```bash
pm2 restart all
```

**Si vous utilisez systemd :**
```bash
sudo systemctl restart nginx
sudo systemctl restart php8.1-fpm  # ou votre version de PHP
```

---

## 6. Vérifier que tout fonctionne

- Accéder à votre site
- Se connecter avec un compte autorisé (Jefe, Segundo, Alférez, Contador)
- Vérifier que la page "Comptabilité Argent" s'affiche
- Vérifier que la section "Ventes de Drogue" est visible
- Tester l'enregistrement d'une vente de drogue

---

## Résumé des commandes complètes

```bash
cd /var/www/lossombras
git pull origin main

# Backend
cd backend
composer install --no-dev --optimize-autoloader --no-scripts
php bin/console doctrine:migrations:migrate --no-interaction
php bin/console cache:clear --env=prod --no-debug

# Frontend
cd ../frontend
npm install
npm run build

# Redémarrer
pm2 restart all  # ou systemctl restart nginx && systemctl restart php8.1-fpm
```

