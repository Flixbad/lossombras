#!/bin/bash

set -e

echo "🔧 Correction de la configuration Nginx et installation HTTPS"
echo "══════════════════════════════════════════════════════════════"
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Vérifier que le script est exécuté en root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Veuillez exécuter ce script en root (sudo)${NC}"
    exit 1
fi

DOMAIN="ultimateboxingleague.fr"
DOMAIN_WWW="www.ultimateboxingleague.fr"
NGINX_CONFIG="/etc/nginx/sites-available/lossombras"
NGINX_ENABLED="/etc/nginx/sites-enabled/lossombras"

echo -e "${BLUE}📝 Domaine configuré :${NC}"
echo "   - $DOMAIN"
echo "   - $DOMAIN_WWW"
echo ""

# 1. Sauvegarder la configuration actuelle
echo -e "${BLUE}📝 1/6 - Sauvegarde de la configuration Nginx...${NC}"
if [ -f "$NGINX_CONFIG" ]; then
    cp "$NGINX_CONFIG" "$NGINX_CONFIG.backup.$(date +%Y%m%d_%H%M%S)"
    echo -e "${GREEN}✅ Configuration sauvegardée${NC}"
else
    echo -e "${YELLOW}⚠️  Configuration Nginx non trouvée, création d'une nouvelle${NC}"
fi
echo ""

# 2. Créer la configuration HTTP propre (pour la validation Let's Encrypt)
echo -e "${BLUE}📝 2/6 - Création de la configuration HTTP propre...${NC}"
cat > "$NGINX_CONFIG" << 'EOF'
# Configuration HTTP (avant SSL) pour ultimateboxingleague.fr
server {
    listen 80;
    listen [::]:80;
    server_name ultimateboxingleague.fr www.ultimateboxingleague.fr;
    
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
        fastcgi_param HTTPS off;
        
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
EOF

# Vérifier la version de PHP
PHP_VERSION=$(php -r "echo PHP_MAJOR_VERSION.'.'.PHP_MINOR_VERSION;" 2>/dev/null || echo "8.4")
PHP_SOCKET="/var/run/php/php${PHP_VERSION}-fpm.sock"

# Vérifier quel socket PHP existe
if [ ! -S "$PHP_SOCKET" ]; then
    SOCKETS=$(ls -1 /var/run/php/*.sock 2>/dev/null | head -1)
    if [ -n "$SOCKETS" ]; then
        PHP_SOCKET="$SOCKETS"
    fi
fi

# Mettre à jour le socket PHP dans la config
sed -i "s|fastcgi_pass unix:/var/run/php/php8.4-fpm.sock;|fastcgi_pass unix:${PHP_SOCKET};|" "$NGINX_CONFIG"

echo -e "${GREEN}✅ Configuration HTTP créée${NC}"
echo ""

# 3. Tester la configuration Nginx
echo -e "${BLUE}📝 3/6 - Test de la configuration Nginx...${NC}"
if nginx -t 2>&1; then
    echo -e "${GREEN}✅ Configuration Nginx valide${NC}"
    systemctl reload nginx
    echo -e "${GREEN}✅ Nginx rechargé${NC}"
else
    echo -e "${RED}❌ Erreur dans la configuration Nginx${NC}"
    exit 1
fi
echo ""

# 4. Installer Certbot si nécessaire
echo -e "${BLUE}📝 4/6 - Vérification de Certbot...${NC}"
if command -v certbot &> /dev/null; then
    echo -e "${GREEN}✅ Certbot déjà installé${NC}"
else
    apt update
    apt install -y certbot python3-certbot-nginx
    echo -e "${GREEN}✅ Certbot installé${NC}"
fi
echo ""

# 5. Obtenir le certificat SSL avec Certbot
echo -e "${BLUE}📝 5/6 - Obtention du certificat SSL avec Let's Encrypt...${NC}"
echo -e "${YELLOW}⚠️  Assurez-vous que ultimateboxingleague.fr pointe vers cette IP${NC}"
echo ""

# Demander l'email
read -p "📝 Entrez votre email pour les notifications Let's Encrypt : " EMAIL
if [ -z "$EMAIL" ]; then
    EMAIL="admin@${DOMAIN}"
    echo -e "${BLUE}   Utilisation de l'email par défaut : $EMAIL${NC}"
fi
echo ""

certbot --nginx -d "$DOMAIN" -d "$DOMAIN_WWW" \
  --non-interactive \
  --agree-tos \
  --email "$EMAIL" \
  --redirect

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Certificat SSL obtenu avec succès !${NC}"
    echo -e "${GREEN}✅ Redirection HTTP vers HTTPS configurée automatiquement !${NC}"
else
    echo -e "${RED}❌ Erreur lors de l'obtention du certificat${NC}"
    echo "   Vérifiez :"
    echo "   - Que ultimateboxingleague.fr pointe vers cette IP"
    echo "   - Que le port 80 est ouvert"
    echo "   - Que Nginx fonctionne correctement"
    exit 1
fi
echo ""

# 6. Vérification finale
echo -e "${BLUE}📝 6/6 - Vérification finale...${NC}"
if nginx -t 2>&1; then
    echo -e "${GREEN}✅ Configuration Nginx valide${NC}"
    systemctl reload nginx
    echo -e "${GREEN}✅ Nginx rechargé${NC}"
else
    echo -e "${RED}❌ Erreur dans la configuration Nginx après Certbot${NC}"
    exit 1
fi
echo ""

# Tester le renouvellement
echo -e "${BLUE}📝 Test du renouvellement automatique...${NC}"
certbot renew --dry-run 2>&1 | head -5
echo ""

echo "══════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ HTTPS configuré avec succès !${NC}"
echo "══════════════════════════════════════════════════════════════"
echo ""
echo "📋 Informations :"
echo "   URL : https://$DOMAIN"
echo "   URL www : https://$DOMAIN_WWW"
echo ""
echo "🧪 Pour tester :"
echo "   curl -I https://$DOMAIN"
echo ""
echo "📖 Le certificat sera renouvelé automatiquement tous les 90 jours"
echo "   Vérifier : sudo certbot renew --dry-run"
echo ""

