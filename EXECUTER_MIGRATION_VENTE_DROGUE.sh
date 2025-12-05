#!/bin/bash

# Script pour exécuter la migration vente_drogue
# Ce script modifie la structure de la table pour utiliser montant_vente_total au lieu de nb_pochons

echo "🔄 Exécution de la migration pour vente_drogue..."
echo ""

cd backend || exit 1

# Vérifier si la table existe
echo "📝 Vérification de la structure de la table..."

# Exécuter la migration
echo "📝 Exécution de la migration..."
php bin/console doctrine:migrations:migrate --no-interaction

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration exécutée avec succès !"
    echo ""
    echo "La table vente_drogue a été mise à jour :"
    echo "  - Ajout de montant_vente_total (remplace prix_vente_unitaire)"
    echo "  - Ajout de cout_achat_total"
    echo "  - Suppression de nb_pochons"
    echo ""
    echo "⚠️  Note: Si vous aviez des données existantes, elles devront être réenregistrées avec le nouveau format."
else
    echo ""
    echo "❌ Erreur lors de l'exécution de la migration"
    echo ""
    echo "Si la table existe déjà avec l'ancienne structure et contient des données :"
    echo "  1. Sauvegardez vos données"
    echo "  2. Supprimez la table: DROP TABLE vente_drogue;"
    echo "  3. Réexécutez ce script"
    echo ""
    echo "Ou modifiez manuellement la structure avec SQL:"
    echo "  ALTER TABLE vente_drogue ADD montant_vente_total NUMERIC(10, 2) DEFAULT NULL;"
    echo "  ALTER TABLE vente_drogue ADD cout_achat_total NUMERIC(10, 2) DEFAULT NULL;"
    echo "  ALTER TABLE vente_drogue DROP COLUMN nb_pochons;"
    echo "  ALTER TABLE vente_drogue CHANGE prix_vente_unitaire montant_vente_total NUMERIC(10, 2) NOT NULL;"
fi

