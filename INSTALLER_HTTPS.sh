#!/bin/bash

set -e

echo "🔒 Installation et configuration HTTPS avec Let's Encrypt"
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

# 1. Demander le domaine
echo -e "${BLUE}📝 Configuration HTTPS${NC}"
echo ""
read -p "📝 Entrez votre domaine (ex: lossombras.com) : " DOMAIN
if [ -z "$DOMAIN" ]; then
    echo -e "${RED}❌ Le domaine est obligatoire${NC}"
    exit 1
fi

read -p "📝 Entrez le domaine avec www (ex: www.lossombras.com) [vide pour ignorer] : " DOMAIN_WWW

# 2. Installation de Certbot
echo ""
echo -e "${BLUE}📝 1/5 - Installation de Certbot...${NC}"
if command -v certbot &> /dev/null; then
    echo -e "${GREEN}✅ Certbot déjà installé${NC}"
else
    apt update
    apt install -y certbot python3-certbot-nginx
    echo -e "${GREEN}✅ Certbot installé${NC}"
fi
echo ""

# 3. Vérifier que Nginx est configuré
echo -e "${BLUE}📝 2/5 - Vérification de la configuration Nginx...${NC}"
NGINX_CONFIG="/etc/nginx/sites-available/lossombras"
if [ ! -f "$NGINX_CONFIG" ]; then
    echo -e "${RED}❌ Configuration Nginx non trouvée : $NGINX_CONFIG${NC}"
    echo "   Configurez d'abord Nginx avant d'installer SSL"
    exit 1
fi
echo -e "${GREEN}✅ Configuration Nginx trouvée${NC}"
echo ""

# 4. Vérifier que le serveur_name est correct
echo -e "${BLUE}📝 3/5 - Mise à jour du serveur_name dans Nginx...${NC}"
# Créer une sauvegarde
cp "$NGINX_CONFIG" "$NGINX_CONFIG.backup.$(date +%Y%m%d_%H%M%S)"
echo -e "${GREEN}✅ Sauvegarde créée${NC}"

# Mettre à jour le server_name
if grep -q "server_name" "$NGINX_CONFIG"; then
    # Remplacer le server_name existant
    sed -i "s/server_name.*/server_name $DOMAIN ${DOMAIN_WWW};/" "$NGINX_CONFIG"
    echo -e "${GREEN}✅ server_name mis à jour${NC}"
else
    echo -e "${YELLOW}⚠️  server_name non trouvé, ajout manuel nécessaire${NC}"
fi
echo ""

# 5. Obtenir le certificat SSL
echo -e "${BLUE}📝 4/5 - Obtention du certificat SSL...${NC}"
echo -e "${YELLOW}⚠️  Assurez-vous que le domaine $DOMAIN pointe vers cette IP${NC}"
echo -e "${YELLOW}⚠️  Le port 80 doit être ouvert${NC}"
read -p "📝 Continuer ? [O/n] : " CONFIRM
CONFIRM=${CONFIRM:-O}

if [[ "$CONFIRM" =~ ^[oO]$ ]] || [ -z "$CONFIRM" ]; then
    if [ -n "$DOMAIN_WWW" ]; then
        certbot --nginx -d "$DOMAIN" -d "$DOMAIN_WWW" --non-interactive --agree-tos --email "admin@$DOMAIN" --redirect
    else
        certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email "admin@$DOMAIN" --redirect
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Certificat SSL obtenu avec succès !${NC}"
    else
        echo -e "${RED}❌ Erreur lors de l'obtention du certificat${NC}"
        echo "   Vérifiez :"
        echo "   - Que le domaine pointe vers cette IP"
        echo "   - Que le port 80 est ouvert"
        echo "   - Que Nginx fonctionne correctement"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  Obtention du certificat annulée${NC}"
    exit 0
fi
echo ""

# 6. Vérifier la configuration
echo -e "${BLUE}📝 5/5 - Vérification de la configuration...${NC}"
if nginx -t 2>&1; then
    echo -e "${GREEN}✅ Configuration Nginx valide${NC}"
    systemctl reload nginx
    echo -e "${GREEN}✅ Nginx rechargé${NC}"
else
    echo -e "${RED}❌ Erreur dans la configuration Nginx${NC}"
    exit 1
fi
echo ""

# 7. Tester le renouvellement
echo -e "${BLUE}📝 Test du renouvellement automatique...${NC}"
certbot renew --dry-run
echo ""

echo "══════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ HTTPS configuré avec succès !${NC}"
echo "══════════════════════════════════════════════════════════════"
echo ""
echo "📋 Informations :"
echo "   Domaine : https://$DOMAIN"
if [ -n "$DOMAIN_WWW" ]; then
    echo "   Domaine www : https://$DOMAIN_WWW"
fi
echo ""
echo "🧪 Pour tester :"
echo "   curl -I https://$DOMAIN"
echo ""
echo "📖 Le certificat sera renouvelé automatiquement tous les 90 jours"
echo ""

