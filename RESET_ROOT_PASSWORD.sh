#!/bin/bash
# Script pour réinitialiser le mot de passe root de MariaDB/MySQL

echo "🔐 Réinitialisation du mot de passe root MariaDB/MySQL"
echo ""
echo "⚠️  Ce script va arrêter temporairement MariaDB"
echo ""

read -sp "Nouveau mot de passe pour root : " NEW_PASS
echo ""

if [ -z "$NEW_PASS" ]; then
    echo "❌ Le mot de passe ne peut pas être vide"
    exit 1
fi

read -sp "Confirmez le mot de passe : " CONFIRM_PASS
echo ""

if [ "$NEW_PASS" != "$CONFIRM_PASS" ]; then
    echo "❌ Les mots de passe ne correspondent pas"
    exit 1
fi

echo ""
echo "🛑 Arrêt de MariaDB..."
sudo systemctl stop mariadb || sudo systemctl stop mysql

echo "🚀 Démarrage en mode sécurisé..."
sudo mysqld_safe --skip-grant-tables --skip-networking > /dev/null 2>&1 &
sleep 3

echo "🔧 Réinitialisation du mot de passe..."
mysql -u root <<EOF
USE mysql;
ALTER USER 'root'@'localhost' IDENTIFIED BY '$NEW_PASS';
FLUSH PRIVILEGES;
EXIT;
EOF

echo "🛑 Arrêt du mode sécurisé..."
sudo pkill mysqld
sleep 2

echo "🚀 Redémarrage normal de MariaDB..."
sudo systemctl start mariadb || sudo systemctl start mysql

sleep 2

echo "✅ Test de connexion..."
if mysql -u root -p"$NEW_PASS" -e "SELECT 'Connexion réussie !' AS Status;" 2>/dev/null; then
    echo ""
    echo "✅ Mot de passe root réinitialisé avec succès !"
    echo ""
    echo "📝 Vous pouvez maintenant vous connecter avec :"
    echo "   mysql -u root -p"
    echo "   (Entrez le mot de passe : $NEW_PASS)"
else
    echo ""
    echo "⚠️  La réinitialisation a été effectuée, mais la connexion de test a échoué"
    echo "   Essayez manuellement : mysql -u root -p"
fi

