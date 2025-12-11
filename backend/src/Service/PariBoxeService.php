<?php

namespace App\Service;

use App\Entity\PariBoxe;
use App\Repository\PariBoxeRepository;

class PariBoxeService
{
    private const COMMISSION_ORGANISATEUR = 0.25; // 25% que l'organisateur prend sur le total de toutes les mises

    public function __construct(
        private PariBoxeRepository $pariBoxeRepository
    ) {}

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
        $montantTotalToutesMises = 0;
        
        // Séparer les paris gagnants et perdants
        foreach ($paris as $pari) {
            if ($pari->getStatut() !== 'en_attente') {
                continue; // Ignorer les paris déjà résolus
            }
            
            $mise = (float) $pari->getMontantMise();
            $montantTotalToutesMises += $mise;
            
            if ($pari->getCombatantParie() === $combatantGagnant) {
                $parisGagnants[] = $pari;
                $montantTotalGagnants += $mise;
            } else {
                $parisPerdants[] = $pari;
                $montantTotalPerdants += $mise;
            }
        }
        
        // L'organisateur prend 25% sur le montant total de TOUTES les mises (pas seulement les perdants)
        $commissionTotaleOrganisateur = $montantTotalToutesMises * self::COMMISSION_ORGANISATEUR;
        // Le montant distribué aux gagnants = mises des perdants - commission (25% du total)
        $montantDistribuable = $montantTotalPerdants - $commissionTotaleOrganisateur;
        
        // Si la commission dépasse les mises des perdants, ajuster
        if ($montantDistribuable < 0) {
            $montantDistribuable = 0;
        }
        
        $totalCommission = 0;
        $totalGainsDistribues = 0;
        
        // Traiter les paris perdants : ils perdent leur mise
        foreach ($parisPerdants as $pari) {
            $pari->setStatut('perdu');
            $pari->setGainCalcule('0.00');
            $pari->setCommissionOrganisateur('0.00');
        }
        
        // Traiter les paris gagnants : ils récupèrent leur mise + leur part des gains
        if ($montantTotalPerdants > 0 && count($parisGagnants) > 0) {
            // Répartir le montant distribuable entre les gagnants proportionnellement à leur mise
            foreach ($parisGagnants as $pari) {
                $mise = (float) $pari->getMontantMise();
                
                // Proportion de la mise du pari dans le total des gagnants
                $proportion = $montantTotalGagnants > 0 ? $mise / $montantTotalGagnants : 0;
                
                // Part du gagnant dans le montant distribuable
                $partGains = $montantDistribuable * $proportion;
                
                // Le groupe récupère sa mise + sa part des gains
                $gainTotal = $mise + $partGains;
                
                // Commission individuelle (pour affichage, proportionnelle)
                $commissionIndividuelle = ($montantTotalToutesMises * $proportion) * self::COMMISSION_ORGANISATEUR;
                
                $pari->setStatut('gagne');
                $pari->setGainCalcule(number_format($gainTotal, 2, '.', ''));
                $pari->setCommissionOrganisateur(number_format($commissionIndividuelle, 2, '.', ''));
                
                $totalGainsDistribues += $gainTotal;
            }
            
            // La commission totale (25% de toutes les mises)
            $totalCommission = $commissionTotaleOrganisateur;
        } elseif (count($parisGagnants) > 0 && $montantTotalPerdants === 0) {
            // Si pas de perdants, les gagnants récupèrent leur mise, mais commission quand même sur le total
            $commissionTotaleOrganisateur = $montantTotalToutesMises * self::COMMISSION_ORGANISATEUR;
            foreach ($parisGagnants as $pari) {
                $mise = (float) $pari->getMontantMise();
                $proportion = $montantTotalGagnants > 0 ? $mise / $montantTotalGagnants : 0;
                $commissionIndividuelle = $montantTotalToutesMises * $proportion * self::COMMISSION_ORGANISATEUR;
                
                // Gain = mise - commission proportionnelle
                $gainTotal = $mise - $commissionIndividuelle;
                
                $pari->setStatut('gagne');
                $pari->setGainCalcule(number_format(max(0, $gainTotal), 2, '.', ''));
                $pari->setCommissionOrganisateur(number_format($commissionIndividuelle, 2, '.', ''));
            }
            $totalCommission = $commissionTotaleOrganisateur;
        }
        
        return [
            'combatId' => $combatId,
            'combatantGagnant' => $combatantGagnant,
            'nbParisGagnants' => count($parisGagnants),
            'nbParisPerdants' => count($parisPerdants),
            'montantTotalGagnants' => $montantTotalGagnants,
            'montantTotalPerdants' => $montantTotalPerdants,
            'montantTotalToutesMises' => $montantTotalToutesMises,
            'totalCommission' => $totalCommission,
            'totalGainsDistribues' => $totalGainsDistribues,
        ];
    }
}
