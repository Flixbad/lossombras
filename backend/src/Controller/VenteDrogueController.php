<?php

namespace App\Controller;

use App\Entity\VenteDrogue;
use App\Entity\Argent;
use App\Repository\VenteDrogueRepository;
use App\Repository\ArgentRepository;
use App\Repository\UserRepository;
use App\Service\DateFormatterService;
use App\Service\DroguePricingService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/vente-drogue')]
class VenteDrogueController extends AbstractController
{
    #[Route('/types', name: 'api_vente_drogue_types', methods: ['GET'])]
    public function getTypes(DroguePricingService $pricingService): JsonResponse
    {
        $types = $pricingService->getAllTypesWithNames();
        $configs = [];
        
        foreach ($types as $type => $nom) {
            $config = $pricingService->getConfig($type);
            if ($config) {
                $configs[$type] = [
                    'nom' => $nom,
                    'unite' => $config['unite'] ?? 'unité',
                    'prixAchatUnitaire' => $config['prixAchatUnitaire'] ?? null,
                    'prixVenteUnitaire' => $config['prixVenteUnitaire'] ?? ($config['prixVenteMoyen'] ?? null),
                ];
            }
        }
        
        return new JsonResponse($configs);
    }

    #[Route('', name: 'api_vente_drogue_list', methods: ['GET'])]
    public function list(
        VenteDrogueRepository $venteRepo,
        DateFormatterService $dateFormatter
    ): JsonResponse {
        $ventes = $venteRepo->findBy([], ['createdAt' => 'DESC']);
        $data = [];

        foreach ($ventes as $vente) {
            $vendeur = $vente->getVendeur();
            $data[] = [
                'id' => $vente->getId(),
                'typeDrogue' => $vente->getTypeDrogue(),
                'vendeur' => $vendeur ? [
                    'id' => $vendeur->getId(),
                    'pseudo' => $vendeur->getPseudo(),
                    'email' => $vendeur->getEmail(),
                ] : null,
                'montantVenteTotal' => $vente->getMontantVenteTotal(),
                'prixAchatUnitaire' => $vente->getPrixAchatUnitaire(),
                'coutAchatTotal' => $vente->getCoutAchatTotal(),
                'nbPochonsApproximatif' => $vente->getNbPochonsApproximatif(),
                'benefice' => $vente->getBenefice(),
                'commission' => $vente->getCommission(),
                'beneficeGroupe' => $vente->getBeneficeGroupe(),
                'commentaire' => $vente->getCommentaire(),
                'createdAt' => $dateFormatter->formatDateTimeISO($vente->getCreatedAt()),
            ];
        }

        return new JsonResponse($data);
    }

    #[Route('/stats', name: 'api_vente_drogue_stats', methods: ['GET'])]
    public function stats(
        VenteDrogueRepository $venteRepo,
        UserRepository $userRepo
    ): JsonResponse {
        $ventes = $venteRepo->findBy([], ['createdAt' => 'DESC']);
        
        // Stats globales
        $totalVentes = count($ventes);
        $totalRecette = array_sum(array_map(fn($v) => (float) $v->getMontantVenteTotal(), $ventes));
        $totalPochonsApproximatif = array_sum(array_map(fn($v) => $v->getNbPochonsApproximatif() ?? 0, $ventes));
        $totalCommissions = array_sum(array_map(fn($v) => (float) $v->getCommission(), $ventes));
        $totalBeneficeGroupe = array_sum(array_map(fn($v) => (float) $v->getBeneficeGroupe(), $ventes));

        // Stats par vendeur
        $statsParVendeur = [];
        $ventesParVendeur = [];

        foreach ($ventes as $vente) {
            $vendeurId = $vente->getVendeur()?->getId();
            if (!$vendeurId) continue;

            if (!isset($ventesParVendeur[$vendeurId])) {
                $ventesParVendeur[$vendeurId] = [
                    'vendeur' => [
                        'id' => $vente->getVendeur()->getId(),
                        'pseudo' => $vente->getVendeur()->getPseudo(),
                        'email' => $vente->getVendeur()->getEmail(),
                    ],
                    'nbVentes' => 0,
                    'totalRecette' => 0,
                    'totalPochonsApproximatif' => 0,
                    'totalCommission' => 0,
                    'totalBeneficeGroupe' => 0,
                ];
            }

            $ventesParVendeur[$vendeurId]['nbVentes']++;
            $ventesParVendeur[$vendeurId]['totalRecette'] += (float) $vente->getMontantVenteTotal();
            $ventesParVendeur[$vendeurId]['totalPochonsApproximatif'] += $vente->getNbPochonsApproximatif() ?? 0;
            $ventesParVendeur[$vendeurId]['totalCommission'] += (float) $vente->getCommission();
            $ventesParVendeur[$vendeurId]['totalBeneficeGroupe'] += (float) $vente->getBeneficeGroupe();
        }

        $statsParVendeur = array_values($ventesParVendeur);
        usort($statsParVendeur, fn($a, $b) => $b['totalCommission'] <=> $a['totalCommission']);

        return new JsonResponse([
            'global' => [
                'totalVentes' => $totalVentes,
                'totalRecette' => (string) round($totalRecette, 2),
                'totalPochonsApproximatif' => round($totalPochonsApproximatif, 2),
                'totalCommissions' => (string) round($totalCommissions, 2),
                'totalBeneficeGroupe' => (string) round($totalBeneficeGroupe, 2),
            ],
            'parVendeur' => $statsParVendeur,
        ]);
    }

    #[Route('', name: 'api_vente_drogue_create', methods: ['POST'])]
    public function create(
        Request $request,
        EntityManagerInterface $em,
        UserRepository $userRepo,
        DateFormatterService $dateFormatter,
        DroguePricingService $pricingService
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        $vendeurId = $data['vendeurId'] ?? null;
        $typeDrogue = $data['typeDrogue'] ?? 'cocaine';
        $montantVenteTotal = $data['montantVenteTotal'] ?? null;
        $commentaire = $data['commentaire'] ?? null;

        if (!$vendeurId) {
            return new JsonResponse(['error' => 'Vendeur requis'], Response::HTTP_BAD_REQUEST);
        }

        if (!$montantVenteTotal || $montantVenteTotal <= 0) {
            return new JsonResponse(['error' => 'Montant de vente total invalide'], Response::HTTP_BAD_REQUEST);
        }

        // Vérifier que le type de drogue est valide
        $config = $pricingService->getConfig($typeDrogue);
        if (!$config) {
            return new JsonResponse(['error' => 'Type de drogue invalide'], Response::HTTP_BAD_REQUEST);
        }

        $vendeur = $userRepo->find($vendeurId);
        if (!$vendeur) {
            return new JsonResponse(['error' => 'Vendeur introuvable'], Response::HTTP_NOT_FOUND);
        }

        // Créer la vente
        $vente = new VenteDrogue();
        $vente->setVendeur($vendeur);
        $vente->setTypeDrogue($typeDrogue);
        $vente->setMontantVenteTotal(number_format((float) $montantVenteTotal, 2, '.', ''));
        $vente->setCommentaire($commentaire);
        
        // Calculer les bénéfices avec le service de pricing
        $vente->calculerBenefices($pricingService);

        try {
            $em->persist($vente);
            $em->flush();
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Erreur lors de l\'enregistrement de la vente',
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        // Créer automatiquement les entrées dans la comptabilité argent :
        // 1. Ajout du bénéfice groupe (revenu)
        $argentBenefice = new Argent();
        $argentBenefice->setType('ajout');
        $argentBenefice->setMontant($vente->getBeneficeGroupe());
        $argentBenefice->setCommentaire(sprintf(
            'Vente drogue - %s$ (Recette: %s$) par %s (Bénéfice groupe)',
            $vente->getBeneficeGroupe(),
            $vente->getMontantVenteTotal(),
            $vendeur->getPseudo() ?? $vendeur->getEmail()
        ));
        $argentBenefice->setUser($this->getUser());
        $em->persist($argentBenefice);

        // 2. Retrait de la commission vendeur (dépense)
        $argentCommission = new Argent();
        $argentCommission->setType('retrait');
        $argentCommission->setMontant($vente->getCommission());
        $argentCommission->setCommentaire(sprintf(
            'Commission vendeur - %s$ (Recette: %s$) - %s (5%% du bénéfice)',
            $vente->getCommission(),
            $vente->getMontantVenteTotal(),
            $vendeur->getPseudo() ?? $vendeur->getEmail()
        ));
        $argentCommission->setUser($this->getUser());
        $em->persist($argentCommission);

        $em->flush();

        return new JsonResponse([
            'id' => $vente->getId(),
            'typeDrogue' => $vente->getTypeDrogue(),
            'vendeur' => [
                'id' => $vendeur->getId(),
                'pseudo' => $vendeur->getPseudo(),
                'email' => $vendeur->getEmail(),
            ],
            'montantVenteTotal' => $vente->getMontantVenteTotal(),
            'prixAchatUnitaire' => $vente->getPrixAchatUnitaire(),
            'coutAchatTotal' => $vente->getCoutAchatTotal(),
            'nbPochonsApproximatif' => $vente->getNbPochonsApproximatif(),
            'benefice' => $vente->getBenefice(),
            'commission' => $vente->getCommission(),
            'beneficeGroupe' => $vente->getBeneficeGroupe(),
            'commentaire' => $vente->getCommentaire(),
            'createdAt' => $dateFormatter->formatDateTimeISO($vente->getCreatedAt()),
        ], Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'api_vente_drogue_delete', methods: ['DELETE'])]
    public function delete(
        int $id,
        VenteDrogueRepository $venteRepo,
        ArgentRepository $argentRepo,
        EntityManagerInterface $em
    ): JsonResponse {
        $vente = $venteRepo->find($id);
        if (!$vente) {
            return new JsonResponse(['error' => 'Vente introuvable'], Response::HTTP_NOT_FOUND);
        }

        // Supprimer les entrées associées dans la comptabilité argent
        // Chercher les entrées par montant exact et type
        $allArgent = $argentRepo->findAll();
        $beneficeGroupeStr = $vente->getBeneficeGroupe();
        $commissionStr = $vente->getCommission();
        
        foreach ($allArgent as $argent) {
            $commentaire = $argent->getCommentaire() ?? '';
            $montant = $argent->getMontant();
            
            // Supprimer l'entrée "ajout" avec le bénéfice groupe
            if ($argent->getType() === 'ajout' && $montant === $beneficeGroupeStr && 
                strpos($commentaire, 'Bénéfice groupe') !== false) {
                $em->remove($argent);
            }
            
            // Supprimer l'entrée "retrait" avec la commission
            if ($argent->getType() === 'retrait' && $montant === $commissionStr && 
                strpos($commentaire, 'Commission vendeur') !== false) {
                $em->remove($argent);
            }
        }

        $em->remove($vente);
        $em->flush();

        return new JsonResponse(['message' => 'Vente et entrées associées supprimées']);
    }
}

