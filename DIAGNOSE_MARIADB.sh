#!/bin/bash
# Script de diagnostic pour MariaDB qui ne démarre pas

echo "🔍 Diagnostic de MariaDB"
echo ""

# Vérifier si MariaDB est installé
if ! command -v mysqld &> /dev/null && ! command -v mariadbd &> /dev/null; then
    echo "❌ MariaDB/MySQL n'est pas installé"
    exit 1
fi

echo "✅ MariaDB/MySQL est installé"
echo ""

# Afficher le statut du service
echo "📋 Statut du service :"
sudo systemctl status mariadb.service --no-pager -l | head -20
echo ""

# Afficher les dernières erreurs
echo "📋 Dernières erreurs du journal :"
sudo journalctl -xeu mariadb.service --no-pager | tail -30
echo ""

# Vérifier les logs d'erreur
if [ -f /var/log/mysql/error.log ]; then
    echo "📋 Dernières erreurs du fichier de log :"
    sudo tail -30 /var/log/mysql/error.log
    echo ""
fi

# Vérifier les permissions
echo "📋 Vérification des permissions :"
if [ -d /var/lib/mysql ]; then
    echo "Propriétaire de /var/lib/mysql :"
    ls -ld /var/lib/mysql | awk '{print $3, $4}'
    echo ""
fi

# Vérifier les processus MySQL qui traînent
echo "📋 Processus MySQL en cours :"
ps aux | grep -E "mysql|mariadb" | grep -v grep || echo "Aucun processus MySQL trouvé"
echo ""

# Vérifier le socket
echo "📋 Vérification du socket :"
if [ -d /var/run/mysqld ]; then
    ls -la /var/run/mysqld/ 2>/dev/null || echo "Le répertoire /var/run/mysqld n'existe pas ou n'est pas accessible"
else
    echo "⚠️  Le répertoire /var/run/mysqld n'existe pas"
fi
echo ""

# Suggestions
echo "💡 Suggestions :"
echo ""
echo "1. Si vous voyez des erreurs de permissions, exécutez :"
echo "   sudo chown -R mysql:mysql /var/lib/mysql/"
echo "   sudo chmod 700 /var/lib/mysql/"
echo ""
echo "2. Si vous voyez des erreurs de socket, exécutez :"
echo "   sudo mkdir -p /var/run/mysqld"
echo "   sudo chown mysql:mysql /var/run/mysqld"
echo ""
echo "3. Si un processus MySQL traîne, exécutez :"
echo "   sudo pkill -9 mysqld"
echo "   sudo pkill -9 mysqld_safe"
echo ""
echo "4. Ensuite, essayez de redémarrer :"
echo "   sudo systemctl start mariadb"

