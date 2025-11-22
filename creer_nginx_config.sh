#!/bin/bash

echo "🔧 Création de la configuration Nginx"
echo "══════════════════════════════════════════════════════════════"
echo ""

# Demander le domaine ou IP
read -p "📝 Entrez votre domaine ou IP (ex: 31.97.199.106 ou exemple.com) : " SERVER_NAME
if [ -z "$SERVER_NAME" ]; then
    echo "❌ Erreur : Le domaine/IP ne peut pas être vide"
    exit 1
fi

# Vérifier la version PHP
PHP_VERSION=$(php -r "echo PHP_MAJOR_VERSION.'.'.PHP_MINOR_VERSION;" 2>/dev/null || echo "8.2")
echo "📝 Version PHP détectée : $PHP_VERSION"

# Vérifier le socket PHP-FPM
PHP_FPM_SOCKET="/var/run/php/php${PHP_VERSION}-fpm.sock"
if [ ! -S "$PHP_FPM_SOCKET" ]; then
    echo "⚠️  Socket PHP-FPM non trouvé : $PHP_FPM_SOCKET"
    echo "📝 Vérification des sockets disponibles..."
    ls -la /var/run/php/ 2>/dev/null || echo "   Aucun socket trouvé"
    read -p "📝 Entrez le chemin du socket PHP-FPM (ex: /var/run/php/php8.2-fpm.sock) : " PHP_FPM_SOCKET
    if [ -z "$PHP_FPM_SOCKET" ]; then
        PHP_FPM_SOCKET="/var/run/php/php${PHP_VERSION}-fpm.sock"
    fi
fi

echo ""
echo "📝 Configuration :"
echo "   Domaine/IP : $SERVER_NAME"
echo "   Socket PHP-FPM : $PHP_FPM_SOCKET"
echo ""

read -p "Continuer ? (o/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Oo]$ ]]; then
    echo "❌ Annulé"
    exit 1
fi

# Créer le fichier de configuration
sudo tee /etc/nginx/sites-available/los-sombras > /dev/null << EOF
# Configuration Nginx pour Los Sombras
# Généré le $(date)

server {
    listen 80;
    listen [::]:80;
    server_name ${SERVER_NAME};
    
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
        try_files \$uri /backend/public/index.php\$is_args\$args;
    }
    
    location ~ ^/api(/.*)\$ {
        fastcgi_pass unix:${PHP_FPM_SOCKET};
        fastcgi_split_path_info ^(.+\.php)(/.*)\$;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME /var/www/lossombras/backend/public/index.php;
        fastcgi_param DOCUMENT_ROOT /var/www/lossombras/backend/public;
        fastcgi_param PATH_INFO \$fastcgi_path_info;
        fastcgi_param REQUEST_URI \$1;
        fastcgi_param HTTPS \$https if_not_empty;
        
        # Timeout
        fastcgi_read_timeout 300;
        fastcgi_buffers 16 16k;
        fastcgi_buffer_size 32k;
    }
    
    # PHP pour les autres requêtes Symfony
    location ~ ^/backend(/.*)\.php\$ {
        fastcgi_pass unix:${PHP_FPM_SOCKET};
        fastcgi_split_path_info ^(.+\.php)(/.*)\$;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME /var/www/lossombras/backend/public\$1.php;
        fastcgi_param DOCUMENT_ROOT /var/www/lossombras/backend/public;
        fastcgi_param PATH_INFO \$2;
    }
    
    # Frontend Angular - Routes
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # Cache pour les assets statiques
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|webp)\$ {
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
    location ~ \.(env|json|lock|md|txt)\$ {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF

if [ $? -eq 0 ]; then
    echo "✅ Fichier de configuration créé : /etc/nginx/sites-available/los-sombras"
    echo ""
    
    # Créer le lien symbolique
    echo "📝 Création du lien symbolique..."
    sudo ln -sf /etc/nginx/sites-available/los-sombras /etc/nginx/sites-enabled/los-sombras
    echo "✅ Lien symbolique créé"
    echo ""
    
    # Tester la configuration
    echo "📝 Test de la configuration Nginx..."
    if sudo nginx -t; then
        echo "✅ Configuration valide !"
        echo ""
        
        read -p "Recharger Nginx maintenant ? (o/N) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Oo]$ ]]; then
            sudo systemctl reload nginx
            echo "✅ Nginx rechargé !"
        else
            echo "⚠️  Pour appliquer les changements, exécutez :"
            echo "   sudo systemctl reload nginx"
        fi
    else
        echo "❌ Erreur dans la configuration !"
        echo "   Vérifiez le fichier : /etc/nginx/sites-available/los-sombras"
        exit 1
    fi
else
    echo "❌ Erreur lors de la création du fichier"
    exit 1
fi

echo ""
echo "══════════════════════════════════════════════════════════════"
echo "✅ Configuration Nginx créée avec succès !"
echo "══════════════════════════════════════════════════════════════"
echo ""
echo "📋 Prochaines étapes :"
echo ""
echo "1️⃣  Vérifier que le frontend est buildé :"
echo "   ls -la /var/www/lossombras/frontend/dist/frontend/browser/"
echo ""
echo "2️⃣  Vérifier que PHP-FPM est actif :"
echo "   sudo systemctl status php${PHP_VERSION}-fpm"
echo ""
echo "3️⃣  Tester l'API :"
echo "   curl http://${SERVER_NAME}/api"
echo ""

