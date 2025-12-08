#!/bin/bash
# Script pour corriger les fichiers verrouillés de MariaDB

echo "🔧 Correction des fichiers verrouillés MariaDB"
echo ""

# Arrêter le service
echo "🛑 Arrêt du service MariaDB..."
sudo systemctl stop mariadb 2>/dev/null || sudo systemctl stop mysql 2>/dev/null || true

# Tuer tous les processus MySQL/MariaDB qui traînent
echo "🔍 Recherche des processus MySQL/MariaDB en cours..."
PROCESSES=$(ps aux | grep -E "[m]ysqld|[m]ariadbd" | awk '{print $2}')
if [ ! -z "$PROCESSES" ]; then
    echo "⚠️  Processus MySQL trouvés, arrêt en cours..."
    echo "$PROCESSES" | xargs -r sudo kill -9 2>/dev/null || true
    sleep 2
    echo "✅ Processus arrêtés"
else
    echo "✅ Aucun processus MySQL trouvé"
fi

# Vérifier une dernière fois et tuer avec pkill si nécessaire
echo "🔍 Vérification finale..."
sudo pkill -9 mysqld 2>/dev/null || true
sudo pkill -9 mariadbd 2>/dev/null || true
sudo pkill -9 mysqld_safe 2>/dev/null || true
sleep 2

# Vérifier qu'il n'y a plus de processus
REMAINING=$(ps aux | grep -E "[m]ysqld|[m]ariadbd" | wc -l)
if [ "$REMAINING" -gt 0 ]; then
    echo "⚠️  Il reste encore des processus, force kill..."
    ps aux | grep -E "[m]ysqld|[m]ariadbd" | grep -v grep | awk '{print $2}' | xargs -r sudo kill -9
    sleep 2
fi

# Supprimer les fichiers de lock
echo "🔓 Suppression des fichiers de lock..."
sudo rm -f /var/lib/mysql/aria_log_control.lock 2>/dev/null || true
sudo rm -f /var/lib/mysql/*.lock 2>/dev/null || true
sudo rm -f /var/lib/mysql/ibdata1.lock 2>/dev/null || true
sudo rm -f /var/lib/mysql/ib_logfile*.lock 2>/dev/null || true
sudo rm -f /var/run/mysqld/*.lock 2>/dev/null || true
sudo rm -f /var/run/mysqld/mysqld.sock 2>/dev/null || true

# Vérifier les fichiers de lock InnoDB
if [ -f /var/lib/mysql/ibdata1 ]; then
    echo "📋 Vérification des fichiers InnoDB..."
    # Utiliser lsof pour voir si des fichiers sont ouverts
    LOCKED_FILES=$(sudo lsof /var/lib/mysql/ibdata1 2>/dev/null | grep -v COMMAND | awk '{print $2}' | sort -u)
    if [ ! -z "$LOCKED_FILES" ]; then
        echo "⚠️  Fichiers InnoDB verrouillés par des processus : $LOCKED_FILES"
        echo "$LOCKED_FILES" | xargs -r sudo kill -9 2>/dev/null || true
        sleep 2
    fi
fi

# Vérifier aria_log_control
if [ -f /var/lib/mysql/aria_log_control ]; then
    LOCKED_ARIA=$(sudo lsof /var/lib/mysql/aria_log_control 2>/dev/null | grep -v COMMAND | awk '{print $2}' | sort -u)
    if [ ! -z "$LOCKED_ARIA" ]; then
        echo "⚠️  Fichier Aria verrouillé par des processus : $LOCKED_ARIA"
        echo "$LOCKED_ARIA" | xargs -r sudo kill -9 2>/dev/null || true
        sleep 2
    fi
fi

# Corriger les permissions
echo "🔐 Correction des permissions..."
sudo chown -R mysql:mysql /var/lib/mysql/ 2>/dev/null || true
sudo chmod 700 /var/lib/mysql/ 2>/dev/null || true

# S'assurer que le répertoire socket existe
sudo mkdir -p /var/run/mysqld
sudo chown mysql:mysql /var/run/mysqld 2>/dev/null || true

# Vérifier une dernière fois qu'il n'y a plus de processus
echo "🔍 Vérification finale des processus..."
sleep 2
if ps aux | grep -E "[m]ysqld|[m]ariadbd" | grep -v grep > /dev/null; then
    echo "❌ Il reste encore des processus MySQL actifs"
    ps aux | grep -E "[m]ysqld|[m]ariadbd" | grep -v grep
    echo "⚠️  Essayez de redémarrer le serveur ou contactez le support"
    exit 1
fi

echo ""
echo "🚀 Démarrage de MariaDB..."
if sudo systemctl start mariadb; then
    sleep 3
    if sudo systemctl is-active --quiet mariadb; then
        echo "✅ MariaDB a démarré avec succès !"
        echo ""
        echo "📋 Test de connexion..."
        if sudo mysql -e "SELECT 'Connexion réussie !' AS Status;" 2>/dev/null; then
            echo "✅ Connexion réussie !"
            echo ""
            echo "💡 Vous pouvez maintenant vous connecter avec : sudo mysql"
        else
            echo "⚠️  MariaDB est démarré mais la connexion de test a échoué"
            echo "   Essayez manuellement : sudo mysql"
        fi
    else
        echo "❌ MariaDB n'a pas démarré"
        echo ""
        echo "📋 Voir les détails :"
        echo "   sudo systemctl status mariadb"
        echo "   sudo journalctl -xeu mariadb.service --no-pager | tail -30"
    fi
else
    echo "❌ Échec du démarrage"
    echo ""
    echo "📋 Voir les détails :"
    echo "   sudo systemctl status mariadb"
fi

