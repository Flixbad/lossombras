#!/bin/bash

set -e

echo "🔒 Installation HTTPS avec Let's Encrypt pour ultimateboxingleague.fr"
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

echo -e "${BLUE}📝 Domaine configuré :${NC}"
echo "   - $DOMAIN"
echo "   - $DOMAIN_WWW"
echo ""
echo -e "${YELLOW}⚠️  Assurez-vous que le domaine pointe vers cette IP${NC}"
read -p "📝 Le domaine pointe-t-il vers cette IP ? [O/n] : " CONFIRM
CONFIRM=${CONFIRM:-O}

if [[ ! "$CONFIRM" =~ ^[oO]$ ]] && [ -n "$CONFIRM" ]; then
    echo -e "${YELLOW}⚠️  Configurez d'abord les DNS de votre domaine avant de continuer${NC}"
    exit 0
fi

# 1. Installation de Certbot
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

# 2. Vérifier que Nginx est configuré
echo -e "${BLUE}📝 2/5 - Vérification de la configuration Nginx...${NC}"
NGINX_CONFIG="/etc/nginx/sites-available/lossombras"
if [ ! -f "$NGINX_CONFIG" ]; then
    echo -e "${RED}❌ Configuration Nginx non trouvée : $NGINX_CONFIG${NC}"
    echo "   Configurez d'abord Nginx avant d'installer SSL"
    exit 1
fi
echo -e "${GREEN}✅ Configuration Nginx trouvée${NC}"
echo ""

# 3. Mettre à jour le server_name dans Nginx
echo -e "${BLUE}📝 3/5 - Mise à jour du server_name dans Nginx...${NC}"
# Créer une sauvegarde
cp "$NGINX_CONFIG" "$NGINX_CONFIG.backup.$(date +%Y%m%d_%H%M%S)"
echo -e "${GREEN}✅ Sauvegarde créée${NC}"

# Mettre à jour le server_name
sed -i "s/server_name.*/server_name $DOMAIN $DOMAIN_WWW;/" "$NGINX_CONFIG"
echo -e "${GREEN}✅ server_name mis à jour${NC}"
echo ""

# 4. Obtenir le certificat SSL avec Certbot
echo -e "${BLUE}📝 4/5 - Obtention du certificat SSL avec Let's Encrypt...${NC}"
echo -e "${YELLOW}⚠️  Le port 80 doit être ouvert pour la validation${NC}"
echo ""

# Demander l'email pour Let's Encrypt
read -p "📝 Entrez votre email pour les notifications Let's Encrypt : " EMAIL
if [ -z "$EMAIL" ]; then
    EMAIL="admin@$DOMAIN"
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
else
    echo -e "${RED}❌ Erreur lors de l'obtention du certificat${NC}"
    echo "   Vérifiez :"
    echo "   - Que le domaine $DOMAIN pointe vers cette IP"
    echo "   - Que le port 80 est ouvert"
    echo "   - Que Nginx fonctionne correctement"
    exit 1
fi
echo ""

# 5. Vérifier la configuration
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

# 6. Tester le renouvellement
echo -e "${BLUE}📝 Test du renouvellement automatique...${NC}"
certbot renew --dry-run
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

