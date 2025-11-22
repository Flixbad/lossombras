# ⚡ Commandes Rapides - Déploiement VPS

## 🔗 Connexion au VPS

```bash
ssh root@votre-ip-vps
# ou
ssh votre-utilisateur@votre-ip-vps
```

---

## 📦 Installation Initiale (Première fois)

### Mise à jour système
```bash
sudo apt update && sudo apt upgrade -y
```

### Installation Node.js 20
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g @angular/cli@17
```

### Installation PHP 8.2
```bash
sudo apt install -y php8.2 php8.2-cli php8.2-fpm php8.2-mysql php8.2-xml php8.2-curl php8.2-zip php8.2-mbstring php8.2-intl php8.2-bcmath
```

### Installation Composer
```bash
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
sudo chmod +x /usr/local/bin/composer
```

### Installation MySQL
```bash
sudo apt install -y mysql-server
sudo mysql_secure_installation
```

### Installation Nginx
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Création de la base de données
```bash
sudo mysql -u root -p
```

```sql
CREATE DATABASE los_sombras CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'los_sombras_user'@'localhost' IDENTIFIED BY 'VOTRE_MOT_DE_PASSE_FORT';
GRANT ALL PRIVILEGES ON los_sombras.* TO 'los_sombras_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 🚀 Déploiement du Projet

### Cloner le repo
```bash
sudo mkdir -p /var/www/los-sombras
sudo chown -R $USER:$USER /var/www/los-sombras
cd /var/www/los-sombras
git clone https://votre-repo.git .
```

### Configuration Backend
```bash
cd backend
composer install --no-dev --optimize-autoloader

# Créer .env.local
cp .env .env.local
nano .env.local  # Configurer avec vos valeurs

# Créer les clés JWT
mkdir -p config/jwt
openssl genpkey -out config/jwt/private.pem -aes256 -algorithm rsa -pkeyopt rsa_keygen_bits:4096
openssl pkey -in config/jwt/private.pem -out config/jwt/public.pem -pubout
chmod 600 config/jwt/private.pem
chmod 644 config/jwt/public.pem

# Migrations
php bin/console doctrine:migrations:migrate --no-interaction
php bin/console cache:clear --env=prod
```

### Build Frontend
```bash
cd ../frontend
npm install --legacy-peer-deps
ng build --configuration production
```

### Configuration Nginx
```bash
# Copier la config depuis le repo
sudo cp /var/www/los-sombras/nginx-config.conf /etc/nginx/sites-available/los-sombras

# Éditer pour mettre votre domaine
sudo nano /etc/nginx/sites-available/los-sombras

# Activer le site
sudo ln -s /etc/nginx/sites-available/los-sombras /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Tester et recharger
sudo nginx -t
sudo systemctl reload nginx
```

### Permissions
```bash
cd /var/www/los-sombras
sudo chown -R www-data:www-data /var/www/los-sombras
sudo chmod -R 755 /var/www/los-sombras
sudo chmod -R 775 /var/www/los-sombras/backend/var
```

---

## 🔄 Mise à Jour (Déploiement futur)

### Avec le script automatique
```bash
cd /var/www/los-sombras
chmod +x deploy.sh
./deploy.sh
```

### Manuellement
```bash
cd /var/www/los-sombras
git pull origin main

# Backend
cd backend
composer install --no-dev --optimize-autoloader
php bin/console doctrine:migrations:migrate --no-interaction
php bin/console cache:clear --env=prod

# Frontend
cd ../frontend
npm install --legacy-peer-deps
ng build --configuration production

# Permissions
cd ..
sudo chown -R www-data:www-data /var/www/los-sombras

# Redémarrer
sudo systemctl restart php8.2-fpm
sudo systemctl reload nginx
```

---

## 🔒 Configuration SSL (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com
sudo certbot renew --dry-run
```

---

## 🔧 Commandes Utiles

### Vérifier les services
```bash
sudo systemctl status nginx
sudo systemctl status php8.2-fpm
sudo systemctl status mysql
```

### Redémarrer les services
```bash
sudo systemctl restart nginx
sudo systemctl restart php8.2-fpm
sudo systemctl restart mysql
```

### Voir les logs
```bash
# Logs Nginx
sudo tail -f /var/log/nginx/los-sombras-error.log

# Logs Symfony
sudo tail -f /var/www/los-sombras/backend/var/log/prod.log

# Logs PHP-FPM
sudo tail -f /var/log/php8.2-fpm.log
```

### Vérifier les ports
```bash
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443
```

---

## 🐛 Dépannage

### 502 Bad Gateway
```bash
sudo systemctl status php8.2-fpm
ls -la /var/run/php/php8.2-fpm.sock
```

### Erreur de permissions
```bash
sudo chown -R www-data:www-data /var/www/los-sombras
sudo chmod -R 755 /var/www/los-sombras
```

### Frontend ne charge pas
```bash
ls -la /var/www/los-sombras/frontend/dist/frontend/browser/
cd /var/www/los-sombras/frontend
ng build --configuration production
```

### Base de données inaccessible
```bash
mysql -u los_sombras_user -p los_sombras
sudo mysql -u root -p
```

---

## 📝 Checklist Déploiement

- [ ] Git cloné
- [ ] .env.local configuré
- [ ] Clés JWT générées
- [ ] Base de données créée
- [ ] Migrations exécutées
- [ ] Frontend buildé
- [ ] Nginx configuré
- [ ] Permissions correctes
- [ ] Services démarrés
- [ ] Site accessible

