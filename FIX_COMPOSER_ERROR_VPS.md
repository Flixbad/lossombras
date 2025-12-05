# 🔧 Résolution de l'erreur Composer sur le VPS

## Problème rencontré

```
Script symfony-cmd handling the auto-scripts event returned with error code 127
Plugins have been disabled automatically as you are running as root
```

## ✅ Solution 1 : Ignorer les scripts (Recommandé)

Utilisez le flag `--no-scripts` lors de l'installation :

```bash
cd /var/www/lossombras/backend
composer install --no-dev --optimize-autoloader --no-scripts
```

Cela installera les dépendances sans exécuter les scripts automatiques qui posent problème.

## ✅ Solution 2 : Utiliser un utilisateur non-root

Si possible, créez un utilisateur dédié pour éviter les problèmes de permissions :

```bash
# Créer un utilisateur pour le projet
sudo adduser los_sombras_user
sudo usermod -aG www-data los_sombras_user

# Donner les permissions
sudo chown -R los_sombras_user:www-data /var/www/lossombras
sudo chmod -R 755 /var/www/lossombras

# Passer à cet utilisateur
sudo su - los_sombras_user
cd /var/www/lossombras/backend
composer install --no-dev --optimize-autoloader
```

## ✅ Solution 3 : Vérifier que Symfony est accessible

Parfois, le problème vient du fait que `symfony-cmd` n'est pas dans le PATH :

```bash
# Vérifier où se trouve symfony
which symfony

# Si rien, installer Symfony CLI globalement
wget https://get.symfony.com/cli/installer -O - | bash
export PATH="$HOME/.symfony5/bin:$PATH"
```

## ✅ Solution 4 : Installer sans scripts et exécuter manuellement

```bash
cd /var/www/lossombras/backend

# Installer sans scripts
composer install --no-dev --optimize-autoloader --no-scripts

# Puis exécuter les commandes Symfony manuellement si nécessaire
php bin/console cache:clear
php bin/console doctrine:migrations:migrate --no-interaction
```

## 🚀 Commandes corrigées pour le déploiement

Voici les commandes complètes avec la correction :

```bash
cd /var/www/lossombras
git pull origin main

cd backend
composer install --no-dev --optimize-autoloader --no-scripts

php bin/console cache:clear
php bin/console doctrine:migrations:migrate --no-interaction

cd ../frontend
npm install
npm run build

sudo systemctl restart php8.4-fpm
sudo systemctl reload nginx
```

## 📝 Note

L'erreur 127 est souvent liée à :
- L'exécution en tant que root (plugins désactivés)
- Un script qui ne peut pas trouver une commande
- Des permissions incorrectes

Le flag `--no-scripts` résout généralement le problème car il évite d'exécuter les scripts qui causent l'erreur. Les fonctionnalités Symfony continueront de fonctionner normalement.

