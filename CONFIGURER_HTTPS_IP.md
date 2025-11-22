# Configuration HTTPS sans domaine (avec IP uniquement)

## Problème
Let's Encrypt et la plupart des autorités de certification SSL **ne peuvent pas** émettre de certificats pour des adresses IP publiques - seulement pour des noms de domaine.

## Alternatives

### Option 1 : Certificat auto-signé (pour tests/développement)

⚠️ **Important** : Les navigateurs afficheront un avertissement de sécurité, mais la connexion sera chiffrée.

#### Générer un certificat auto-signé
```bash
# Créer un répertoire pour les certificats
sudo mkdir -p /etc/nginx/ssl

# Générer le certificat et la clé privée
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/self-signed.key \
  -out /etc/nginx/ssl/self-signed.crt \
  -subj "/C=FR/ST=State/L=City/O=Organization/CN=31.97.199.106"

# Sécuriser les fichiers
sudo chmod 600 /etc/nginx/ssl/self-signed.key
sudo chmod 644 /etc/nginx/ssl/self-signed.crt
```

#### Configurer Nginx pour HTTPS avec certificat auto-signé
```bash
sudo nano /etc/nginx/sites-available/lossombras
```

Ajouter/modifier :
```nginx
# Redirection HTTP vers HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name 31.97.199.106;
    return 301 https://$server_name$request_uri;
}

# Configuration HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name 31.97.199.106;
    
    # Certificat auto-signé
    ssl_certificate /etc/nginx/ssl/self-signed.crt;
    ssl_certificate_key /etc/nginx/ssl/self-signed.key;
    
    # Configuration SSL
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

#### Appliquer la configuration
```bash
# Tester la configuration
sudo nginx -t

# Recharger Nginx
sudo systemctl reload nginx
```

#### Accéder au site
```
https://31.97.199.106
```

⚠️ **Vous verrez un avertissement de sécurité** : Cliquez sur "Avancé" puis "Continuer vers le site" (ou équivalent selon votre navigateur).

---

### Option 2 : Utiliser nip.io (domaine gratuit)

[nip.io](https://nip.io) est un service gratuit qui fournit des noms de domaine dynamiques pointant vers des IPs.

#### Utilisation
Votre IP `31.97.199.106` devient : `31.97.199.106.nip.io`

Ensuite, vous pouvez utiliser Let's Encrypt normalement :
```bash
sudo certbot --nginx -d 31.97.199.106.nip.io
```

⚠️ **Limitation** : Le nom de domaine sera visible dans les certificats SSL, ce qui peut ne pas être idéal pour la production.

---

### Option 3 : Restez en HTTP (simple)

Pour un usage interne ou non critique, HTTP peut suffire si :
- Vous êtes sur un réseau privé/VPN
- Les données sensibles sont déjà chiffrées (JWT, mots de passe hashés)
- Vous n'avez pas besoin de la validation visuelle HTTPS

---

## Recommandation

- **Pour un environnement de test/développement** : Utilisez un certificat auto-signé (Option 1)
- **Pour un usage temporaire** : Utilisez nip.io (Option 2)
- **Pour la production** : Obtenez un vrai domaine (même gratuit comme .tk, .ml, .ga) et utilisez Let's Encrypt

---

## Domaine gratuit

Si vous voulez un domaine gratuit pour avoir HTTPS valide :
- **Freenom** : .tk, .ml, .ga, .cf (gratuits)
- **No-IP** : Sous-domaines gratuits
- **DuckDNS** : Sous-domaines gratuits

Puis utilisez Let's Encrypt normalement.

