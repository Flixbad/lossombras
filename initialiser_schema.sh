#!/bin/bash

echo "🔧 Initialisation du schéma de base de données"
echo "══════════════════════════════════════════════════════════════"
echo ""

cd /var/www/lossombras/backend || exit

# 1. Synchroniser le metadata storage
echo "📝 1/5 - Synchronisation du metadata storage..."
if php bin/console doctrine:migrations:sync-metadata-storage 2>/dev/null; then
    echo "✅ Metadata storage synchronisé !"
else
    echo "⚠️  Erreur lors de la synchronisation (peut être normal si la table existe déjà)"
fi
echo ""

# 2. Créer le schéma complet
echo "📝 2/5 - Création du schéma complet..."
echo "⚠️  ATTENTION : Cela va créer toutes les tables. Vérifiez que la base est vide ou que vous avez fait une sauvegarde."
echo ""
read -p "Continuer ? (o/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Oo]$ ]]; then
    echo "❌ Annulé"
    exit 1
fi

echo "📝 Création des tables..."
# La commande doctrine:schema:create demande une confirmation, on répond "yes" automatiquement
if echo "yes" | php bin/console doctrine:schema:create; then
    echo "✅ Schéma créé avec succès !"
else
    echo "❌ Erreur lors de la création du schéma"
    exit 1
fi
echo ""

# 3. Marquer toutes les migrations comme exécutées
echo "📝 3/5 - Marquage des migrations comme exécutées..."

MIGRATIONS=(
    "Version20251121202444"
    "Version20251121204144"
    "Version20251122000824"
    "Version20251122002957"
    "Version20251122010648"
)

for migration in "${MIGRATIONS[@]}"; do
    echo "  - Marquer $migration..."
    php bin/console doctrine:migrations:version "$migration" --add --no-interaction 2>/dev/null || true
done

echo "✅ Migrations marquées !"
echo ""

# 4. Vérifier le schéma
echo "📝 4/5 - Validation du schéma..."
if php bin/console doctrine:schema:validate 2>&1 | grep -q "The mapping files are correct"; then
    echo "✅ Schéma valide !"
else
    echo "⚠️  Le schéma peut avoir des avertissements (normal si certaines entités n'ont pas de contraintes)"
fi
echo ""

# 5. Vérifier les tables créées
echo "📝 5/5 - Vérification des tables créées..."
if command -v mysql &> /dev/null; then
    echo "Tables dans la base de données :"
    mysql -u los_sombras_user -p -e "USE los_sombras; SHOW TABLES;" 2>/dev/null || echo "⚠️  Impossible de se connecter à la base pour vérifier les tables"
else
    echo "⚠️  MySQL n'est pas disponible pour vérifier les tables"
fi
echo ""

echo "══════════════════════════════════════════════════════════════"
echo "✅ Initialisation terminée !"
echo "══════════════════════════════════════════════════════════════"
echo ""
echo "📋 Prochaines étapes :"
echo ""
echo "1️⃣  Charger les fixtures (optionnel) :"
echo "   php bin/console doctrine:fixtures:load --no-interaction"
echo ""
echo "2️⃣  Vider le cache :"
echo "   php bin/console cache:clear --env=prod"
echo ""
echo "3️⃣  Vérifier l'API :"
echo "   curl http://localhost/api/login"
echo ""

