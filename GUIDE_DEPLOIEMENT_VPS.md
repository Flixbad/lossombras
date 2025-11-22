# 🚀 Guide de Déploiement - Los Sombras sur VPS Hostinger

## 📋 Prérequis

- VPS Hostinger avec accès SSH
- Repo Git déjà configuré
- Domaine pointant vers votre VPS (optionnel mais recommandé)

---

## 1️⃣ Préparation du Projet (Local)

### 1.1 Pousser le code sur Git

```bash
# Depuis votre machine locale
cd "/Users/evanbuland/Desktop/Los Sombras"

# Vérifier le statut
git status

# Ajouter tous les fichiers
git add .

# Commit
git commit -m "Préparation pour déploiement production"

# Pousser sur le repo
git push origin main
# ou
git push origin master
```

### 1.2 Créer les fichiers de configuration pour production

#### Backend - .env.production
```bash
cd backend
cp .env .env.production
```

Éditer `.env.production` avec vos vraies valeurs de production :
```env
APP_ENV=prod
APP_SECRET=votre_secret_production_aleatoire

DATABASE_URL="mysql://user:password@127.0.0.1:3306/los_sombras?serverVersion=8.0.32&charset=utf8mb4"

CORS_ALLOW_ORIGIN=https://votre-domaine.com

JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=votre_passphrase_aleatoire
```

---

## 2️⃣ Configuration du VPS Hostinger

### 2.1 Connexion SSH

```bash
# Se connecter au VPS
ssh root@votre-ip-vps
# ou
ssh votre-utilisateur@votre-ip-vps
```

### 2.2 Mise à jour du système

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
```

### 2.3 Installation des dépendances

#### Node.js (pour Angular)

```bash
# Installer Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Vérifier l'installation
node --version
npm --version

# Installer Angular CLI globalement
sudo npm install -g @angular/cli@17
```

#### PHP 8.2 et extensions

```bash
# Vérifier la version de PHP disponible
apt search php | grep php8

# Ajouter le dépôt PHP si nécessaire (pour Ubuntu/Debian)
sudo apt install -y software-properties-common
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update

# Installer PHP 8.2
sudo apt install -y php8.2 php8.2-cli php8.2-fpm php8.2-mysql php8.2-xml php8.2-curl php8.2-zip php8.2-mbstring php8.2-intl php8.2-bcmath

# Si PHP 8.2 n'est toujours pas disponible, essayez PHP 8.1 ou 8.3
# sudo apt install -y php8.1 php8.1-cli php8.1-fpm php8.1-mysql php8.1-xml php8.1-curl php8.1-zip php8.1-mbstring php8.1-intl php8.1-bcmath

# Vérifier
php -v
```

**Note :** Si vous utilisez CentOS/RHEL ou une autre distribution, utilisez :
```bash
# Pour CentOS/RHEL 8+
sudo dnf install -y https://rpms.remirepo.net/enterprise/remi-release-8.rpm
sudo dnf module enable php:remi-8.2 -y
sudo dnf install -y php php-cli php-fpm php-mysqlnd php-xml php-curl php-zip php-mbstring php-intl php-bcmath
```

#### Composer

```bash
# Installer Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
sudo chmod +x /usr/local/bin/composer

# Vérifier
composer --version
```

#### MySQL/MariaDB

**Sur Debian récent (Trixie, Bookworm) :**
```bash
# Installer MariaDB (remplace MySQL sur Debian récent)
sudo apt install -y mariadb-server

# Sécuriser l'installation
sudo mysql_secure_installation

# Créer la base de données et l'utilisateur
sudo mysql -u root -p

# Dans MariaDB/MySQL (les commandes sont identiques) :
CREATE DATABASE los_sombras CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'los_sombras_user'@'localhost' IDENTIFIED BY 'votre_mot_de_passe_fort';
GRANT ALL PRIVILEGES ON los_sombras.* TO 'los_sombras_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

**Sur Ubuntu ou si vous voulez MySQL spécifiquement :**
```bash
# Installer MySQL
sudo apt install -y mysql-server
sudo mysql_secure_installation
sudo mysql -u root -p
# Puis les mêmes commandes SQL ci-dessus
```

**Note :** MariaDB est 100% compatible avec MySQL. Symfony fonctionne parfaitement avec les deux. Les commandes SQL sont identiques.

#### Nginx

```bash
# Installer Nginx
sudo apt install -y nginx

# Démarrer Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Vérifier le statut
sudo systemctl status nginx
```

---

## 3️⃣ Déploiement du Projet

### 3.1 Créer le répertoire de déploiement

```bash
# Créer le répertoire
sudo mkdir -p /var/www/lossombras
sudo chown -R $USER:$USER /var/www/lossombras

# Aller dans le répertoire
cd /var/www/lossombras
```

### 3.2 Cloner le repo Git

```bash
# Cloner le repository
git clone https://votre-repo.git .

# Ou si vous avez une clé SSH configurée
git clone git@votre-repo.git .
```

### 3.3 Configuration du Backend Symfony

```bash
# Aller dans le dossier backend
cd /var/www/lossombras/backend

# Installer les dépendances
composer install --no-dev --optimize-autoloader

# Copier et configurer .env
cp .env .env.local
nano .env.local  # Éditer avec vos valeurs de production

# Créer les clés JWT
mkdir -p config/jwt
openssl genpkey -out config/jwt/private.pem -aes256 -algorithm rsa -pkeyopt rsa_keygen_bits:4096
openssl pkey -in config/jwt/private.pem -out config/jwt/public.pem -pubout

# Notez la passphrase utilisée et ajoutez-la dans .env.local :
# JWT_PASSPHRASE=votre_passphrase

# Donner les permissions
chmod 600 config/jwt/private.pem
chmod 644 config/jwt/public.pem

# Créer la base de données et exécuter les migrations
php bin/console doctrine:database:create --if-not-exists
php bin/console doctrine:migrations:migrate --no-interaction

# Charger les fixtures (optionnel, seulement pour données initiales)
php bin/console doctrine:fixtures:load --no-interaction

# Vider le cache
php bin/console cache:clear --env=prod
```

### 3.4 Build du Frontend Angular

```bash
# Aller dans le dossier frontend
cd /var/www/lossombras/frontend

# Installer les dépendances
npm install

# Build de production
ng build --configuration production

# Vérifier que le build a réussi
ls -la dist/frontend/
```

### 3.5 Configuration des permissions

```bash
# Retourner à la racine
cd /var/www/lossombras

# Donner les bonnes permissions
sudo chown -R www-data:www-data /var/www/lossombras
sudo chmod -R 755 /var/www/lossombras

# Permissions spécifiques pour Symfony
sudo chmod -R 775 /var/www/lossombras/backend/var
sudo chown -R www-data:www-data /var/www/lossombras/backend/var
```

---

## 4️⃣ Configuration Nginx

### 4.1 Créer la configuration Nginx

```bash
sudo nano /etc/nginx/sites-available/los-sombras
```

Contenu de la configuration :

```nginx
# Redirection HTTP vers HTTPS (si vous avez SSL)
server {
    listen 80;
    listen [::]:80;
    server_name votre-domaine.com www.votre-domaine.com;
    
    # Pour le moment, on accepte HTTP aussi
    # Plus tard, décommentez pour forcer HTTPS
    # return 301 https://$server_name$request_uri;
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# Configuration principale
server {
    listen 80;
    listen [::]:80;
    server_name votre-domaine.com www.votre-domaine.com;
    
    # Ou si vous avez SSL :
    # listen 443 ssl http2;
    # listen [::]:443 ssl http2;
    # ssl_certificate /etc/letsencrypt/live/votre-domaine.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/votre-domaine.com/privkey.pem;
    
    root /var/www/lossombras/frontend/dist/frontend/browser;
    index index.html;
    
    # Logs
    access_log /var/log/nginx/los-sombras-access.log;
    error_log /var/log/nginx/los-sombras-error.log;
    
    # Taille max des uploads
    client_max_body_size 20M;
    
    # API Symfony - Backend
    location /api {
        try_files $uri /backend/public/index.php$is_args$args;
    }
    
    location ~ ^/api(/.*)$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_split_path_info ^(.+\.php)(/.*)$;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME /var/www/lossombras/backend/public/index.php;
        fastcgi_param DOCUMENT_ROOT /var/www/lossombras/backend/public;
        fastcgi_param PATH_INFO $fastcgi_path_info;
        fastcgi_param REQUEST_URI $1;
        fastcgi_param HTTPS $https if_not_empty;
        fastcgi_read_timeout 300;
    }
    
    # PHP pour les autres requêtes Symfony
    location ~ ^/backend(/.*)\.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_split_path_info ^(.+\.php)(/.*)$;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME /var/www/lossombras/backend/public$1.php;
        fastcgi_param DOCUMENT_ROOT /var/www/lossombras/backend/public;
        fastcgi_param PATH_INFO $2;
    }
    
    # Frontend Angular - Routes
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache pour les assets statiques
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # Sécurité - Masquer les fichiers sensibles
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    location ~ /(backend/var|backend/config|\.env) {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

### 4.2 Activer le site

```bash
# Créer le lien symbolique
sudo ln -s /etc/nginx/sites-available/los-sombras /etc/nginx/sites-enabled/

# Supprimer le site par défaut (optionnel)
sudo rm /etc/nginx/sites-enabled/default

# Tester la configuration
sudo nginx -t

# Recharger Nginx
sudo systemctl reload nginx
```

---

## 5️⃣ Configuration PHP-FPM

### 5.1 Optimiser PHP-FPM

```bash
sudo nano /etc/php/8.2/fpm/php.ini
```

Ajuster ces valeurs :
```ini
upload_max_filesize = 20M
post_max_size = 20M
memory_limit = 256M
max_execution_time = 300
```

```bash
sudo nano /etc/php/8.2/fpm/pool.d/www.conf
```

Vérifier/adjuster :
```ini
user = www-data
group = www-data
listen = /var/run/php/php8.2-fpm.sock
listen.owner = www-data
listen.group = www-data
pm.max_children = 50
pm.start_servers = 5
pm.min_spare_servers = 5
pm.max_spare_servers = 35
```

```bash
# Redémarrer PHP-FPM
sudo systemctl restart php8.2-fpm
```

---

## 6️⃣ Configuration du Firewall (UFW)

```bash
# Installer UFW
sudo apt install -y ufw

# Autoriser SSH (IMPORTANT avant d'activer le firewall)
sudo ufw allow ssh
sudo ufw allow 22/tcp

# Autoriser HTTP et HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Activer le firewall
sudo ufw enable

# Vérifier le statut
sudo ufw status
```

---

## 7️⃣ SSL avec Let's Encrypt (Recommandé)

```bash
# Installer Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtenir le certificat SSL
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com

# Renouvellement automatique
sudo certbot renew --dry-run
```

---

## 8️⃣ Variables d'Environnement Frontend

Si votre frontend a besoin de variables d'environnement pour l'API :

```bash
cd /var/www/lossombras/frontend/src

# Créer un fichier environment.prod.ts
nano environments/environment.prod.ts
```

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://votre-domaine.com/api'
};
```

Puis modifier `angular.json` pour utiliser cet environnement en production.

---

## 9️⃣ Créer un Script de Déploiement

```bash
cd /var/www/lossombras
nano deploy.sh
```

```bash
#!/bin/bash
set -e

echo "🚀 Déploiement Los Sombras..."

# Aller dans le répertoire
cd /var/www/lossombras

# Pull les dernières modifications
echo "📥 Pull depuis Git..."
git pull origin main

# Backend
echo "🔧 Configuration Backend..."
cd backend
composer install --no-dev --optimize-autoloader
php bin/console doctrine:migrations:migrate --no-interaction
php bin/console cache:clear --env=prod

# Frontend
echo "🎨 Build Frontend..."
cd ../frontend
npm install
ng build --configuration production

# Permissions
echo "🔐 Mise à jour des permissions..."
cd ..
sudo chown -R www-data:www-data /var/www/lossombras
sudo chmod -R 755 /var/www/lossombras
sudo chmod -R 775 /var/www/lossombras/backend/var

# Redémarrer les services
echo "🔄 Redémarrage des services..."
sudo systemctl restart php8.2-fpm
sudo systemctl reload nginx

echo "✅ Déploiement terminé !"
```

```bash
# Rendre le script exécutable
chmod +x deploy.sh
```

---

## 🔟 Commandes Utiles

### Vérifier les services

```bash
# Statut des services
sudo systemctl status nginx
sudo systemctl status php8.2-fpm
sudo systemctl status mysql

# Logs
sudo tail -f /var/log/nginx/los-sombras-error.log
sudo tail -f /var/www/lossombras/backend/var/log/prod.log
```

### Redémarrer les services

```bash
sudo systemctl restart nginx
sudo systemctl restart php8.2-fpm
sudo systemctl restart mysql
```

### Vérifier les ports

```bash
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443
```

---

## 📝 Checklist de Déploiement

- [ ] Code poussé sur Git
- [ ] VPS configuré (Node.js, PHP, MySQL, Nginx)
- [ ] Repo cloné sur le VPS
- [ ] Base de données créée
- [ ] Variables d'environnement configurées (.env.local)
- [ ] Clés JWT générées
- [ ] Migrations exécutées
- [ ] Frontend buildé
- [ ] Nginx configuré
- [ ] Permissions correctes
- [ ] Services démarrés
- [ ] Firewall configuré
- [ ] SSL configuré (optionnel)
- [ ] Test d'accès au site

---

## 🐛 Dépannage

### Erreur 502 Bad Gateway

```bash
# Vérifier PHP-FPM
sudo systemctl status php8.2-fpm
sudo tail -f /var/log/php8.2-fpm.log

# Vérifier le socket
ls -la /var/run/php/php8.2-fpm.sock
```

### Erreur de permissions

```bash
sudo chown -R www-data:www-data /var/www/lossombras
sudo chmod -R 755 /var/www/lossombras
```

### Frontend ne charge pas

```bash
# Vérifier le build
ls -la /var/www/lossombras/frontend/dist/frontend/browser/

# Rebuild si nécessaire
cd /var/www/lossombras/frontend
ng build --configuration production
```

### Base de données inaccessible

```bash
# Tester la connexion
mysql -u los_sombras_user -p los_sombras

# Vérifier les permissions
sudo mysql -u root -p
SHOW GRANTS FOR 'los_sombras_user'@'localhost';
```

---

## 🎉 Vous êtes prêt !

Votre application devrait maintenant être accessible sur `http://votre-domaine.com` ou `http://votre-ip-vps`.

Pour les mises à jour futures, utilisez simplement le script `deploy.sh` :

```bash
cd /var/www/lossombras
./deploy.sh
```

