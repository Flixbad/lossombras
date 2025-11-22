#!/bin/bash

set -e

echo "🔒 Configuration HTTPS avec certificat auto-signé (sans domaine)"
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

echo -e "${YELLOW}⚠️  IMPORTANT : Les certificats auto-signés afficheront un avertissement de sécurité${NC}"
echo -e "${YELLOW}⚠️  dans les navigateurs. C'est normal et la connexion sera quand même chiffrée.${NC}"
echo ""
read -p "📝 Continuer ? [O/n] : " CONFIRM
CONFIRM=${CONFIRM:-O}

if [[ ! "$CONFIRM" =~ ^[oO]$ ]] && [ -n "$CONFIRM" ]; then
    echo -e "${YELLOW}⚠️  Opération annulée${NC}"
    exit 0
fi

# Demander l'IP
read -p "📝 Entrez votre IP [31.97.199.106] : " SERVER_IP
SERVER_IP=${SERVER_IP:-31.97.199.106}

echo ""

# 1. Créer le répertoire SSL
echo -e "${BLUE}📝 1/5 - Création du répertoire SSL...${NC}"
mkdir -p /etc/nginx/ssl
echo -e "${GREEN}✅ Répertoire créé${NC}"
echo ""

# 2. Générer le certificat auto-signé
echo -e "${BLUE}📝 2/5 - Génération du certificat auto-signé...${NC}"
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/self-signed.key \
  -out /etc/nginx/ssl/self-signed.crt \
  -subj "/C=FR/ST=France/L=Paris/O=Los Sombras/CN=$SERVER_IP" 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Certificat généré${NC}"
else
    echo -e "${RED}❌ Erreur lors de la génération du certificat${NC}"
    exit 1
fi

# Sécuriser les fichiers
chmod 600 /etc/nginx/ssl/self-signed.key
chmod 644 /etc/nginx/ssl/self-signed.crt
echo ""

# 3. Sauvegarder la configuration Nginx actuelle
echo -e "${BLUE}📝 3/5 - Sauvegarde de la configuration Nginx...${NC}"
NGINX_CONFIG="/etc/nginx/sites-available/lossombras"
if [ -f "$NGINX_CONFIG" ]; then
    cp "$NGINX_CONFIG" "$NGINX_CONFIG.backup.$(date +%Y%m%d_%H%M%S)"
    echo -e "${GREEN}✅ Configuration sauvegardée${NC}"
else
    echo -e "${RED}❌ Configuration Nginx non trouvée : $NGINX_CONFIG${NC}"
    exit 1
fi
echo ""

# 4. Créer la nouvelle configuration avec HTTPS
echo -e "${BLUE}📝 4/5 - Configuration de Nginx pour HTTPS...${NC}"
cat > "$NGINX_CONFIG" << EOF
# Redirection HTTP vers HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name $SERVER_IP;
    return 301 https://\$server_name\$request_uri;
}

# Configuration HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $SERVER_IP;
    
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
        if (\$request_method = 'OPTIONS') {
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
        fastcgi_param REQUEST_URI \$request_uri;
        fastcgi_param PATH_INFO \$uri;
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
    
    location ~ \.(env|json|lock|md|txt)\$ {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF

echo -e "${GREEN}✅ Configuration créée${NC}"
echo ""

# 5. Tester et recharger Nginx
echo -e "${BLUE}📝 5/5 - Test et rechargement de Nginx...${NC}"
if nginx -t 2>&1; then
    echo -e "${GREEN}✅ Configuration Nginx valide${NC}"
    systemctl reload nginx
    echo -e "${GREEN}✅ Nginx rechargé${NC}"
else
    echo -e "${RED}❌ Erreur dans la configuration Nginx${NC}"
    echo "   Restauration de la sauvegarde..."
    cp "$NGINX_CONFIG.backup.$(date +%Y%m%d_%H%M%S)" "$NGINX_CONFIG"
    exit 1
fi
echo ""

echo "══════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ HTTPS configuré avec certificat auto-signé !${NC}"
echo "══════════════════════════════════════════════════════════════"
echo ""
echo "📋 Informations :"
echo "   URL HTTPS : https://$SERVER_IP"
echo "   URL HTTP : http://$SERVER_IP (redirigera vers HTTPS)"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT :${NC}"
echo "   - Les navigateurs afficheront un avertissement de sécurité"
echo "   - Cliquez sur 'Avancé' puis 'Continuer vers le site'"
echo "   - La connexion sera quand même chiffrée"
echo ""
echo "🧪 Pour tester :"
echo "   curl -k https://$SERVER_IP"
echo "   # L'option -k ignore l'avertissement pour curl"
echo ""

