# 📚 Guide de Déploiement sur le VPS

Ce guide explique comment mettre à jour votre projet hébergé sur le VPS avec toutes les modifications récentes.

## 🎯 Méthode Recommandée : Déploiement Automatique

### Option 1 : Utiliser le Script Automatique (Recommandé)

1. **Connectez-vous à votre VPS via SSH**
   ```bash
   ssh root@VOTRE_IP_VPS
   ```

2. **Allez dans le répertoire du projet**
   ```bash
   cd /var/www/lossombras
   ```

3. **Téléchargez le script de déploiement** (si pas déjà présent)
   ```bash
   # Si vous avez déjà le projet en Git, faites un pull
   git pull origin main
   
   # Sinon, téléchargez le script
   wget https://raw.githubusercontent.com/VOTRE_REPO/lossombras/main/DEPLOY_VPS.sh
   ```

4. **Rendez le script exécutable et lancez-le**
   ```bash
   chmod +x DEPLOY_VPS.sh
   ./DEPLOY_VPS.sh
   ```

Le script va automatiquement :
- ✅ Sauvegarder vos fichiers critiques (.env.local)
- ✅ Récupérer les modifications depuis Git
- ✅ Mettre à jour les dépendances backend (Composer)
- ✅ Compiler le frontend en production
- ✅ Redémarrer les services (PHP-FPM, Nginx)

---

## 🔧 Méthode Manuelle (Alternative)

Si vous préférez faire les étapes manuellement :

### 1. Connectez-vous au VPS
```bash
ssh root@VOTRE_IP_VPS
cd /var/www/lossombras
```

### 2. Sauvegardez vos fichiers importants
```bash
# Sauvegarder .env.local (contient vos configurations)
cp backend/.env.local backend/.env.local.backup
```

### 3. Récupérez les modifications depuis Git
```bash
# Vérifier les modifications locales
git status

# Si vous avez des modifications non commitées, les sauvegarder
git stash

# Récupérer les dernières modifications
git pull origin main

# Si vous aviez fait un stash, réappliquer vos modifications
git stash pop
```

### 4. Mettez à jour le Backend
```bash
cd backend

# Installer/mettre à jour les dépendances
composer install --no-dev --optimize-autoloader

# Vider le cache Symfony
php bin/console cache:clear --env=prod --no-debug

# Optimiser l'autoloader
composer dump-autoload --optimize --classmap-authoritative
```

### 5. Compilez le Frontend
```bash
cd ../frontend

# Installer/mettre à jour les dépendances npm
npm install --legacy-peer-deps

# Build de production
npm run build -- --configuration production
```

### 6. Redémarrez les Services
```bash
# Détecter la version PHP (généralement 8.4 ou 8.3)
PHP_VERSION=$(php -v | head -n 1 | cut -d " " -f 2 | cut -c 1-3)
PHP_FPM_SERVICE="php${PHP_VERSION}-fpm"

# Redémarrer PHP-FPM
sudo systemctl restart $PHP_FPM_SERVICE

# Recharger Nginx
sudo systemctl reload nginx
```

---

## 📋 Fichiers Modifiés Récemment

Voici les principaux fichiers qui ont été modifiés et qui doivent être mis à jour :

### Frontend :
- `frontend/src/app/shared/components/sidebar/sidebar.component.ts` (nouveau design, rôles)
- `frontend/src/app/shared/components/header/header.component.ts` (nouveau design)
- `frontend/src/app/pages/**/*.component.ts` (nouveau design sur toutes les pages)
- `frontend/src/styles.css` (nouveaux styles globaux)
- `frontend/src/app/core/guards/admin.guard.ts` (ajout ROLE_ARMADA)
- `frontend/src/app/pages/admin/admin.component.ts` (ajout ROLE_ARMADA)

### Backend :
- Aucune modification backend nécessaire pour les dernières fonctionnalités

---

## ⚠️ Points d'Attention

### 1. Fichier `.env.local`
⚠️ **IMPORTANT** : Le fichier `backend/.env.local` contient vos configurations sensibles (base de données, JWT, etc.). 
- Ne le modifiez pas lors du déploiement
- Il est dans `.gitignore` donc ne sera pas écrasé par Git
- Le script le sauvegarde automatiquement

### 2. Base de Données
- Aucune migration n'est nécessaire pour les modifications récentes
- Si vous avez ajouté de nouveaux rôles (ROLE_ARMADA), ils seront automatiquement gérés par Symfony

### 3. Cache du Navigateur
Après le déploiement, les utilisateurs peuvent avoir besoin de vider leur cache :
- Chrome/Edge : `Ctrl+Shift+Delete`
- Ou utiliser `Ctrl+F5` pour forcer le rechargement

---

## 🔍 Vérification Post-Déploiement

### 1. Vérifier que le site fonctionne
```bash
curl -I http://VOTRE_DOMAINE_OU_IP
```

### 2. Vérifier les logs en cas d'erreur
```bash
# Logs backend
tail -f backend/var/log/prod.log

# Logs Nginx
tail -f /var/log/nginx/error.log

# Logs PHP-FPM
journalctl -u php8.4-fpm -f
```

### 3. Tester les fonctionnalités
- ✅ Connexion/Inscription
- ✅ Navigation (sidebar, header)
- ✅ Gestion des rôles (ROLE_ARMADA, ROLE_CONTADOR)
- ✅ Pages avec le nouveau design

---

## 🆘 En Cas de Problème

### Si le site ne fonctionne plus après le déploiement :

1. **Restaurer la sauvegarde de .env.local** :
   ```bash
   cp backend/.env.local.backup backend/.env.local
   ```

2. **Revenir à l'ancienne version** :
   ```bash
   git log --oneline  # Voir l'historique
   git reset --hard COMMIT_HASH  # Remplacer COMMIT_HASH par l'ancien commit
   ./DEPLOY_VPS.sh  # Relancer le déploiement
   ```

3. **Vérifier les permissions** :
   ```bash
   sudo chown -R www-data:www-data /var/www/lossombras
   sudo chmod -R 755 /var/www/lossombras
   ```

---

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs (voir section "Vérification")
2. Vérifiez que tous les services sont actifs :
   ```bash
   systemctl status nginx
   systemctl status php8.4-fpm
   ```
3. Vérifiez que les fichiers sont bien présents :
   ```bash
   ls -la frontend/dist/frontend/browser/
   ```

---

## ✅ Checklist de Déploiement

- [ ] Connexion SSH au VPS
- [ ] Sauvegarde de `.env.local`
- [ ] `git pull` réussi
- [ ] `composer install` réussi
- [ ] `npm install` réussi
- [ ] `npm run build` réussi
- [ ] Services redémarrés
- [ ] Site accessible
- [ ] Fonctionnalités testées

---

**Bon déploiement ! 🚀**



