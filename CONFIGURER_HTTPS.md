# Configuration HTTPS avec Let's Encrypt

## Prérequis
- Un domaine pointant vers votre IP serveur (ex: lossombras.com)
- Port 80 ouvert (HTTP)
- Port 443 ouvert (HTTPS)

## Installation de Certbot

### Sur Debian/Ubuntu :
```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

## Configuration HTTPS

### Option 1 : Configuration automatique (RECOMMANDÉ)
```bash
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com
```

Certbot va :
- Générer les certificats SSL
- Configurer automatiquement Nginx pour HTTPS
- Rediriger HTTP vers HTTPS
- Configurer le renouvellement automatique

### Option 2 : Configuration manuelle

#### 1. Obtenir le certificat
```bash
sudo certbot certonly --standalone -d votre-domaine.com -d www.votre-domaine.com
```

#### 2. Configurer Nginx pour HTTPS
```bash
sudo nano /etc/nginx/sites-available/lossombras
```

Ajouter/modifier la configuration :
```nginx
# Redirection HTTP vers HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name votre-domaine.com www.votre-domaine.com;
    return 301 https://$server_name$request_uri;
}

# Configuration HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name votre-domaine.com www.votre-domaine.com;
    
    # Certificats SSL
    ssl_certificate /etc/letsencrypt/live/votre-domaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/votre-domaine.com/privkey.pem;
    
    # Configuration SSL moderne
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    root /var/www/lossombras/frontend/dist/frontend/browser;
    index index.html;
    
    # Logs
    access_log /var/log/nginx/lossombras-access.log;
    error_log /var/log/nginx/lossombras-error.log;
    
    # Taille max des uploads
    client_max_body_size 20M;
    
    # Headers de sécurité
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # API Symfony - Backend
    location /api {
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
            add_header 'Access-Control-Max-Age' 3600 always;
            add_header 'Content-Length' 0;
            add_header 'Content-Type' 'text/plain';
            return 204;
        }
        
        fastcgi_pass unix:/var/run/php/php8.4-fpm.sock;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME /var/www/lossombras/backend/public/index.php;
        fastcgi_param DOCUMENT_ROOT /var/www/lossombras/backend/public;
        fastcgi_param REQUEST_URI $request_uri;
        fastcgi_param PATH_INFO $uri;
        fastcgi_param HTTPS on;
        
        fastcgi_read_timeout 300;
        fastcgi_buffers 16 16k;
        fastcgi_buffer_size 32k;
        
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
    }
    
    # Frontend Angular - Routes
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Ignorer silencieusement les icônes manquantes
    location ~ ^/(favicon\.ico|apple-touch-icon.*\.png|icons/.*|android-chrome.*\.png|site\.webmanifest|browserconfig\.xml|robots\.txt)$ {
        access_log off;
        log_not_found off;
        expires 24h;
        return 204;
    }
    
    # Cache pour les assets statiques
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # Sécurité
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
    
    location ~ \.(env|json|lock|md|txt)$ {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

#### 3. Tester la configuration
```bash
sudo nginx -t
```

#### 4. Recharger Nginx
```bash
sudo systemctl reload nginx
```

## Renouvellement automatique

Certbot configure automatiquement le renouvellement. Vérifier :
```bash
sudo certbot renew --dry-run
```

Pour tester le renouvellement :
```bash
sudo certbot renew
```

## Commandes utiles

### Voir les certificats installés
```bash
sudo certbot certificates
```

### Renouveler un certificat manuellement
```bash
sudo certbot renew
```

### Supprimer un certificat
```bash
sudo certbot delete --cert-name votre-domaine.com
```

## Vérification

Après configuration, vérifier que HTTPS fonctionne :
```bash
curl -I https://votre-domaine.com
```

Vous devriez voir `HTTP/2 200` ou `HTTP/1.1 200 OK`.

## Important

- Remplacez `votre-domaine.com` par votre vrai domaine
- Assurez-vous que votre domaine pointe vers l'IP du serveur
- Les certificats Let's Encrypt expirent après 90 jours mais sont renouvelés automatiquement
- Le port 443 doit être ouvert dans le pare-feu

