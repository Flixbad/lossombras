<?php

namespace App\Service;

use App\Entity\PariBoxe;
use App\Repository\PariBoxeRepository;

class PariBoxeService
{
    private const COMMISSION_GAGNANT = 0.15; // 15% si le groupe gagne
    private const COMMISSION_PERDANT = 0.25; // 25% si le groupe perd

    public function __construct(
        private PariBoxeRepository $pariBoxeRepository
    ) {}

    /**
     * Calcule les gains pour un pari gagnant
     * Règle : Le groupe récupère sa mise + les gains (montant total des perdants - 15% de commission)
     */
    public function calculerGainGagnant(PariBoxe $pari, float $montantTotalPerdants): float
    {
        $mise = (float) $pari->getMontantMise();
        $commission = $montantTotalPerdants * self::COMMISSION_GAGNANT;
        $gain = $montantTotalPerdants - $commission;
        
        // Le groupe récupère sa mise + le gain net
        return $mise + $gain;
    }

    /**
     * Calcule la commission de l'organisateur pour un pari gagnant
     */
    public function calculerCommissionGagnant(float $montantTotalPerdants): float
    {
        return $montantTotalPerdants * self::COMMISSION_GAGNANT;
    }

    /**
     * Calcule la commission de l'organisateur pour un pari perdant
     */
    public function calculerCommissionPerdant(PariBoxe $pari): float
    {
        $mise = (float) $pari->getMontantMise();
        return $mise * self::COMMISSION_PERDANT;
    }

    /**
     * Résout un combat en déterminant les gagnants et perdants
     * @param string $combatId L'ID du combat
     * @param string $combatantGagnant Le nom du combatant/groupe gagnant
     * @return array Retourne les statistiques du combat résolu
     */
    public function resoudreCombat(string $combatId, string $combatantGagnant): array
    {
        $paris = $this->pariBoxeRepository->findByCombatId($combatId);
        
        $parisGagnants = [];
        $parisPerdants = [];
        $montantTotalGagnants = 0;
        $montantTotalPerdants = 0;
        
        // Séparer les paris gagnants et perdants
        foreach ($paris as $pari) {
            if ($pari->getStatut() !== 'en_attente') {
                continue; // Ignorer les paris déjà résolus
            }
            
            if ($pari->getCombatantParie() === $combatantGagnant) {
                $parisGagnants[] = $pari;
                $montantTotalGagnants += (float) $pari->getMontantMise();
            } else {
                $parisPerdants[] = $pari;
                $montantTotalPerdants += (float) $pari->getMontantMise();
            }
        }
        
        $totalCommission = 0;
        $totalGainsDistribues = 0;
        
        // Traiter les paris perdants : calculer commission 25%
        foreach ($parisPerdants as $pari) {
            $commission = $this->calculerCommissionPerdant($pari);
            $pari->setStatut('perdu');
            $pari->setCommissionOrganisateur(number_format($commission, 2, '.', ''));
            $pari->setGainCalcule('0.00');
            $totalCommission += $commission;
        }
        
        // Traiter les paris gagnants : calculer gains avec commission 15%
        if ($montantTotalPerdants > 0 && count($parisGagnants) > 0) {
            // Répartir les gains entre les gagnants proportionnellement à leur mise
            foreach ($parisGagnants as $pari) {
                $mise = (float) $pari->getMontantMise();
                
                // Proportion de la mise du pari dans le total des gagnants
                $proportion = $montantTotalGagnants > 0 ? $mise / $montantTotalGagnants : 0;
                
                // Gain proportionnel (montant total perdants * proportion - commission)
                $montantPerdantsProportionnel = $montantTotalPerdants * $proportion;
                $commission = $montantPerdantsProportionnel * self::COMMISSION_GAGNANT;
                $gainNet = $montantPerdantsProportionnel - $commission;
                
                // Le groupe récupère sa mise + le gain net
                $gainTotal = $mise + $gainNet;
                
                $pari->setStatut('gagne');
                $pari->setGainCalcule(number_format($gainTotal, 2, '.', ''));
                $pari->setCommissionOrganisateur(number_format($commission, 2, '.', ''));
                
                $totalCommission += $commission;
                $totalGainsDistribues += $gainTotal;
            }
        } elseif (count($parisGagnants) > 0 && $montantTotalPerdants === 0) {
            // Si pas de perdants, les gagnants récupèrent juste leur mise
            foreach ($parisGagnants as $pari) {
                $pari->setStatut('gagne');
                $pari->setGainCalcule($pari->getMontantMise());
                $pari->setCommissionOrganisateur('0.00');
            }
        }
        
        return [
            'combatId' => $combatId,
            'combatantGagnant' => $combatantGagnant,
            'nbParisGagnants' => count($parisGagnants),
            'nbParisPerdants' => count($parisPerdants),
            'montantTotalGagnants' => $montantTotalGagnants,
            'montantTotalPerdants' => $montantTotalPerdants,
            'totalCommission' => $totalCommission,
            'totalGainsDistribues' => $totalGainsDistribues,
        ];
    }
}

