<?php

namespace App\Service;

use App\Entity\PariBoxe;
use App\Repository\PariBoxeRepository;

class PariBoxeService
{
    private const COMMISSION_ORGANISATEUR = 0.15; // 15% que l'organisateur prend sur le pot total

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
        
        // L'organisateur prend 15% sur le montant total des perdants (le pot)
        $commissionTotaleOrganisateur = $montantTotalPerdants * self::COMMISSION_ORGANISATEUR;
        $montantDistribuable = $montantTotalPerdants - $commissionTotaleOrganisateur; // 85% du pot
        
        $totalCommission = 0;
        $totalGainsDistribues = 0;
        
        // Traiter les paris perdants : ils perdent leur mise
        foreach ($parisPerdants as $pari) {
            $pari->setStatut('perdu');
            $pari->setGainCalcule('0.00');
            // La commission pour les perdants est calculée sur leur mise (15% qui vont dans le pot)
            // Mais on ne l'enregistre pas individuellement, c'est calculé sur le total
            $pari->setCommissionOrganisateur('0.00');
        }
        
        // Traiter les paris gagnants : ils récupèrent leur mise + leur part des gains (85% du pot)
        if ($montantTotalPerdants > 0 && count($parisGagnants) > 0) {
            // Répartir les 85% du pot entre les gagnants proportionnellement à leur mise
            foreach ($parisGagnants as $pari) {
                $mise = (float) $pari->getMontantMise();
                
                // Proportion de la mise du pari dans le total des gagnants
                $proportion = $montantTotalGagnants > 0 ? $mise / $montantTotalGagnants : 0;
                
                // Part du gagnant dans les 85% distribuables
                $partGains = $montantDistribuable * $proportion;
                
                // Le groupe récupère sa mise + sa part des gains
                $gainTotal = $mise + $partGains;
                
                // Commission individuelle (pour affichage, proportionnelle à leur part)
                $commissionIndividuelle = ($montantTotalPerdants * $proportion) * self::COMMISSION_ORGANISATEUR;
                
                $pari->setStatut('gagne');
                $pari->setGainCalcule(number_format($gainTotal, 2, '.', ''));
                $pari->setCommissionOrganisateur(number_format($commissionIndividuelle, 2, '.', ''));
                
                $totalGainsDistribues += $gainTotal;
            }
            
            // La commission totale est la même pour tous (15% du pot total)
            $totalCommission = $commissionTotaleOrganisateur;
        } elseif (count($parisGagnants) > 0 && $montantTotalPerdants === 0) {
            // Si pas de perdants, les gagnants récupèrent juste leur mise, pas de commission
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

