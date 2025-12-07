<?php

namespace App\Service;

/**
 * Service pour gérer les prix et configurations des différents types de drogues
 */
class DroguePricingService
{
    private const DROGUES_CONFIG = [
        'cocaine' => [
            'nom' => 'Cocaïne',
            'prixAchatUnitaire' => 625.00, // Prix d'achat par pochon
            'prixVenteMin' => 825.00,
            'prixVenteMax' => 850.00,
            'prixVenteMoyen' => 837.50, // (825 + 850) / 2
            'unite' => 'pochon',
            'achatParUnite' => true, // On achète directement des pochons
        ],
        'nebula' => [
            'nom' => 'Nébula',
            'prixAchatPot' => 500.00, // Prix d'achat par pot (référence)
            'nbPochonsParPot' => 10, // Nombre de pochons dans un pot
            'prixAchatUnitaire' => 320.00, // Prix d'achat d'un pochon individuel
            'prixVenteUnitaire' => 460.00, // Prix de vente par pochon
            'unite' => 'pochon',
            'achatParUnite' => false, // On achète des pots
        ],
        'iron_mint' => [
            'nom' => 'Iron Mint',
            'prixAchatPot' => 2200.00, // Prix d'achat par pot (référence)
            'nbPochonsParPot' => 10,
            'prixAchatUnitaire' => 350.00, // Prix d'achat d'un pochon individuel
            'prixVenteUnitaire' => 525.00,
            'unite' => 'pochon',
            'achatParUnite' => false,
        ],
        'violet_storm' => [
            'nom' => 'Violet Storm',
            'prixAchatPot' => 2700.00, // Prix d'achat par pot (référence)
            'nbPochonsParPot' => 10,
            'prixAchatUnitaire' => 380.00, // Prix d'achat d'un pochon individuel
            'prixVenteUnitaire' => 590.00,
            'unite' => 'pochon',
            'achatParUnite' => false,
        ],
        'meth' => [
            'nom' => 'Meth',
            'prixAchatUnitaire' => 500.00,
            'prixVenteUnitaire' => 720.00,
            'unite' => 'unité',
            'achatParUnite' => true,
        ],
    ];

    /**
     * Récupère la configuration d'un type de drogue
     */
    public function getConfig(string $typeDrogue): ?array
    {
        return self::DROGUES_CONFIG[$typeDrogue] ?? null;
    }

    /**
     * Récupère tous les types de drogues disponibles
     */
    public function getAllTypes(): array
    {
        return array_keys(self::DROGUES_CONFIG);
    }

    /**
     * Récupère tous les types de drogues avec leurs noms
     */
    public function getAllTypesWithNames(): array
    {
        $result = [];
        foreach (self::DROGUES_CONFIG as $type => $config) {
            $result[$type] = $config['nom'];
        }
        return $result;
    }

    /**
     * Calcule le coût d'achat total et le nombre d'unités vendues
     * basé sur la recette totale et le type de drogue
     */
    public function calculateCosts(string $typeDrogue, float $montantVenteTotal): array
    {
        $config = $this->getConfig($typeDrogue);
        if (!$config) {
            throw new \InvalidArgumentException("Type de drogue inconnu: {$typeDrogue}");
        }

        $prixVenteUnitaire = $config['prixVenteUnitaire'] ?? $config['prixVenteMoyen'] ?? 0;
        
        if ($prixVenteUnitaire <= 0) {
            throw new \InvalidArgumentException("Prix de vente unitaire invalide pour {$typeDrogue}");
        }

        // Calculer le nombre d'unités vendues
        $nbUnites = $montantVenteTotal / $prixVenteUnitaire;
        
        // Calculer le coût d'achat total
        $coutAchatTotal = $nbUnites * $config['prixAchatUnitaire'];

        return [
            'nbUnites' => $nbUnites,
            'coutAchatTotal' => $coutAchatTotal,
            'prixAchatUnitaire' => $config['prixAchatUnitaire'],
            'prixVenteUnitaire' => $prixVenteUnitaire,
        ];
    }
}

