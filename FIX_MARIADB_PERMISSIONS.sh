#!/bin/bash
# Script pour corriger les problèmes de permissions et démarrage de MariaDB

echo "🔧 Correction des problèmes MariaDB"
echo ""

# Arrêter complètement
echo "🛑 Arrêt de tous les processus MySQL..."
sudo systemctl stop mariadb 2>/dev/null || true
sudo systemctl stop mysql 2>/dev/null || true
sudo pkill -9 mysqld 2>/dev/null || true
sudo pkill -9 mysqld_safe 2>/dev/null || true
sleep 2

# Vérifier et créer le répertoire de socket
echo "📁 Vérification du répertoire socket..."
if [ ! -d /var/run/mysqld ]; then
    echo "   Création de /var/run/mysqld..."
    sudo mkdir -p /var/run/mysqld
fi
sudo chown mysql:mysql /var/run/mysqld 2>/dev/null || sudo chown mysql:mysql /var/run/mysqld 2>/dev/null || true

# Supprimer les fichiers de lock
echo "🔓 Suppression des fichiers de lock..."
sudo rm -f /var/lib/mysql/mysql.sock.lock 2>/dev/null || true
sudo rm -f /var/run/mysqld/mysqld.sock.lock 2>/dev/null || true
sudo rm -f /var/run/mysqld/mysqld.sock 2>/dev/null || true

# Corriger les permissions
echo "🔐 Correction des permissions..."
if [ -d /var/lib/mysql ]; then
    sudo chown -R mysql:mysql /var/lib/mysql/
    sudo chmod 700 /var/lib/mysql/
    echo "✅ Permissions corrigées pour /var/lib/mysql/"
else
    echo "⚠️  Le répertoire /var/lib/mysql n'existe pas"
fi

# Vérifier les logs
if [ -d /var/log/mysql ]; then
    sudo chown -R mysql:mysql /var/log/mysql/ 2>/dev/null || true
fi

echo ""
echo "🚀 Démarrage de MariaDB..."
if sudo systemctl start mariadb; then
    sleep 2
    if sudo systemctl is-active --quiet mariadb; then
        echo "✅ MariaDB a démarré avec succès !"
        echo ""
        echo "📋 Test de connexion..."
        if sudo mysql -e "SELECT 1;" 2>/dev/null; then
            echo "✅ Connexion réussie !"
            echo ""
            echo "💡 Vous pouvez maintenant vous connecter avec : sudo mysql"
        else
            echo "⚠️  MariaDB est démarré mais la connexion a échoué"
        fi
    else
        echo "❌ MariaDB n'a pas démarré"
        echo ""
        echo "📋 Voir les détails avec :"
        echo "   sudo systemctl status mariadb"
        echo "   sudo journalctl -xeu mariadb.service --no-pager | tail -50"
    fi
else
    echo "❌ Échec du démarrage"
    echo ""
    echo "📋 Voir les détails avec :"
    echo "   sudo systemctl status mariadb"
    echo "   sudo journalctl -xeu mariadb.service --no-pager | tail -50"
fi

