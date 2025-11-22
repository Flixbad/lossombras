#!/bin/bash

set -e

echo "🔧 Application de la configuration Nginx"
echo "══════════════════════════════════════════════════════════════"
echo ""

cd /var/www/lossombras || exit

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 1. Vérifier la version PHP
PHP_VERSION=$(php -r "echo PHP_MAJOR_VERSION.'.'.PHP_MINOR_VERSION;" 2>/dev/null || echo "8.4")
echo -e "${BLUE}📝 Version PHP détectée : $PHP_VERSION${NC}"

# 2. Vérifier le socket PHP-FPM
PHP_FPM_SOCKET="/var/run/php/php${PHP_VERSION}-fpm.sock"
if [ ! -S "$PHP_FPM_SOCKET" ]; then
    echo -e "${YELLOW}⚠️  Socket PHP-FPM non trouvé : $PHP_FPM_SOCKET${NC}"
    echo "   Vérification des sockets disponibles..."
    ls -la /var/run/php/ 2>/dev/null || echo "   Aucun socket trouvé"
    
    # Essayer de trouver un socket
    SOCKETS=$(ls -1 /var/run/php/*.sock 2>/dev/null | head -1)
    if [ -n "$SOCKETS" ]; then
        PHP_FPM_SOCKET="$SOCKETS"
        echo -e "${GREEN}✅ Socket trouvé : $PHP_FPM_SOCKET${NC}"
    else
        echo -e "${RED}❌ Aucun socket PHP-FPM trouvé${NC}"
        echo "   Démarrez PHP-FPM : sudo systemctl start php${PHP_VERSION}-fpm"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Socket trouvé : $PHP_FPM_SOCKET${NC}"
fi

# 3. Récupérer l'IP du serveur ou demander
SERVER_IP=$(hostname -I | awk '{print $1}')
if [ -z "$SERVER_IP" ]; then
    read -p "📝 Entrez votre IP ou domaine (ex: 31.97.199.106) : " SERVER_IP
fi

if [ -z "$SERVER_IP" ]; then
    SERVER_IP="31.97.199.106"
fi

echo -e "${BLUE}📝 Configuration :${NC}"
echo "   IP/Domaine : $SERVER_IP"
echo "   Socket PHP-FPM : $PHP_FPM_SOCKET"
echo ""

# 4. Créer la configuration Nginx complète
echo -e "${BLUE}📝 Création de la configuration Nginx...${NC}"
sudo tee /etc/nginx/sites-available/lossombras > /dev/null << EOF
# Configuration Nginx pour Los Sombras
# Générée le $(date)

server {
    listen 80;
    listen [::]:80;
    server_name ${SERVER_IP};
    
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
        # Gérer les requêtes OPTIONS pour CORS
        if (\$request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
            add_header 'Access-Control-Max-Age' 3600 always;
            add_header 'Content-Length' 0;
            add_header 'Content-Type' 'text/plain';
            return 204;
        }
        
        # Router vers PHP-FPM pour Symfony
        fastcgi_pass unix:${PHP_FPM_SOCKET};
        
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME /var/www/lossombras/backend/public/index.php;
        fastcgi_param DOCUMENT_ROOT /var/www/lossombras/backend/public;
        fastcgi_param REQUEST_URI \$request_uri;
        fastcgi_param PATH_INFO \$uri;
        fastcgi_param HTTPS \$https if_not_empty;
        
        # Timeout
        fastcgi_read_timeout 300;
        fastcgi_buffers 16 16k;
        fastcgi_buffer_size 32k;
        
        # Headers CORS
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
    }
    
    # PHP pour les autres requêtes Symfony (si nécessaire)
    location ~ ^/backend(/.*)\.php\$ {
        fastcgi_pass unix:${PHP_FPM_SOCKET};
        fastcgi_split_path_info ^(.+\.php)(/.*)\$;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME /var/www/lossombras/backend/public\$1.php;
        fastcgi_param DOCUMENT_ROOT /var/www/lossombras/backend/public;
        fastcgi_param PATH_INFO \$2;
        fastcgi_param HTTPS \$https if_not_empty;
    }
    
    # Frontend Angular - Routes (DOIT être après /api)
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # Ignorer silencieusement les icônes manquantes
    location ~ ^/(favicon\.ico|apple-touch-icon.*\.png|icons/.*|android-chrome.*\.png|site\.webmanifest|browserconfig\.xml|robots\.txt)\$ {
        access_log off;
        log_not_found off;
        expires 24h;
        return 204;
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
    echo -e "${GREEN}✅ Configuration créée${NC}"
    echo ""
    
    # 5. Créer le lien symbolique
    echo -e "${BLUE}📝 Création du lien symbolique...${NC}"
    sudo ln -sf /etc/nginx/sites-available/lossombras /etc/nginx/sites-enabled/lossombras
    echo -e "${GREEN}✅ Lien symbolique créé${NC}"
    echo ""
    
    # 6. Tester la configuration
    echo -e "${BLUE}📝 Test de la configuration Nginx...${NC}"
    if sudo nginx -t 2>&1; then
        echo -e "${GREEN}✅ Configuration valide !${NC}"
        echo ""
        
        # 7. Recharger Nginx
        echo -e "${BLUE}🔄 Rechargement de Nginx...${NC}"
        if sudo systemctl reload nginx; then
            echo -e "${GREEN}✅ Nginx rechargé !${NC}"
        else
            echo -e "${RED}❌ Erreur lors du rechargement${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ Erreur dans la configuration !${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Erreur lors de la création du fichier${NC}"
    exit 1
fi

echo ""
echo "══════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ Configuration Nginx appliquée avec succès !${NC}"
echo "══════════════════════════════════════════════════════════════"
echo ""
echo "🧪 Test de l'API :"
echo "   curl http://${SERVER_IP}/api/login"
echo ""

