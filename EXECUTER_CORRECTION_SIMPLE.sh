#!/bin/bash

echo "🔧 Correction de la structure de vente_drogue"
echo ""

cd backend || exit 1

echo "Ce script va :"
echo "1. Marquer la migration Version20251205165331 comme exécutée"
echo "2. Modifier la structure de la table vente_drogue"
echo ""

read -p "Voulez-vous continuer ? (o/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[OoYy]$ ]]; then
    echo "Annulé."
    exit 1
fi

echo ""
echo "📝 Exécution des corrections SQL..."
php bin/console dbal:run-sql "$(cat ../CORRIGER_STRUCTURE_VENTE_DROGUE.sql)"

echo ""
echo "✅ Correction terminée !"
echo ""
echo "Maintenant vous pouvez exécuter :"
echo "php bin/console doctrine:migrations:migrate --no-interaction"
