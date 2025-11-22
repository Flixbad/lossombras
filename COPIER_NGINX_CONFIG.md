# 🔧 Copier la configuration Nginx sur le VPS

Le fichier `nginx-config.conf` existe localement mais pas sur votre VPS. Voici comment le transférer.

## ✅ Option 1 : Via Git (si vous avez un repo)

Si le fichier est dans votre repo Git :

```bash
# Sur votre VPS
cd /var/www/lossombras
git pull

# Puis copier la configuration
sudo cp /var/www/lossombras/nginx-config.conf /etc/nginx/sites-available/los-sombras
```

---

## ✅ Option 2 : Créer le fichier directement sur le VPS

### Méthode A : Via nano (copier-coller)

```bash
# Sur votre VPS
sudo nano /etc/nginx/sites-available/los-sombras
```

Puis copiez-collez le contenu du fichier `nginx-config.conf` local.

### Méthode B : Via cat avec heredoc

```bash
# Sur votre VPS
sudo tee /etc/nginx/sites-available/los-sombras > /dev/null << 'EOF'
# Configuration Nginx pour Los Sombras

server {
    listen 80;
    listen [::]:80;
    server_name votre-domaine.com www.votre-domaine.com;
    
    root /var/www/lossombras/frontend/dist/frontend/browser;
    index index.html;
    
    # Logs
    access_log /var/log/nginx/los-sombras-access.log;
    error_log /var/log/nginx/los-sombras-error.log;
    
    # Taille max des uploads
    client_max_body_size 20M;
    
    # Headers de sécurité
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
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
        
        # Timeout
        fastcgi_read_timeout 300;
        fastcgi_buffers 16 16k;
        fastcgi_buffer_size 32k;
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
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|webp)$ {
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
    
    # Masquer les fichiers de configuration
    location ~ \.(env|json|lock|md|txt)$ {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF
```

---

## ✅ Option 3 : Via SCP (depuis votre machine locale)

Si vous avez SSH configuré, vous pouvez transférer le fichier depuis votre machine locale :

```bash
# Sur votre machine locale (pas sur le VPS)
scp nginx-config.conf root@31.97.199.106:/tmp/nginx-config.conf

# Puis sur le VPS
sudo cp /tmp/nginx-config.conf /etc/nginx/sites-available/los-sombras
sudo rm /tmp/nginx-config.conf
```

---

## ⚙️ Configuration importante à vérifier

### 1. Modifier le domaine

Dans le fichier `/etc/nginx/sites-available/los-sombras`, remplacez :

```nginx
server_name votre-domaine.com www.votre-domaine.com;
```

Par votre vrai domaine ou IP :

```nginx
server_name 31.97.199.106;
# OU si vous avez un domaine :
# server_name exemple.com www.exemple.com;
```

### 2. Vérifier le chemin du socket PHP

Si vous utilisez une version différente de PHP, ajustez :

```nginx
fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
```

Par exemple, pour PHP 8.3 :
```nginx
fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
```

Pour vérifier votre version PHP :
```bash
php -v
```

Pour vérifier le socket PHP-FPM disponible :
```bash
ls -la /var/run/php/
```

---

## 📋 Après avoir créé le fichier

### 1. Créer le lien symbolique

```bash
sudo ln -s /etc/nginx/sites-available/los-sombras /etc/nginx/sites-enabled/
```

### 2. Vérifier la configuration

```bash
sudo nginx -t
```

Si tout est OK, vous verrez :
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 3. Recharger Nginx

```bash
sudo systemctl reload nginx
# OU
sudo service nginx reload
```

---

## 🐛 Dépannage

### Erreur : "server_name cannot be empty"

Assurez-vous d'avoir remplacé `votre-domaine.com` par votre vrai domaine ou IP.

### Erreur : "fastcgi_pass cannot be empty"

Vérifiez que le socket PHP existe :
```bash
ls -la /var/run/php/
```

Si le socket n'existe pas, activez PHP-FPM :
```bash
sudo systemctl enable php8.2-fpm
sudo systemctl start php8.2-fpm
```

### Erreur : "Connection refused" sur l'API

Vérifiez que PHP-FPM est actif :
```bash
sudo systemctl status php8.2-fpm
```

---

## ✅ Checklist

- [ ] Fichier créé dans `/etc/nginx/sites-available/los-sombras`
- [ ] `server_name` modifié avec votre domaine/IP
- [ ] Chemin du socket PHP correct
- [ ] Lien symbolique créé dans `/etc/nginx/sites-enabled/`
- [ ] Configuration testée (`nginx -t`)
- [ ] Nginx rechargé (`systemctl reload nginx`)

