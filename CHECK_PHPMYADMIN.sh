#!/bin/bash
# Script pour vérifier si phpMyAdmin est installé et accessible

echo "🔍 Vérification de phpMyAdmin"
echo ""

# Vérifier si phpMyAdmin est installé
if dpkg -l | grep -q phpmyadmin; then
    echo "✅ phpMyAdmin est installé"
    echo ""
    
    # Vérifier les chemins possibles
    if [ -d "/usr/share/phpmyadmin" ]; then
        echo "📁 Répertoire trouvé : /usr/share/phpmyadmin"
    fi
    
    if [ -d "/var/www/html/phpmyadmin" ] || [ -L "/var/www/html/phpmyadmin" ]; then
        echo "✅ Lien symbolique trouvé : /var/www/html/phpmyadmin"
        echo ""
        echo "🌐 Vous pouvez accéder à phpMyAdmin via :"
        
        # Essayer de détecter le domaine/IP
        if [ -f "/etc/nginx/sites-enabled/default" ] || [ -f "/etc/nginx/sites-enabled/phpmyadmin" ]; then
            DOMAIN=$(grep -r "server_name" /etc/nginx/sites-enabled/ 2>/dev/null | head -1 | awk '{print $2}' | sed 's/;//')
            if [ ! -z "$DOMAIN" ]; then
                echo "   http://${DOMAIN}/phpmyadmin"
            fi
        fi
        
        IP=$(hostname -I | awk '{print $1}')
        echo "   http://${IP}/phpmyadmin"
        echo "   http://localhost/phpmyadmin"
    else
        echo "⚠️  Pas de lien symbolique trouvé"
        echo ""
        echo "📋 Pour créer le lien (nginx) :"
        echo "   sudo ln -s /usr/share/phpmyadmin /var/www/html/phpmyadmin"
        echo "   sudo systemctl reload nginx"
    fi
else
    echo "❌ phpMyAdmin n'est pas installé"
    echo ""
    echo "📋 Pour installer :"
    echo "   sudo apt update"
    echo "   sudo apt install phpmyadmin php-mbstring php-zip php-gd php-json php-curl"
    echo ""
    echo "Pour nginx, créez ensuite le lien :"
    echo "   sudo ln -s /usr/share/phpmyadmin /var/www/html/phpmyadmin"
fi

echo ""
echo "📋 Vérification de PHP mbstring..."
if php -m | grep -q mbstring; then
    echo "✅ Extension mbstring activée"
else
    echo "❌ Extension mbstring manquante"
    echo "   Installez : sudo apt install php-mbstring"
fi

