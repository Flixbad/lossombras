<?php

namespace App\Controller;

use App\Entity\PariBoxe;
use App\Repository\PariBoxeRepository;
use App\Repository\UserRepository;
use App\Service\PariBoxeService;
use App\Service\DateFormatterService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/pari-boxe')]
class PariBoxeController extends AbstractController
{
    #[Route('', name: 'api_pari_boxe_list', methods: ['GET'])]
    public function list(
        PariBoxeRepository $pariRepo,
        DateFormatterService $dateFormatter,
        Request $request
    ): JsonResponse {
        $combatId = $request->query->get('combatId');
        $statut = $request->query->get('statut');
        
        if ($combatId) {
            if ($statut) {
                $paris = $pariRepo->findByCombatIdAndStatut($combatId, $statut);
            } else {
                $paris = $pariRepo->findByCombatId($combatId);
            }
        } else {
            $paris = $pariRepo->findAll();
        }
        
        $data = [];
        foreach ($paris as $pari) {
            $groupe = $pari->getGroupe();
            $data[] = [
                'id' => $pari->getId(),
                'groupe' => $groupe ? [
                    'id' => $groupe->getId(),
                    'pseudo' => $groupe->getPseudo(),
                    'email' => $groupe->getEmail(),
                ] : null,
                'nomGroupe' => $pari->getNomGroupe() ?? ($groupe ? ($groupe->getPseudo() ?? $groupe->getEmail()) : ''),
                'montantMise' => $pari->getMontantMise(),
                'combatId' => $pari->getCombatId(),
                'combatTitre' => $pari->getCombatTitre(),
                'combatantParie' => $pari->getCombatantParie(),
                'statut' => $pari->getStatut(),
                'gainCalcule' => $pari->getGainCalcule(),
                'commissionOrganisateur' => $pari->getCommissionOrganisateur(),
                'commentaire' => $pari->getCommentaire(),
                'createdAt' => $dateFormatter->formatDateTimeISO($pari->getCreatedAt()),
                'updatedAt' => $pari->getUpdatedAt() ? $dateFormatter->formatDateTimeISO($pari->getUpdatedAt()) : null,
            ];
        }
        
        return new JsonResponse($data);
    }

    #[Route('/stats/{combatId}', name: 'api_pari_boxe_stats', methods: ['GET'])]
    public function stats(string $combatId, PariBoxeRepository $pariRepo): JsonResponse
    {
        $paris = $pariRepo->findByCombatId($combatId);
        
        $stats = [
            'totalParis' => count($paris),
            'montantTotal' => 0,
            'totalCommissions' => 0,
            'parCombatant' => [],
            'parStatut' => [
                'en_attente' => 0,
                'gagne' => 0,
                'perdu' => 0,
                'annule' => 0,
            ],
        ];
        
        foreach ($paris as $pari) {
            $montant = (float) $pari->getMontantMise();
            $stats['montantTotal'] += $montant;
            
            // Ajouter les commissions (pour les paris résolus)
            if ($pari->getCommissionOrganisateur()) {
                $stats['totalCommissions'] += (float) $pari->getCommissionOrganisateur();
            }
            
            $combatant = $pari->getCombatantParie();
            if (!isset($stats['parCombatant'][$combatant])) {
                $stats['parCombatant'][$combatant] = [
                    'nom' => $combatant,
                    'nbParis' => 0,
                    'montantTotal' => 0,
                ];
            }
            $stats['parCombatant'][$combatant]['nbParis']++;
            $stats['parCombatant'][$combatant]['montantTotal'] += $montant;
            
            $statut = $pari->getStatut();
            if (isset($stats['parStatut'][$statut])) {
                $stats['parStatut'][$statut]++;
            }
        }
        
        $stats['parCombatant'] = array_values($stats['parCombatant']);
        
        return new JsonResponse($stats);
    }

    #[Route('', name: 'api_pari_boxe_create', methods: ['POST'])]
    public function create(
        Request $request,
        EntityManagerInterface $em,
        UserRepository $userRepo,
        DateFormatterService $dateFormatter
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);
        
        $groupeId = $data['groupeId'] ?? null;
        $nomGroupe = $data['nomGroupe'] ?? null;
        $montantMise = $data['montantMise'] ?? null;
        $combatId = $data['combatId'] ?? null;
        $combatTitre = $data['combatTitre'] ?? null;
        $combatantParie = $data['combatantParie'] ?? null;
        $commentaire = $data['commentaire'] ?? null;
        
        if ((!$groupeId && !$nomGroupe) || !$montantMise || !$combatId || !$combatTitre || !$combatantParie) {
            return new JsonResponse([
                'error' => 'Données manquantes. Requis: (groupeId OU nomGroupe), montantMise, combatId, combatTitre, combatantParie'
            ], Response::HTTP_BAD_REQUEST);
        }
        
        if ($montantMise <= 0) {
            return new JsonResponse(['error' => 'Le montant de la mise doit être supérieur à 0'], Response::HTTP_BAD_REQUEST);
        }
        
        $groupe = null;
        if ($groupeId) {
            $groupe = $userRepo->find($groupeId);
            if (!$groupe) {
                return new JsonResponse(['error' => 'Groupe introuvable'], Response::HTTP_NOT_FOUND);
            }
        }
        
        // Vérifier qu'il n'y a pas déjà un pari pour ce groupe/nom sur ce combat
        $parisExistants = [];
        if ($groupe) {
            $parisExistants = $em->getRepository(PariBoxe::class)->findBy([
                'groupe' => $groupe,
                'combatId' => $combatId,
                'statut' => 'en_attente'
            ]);
        } elseif ($nomGroupe) {
            $parisExistants = $em->getRepository(PariBoxe::class)->createQueryBuilder('p')
                ->where('p.nomGroupe = :nomGroupe')
                ->andWhere('p.combatId = :combatId')
                ->andWhere('p.statut = :statut')
                ->setParameter('nomGroupe', $nomGroupe)
                ->setParameter('combatId', $combatId)
                ->setParameter('statut', 'en_attente')
                ->getQuery()
                ->getResult();
        }
        
        if (count($parisExistants) > 0) {
            return new JsonResponse(['error' => 'Ce groupe a déjà un pari en cours sur ce combat'], Response::HTTP_BAD_REQUEST);
        }
        
        $pari = new PariBoxe();
        $pari->setGroupe($groupe);
        $pari->setNomGroupe($nomGroupe);
        $pari->setMontantMise(number_format((float) $montantMise, 2, '.', ''));
        $pari->setCombatId($combatId);
        $pari->setCombatTitre($combatTitre);
        $pari->setCombatantParie($combatantParie);
        $pari->setCommentaire($commentaire);
        
        try {
            $em->persist($pari);
            $em->flush();
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Erreur lors de l\'enregistrement du pari',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
        
        return new JsonResponse([
            'id' => $pari->getId(),
            'groupe' => $groupe ? [
                'id' => $groupe->getId(),
                'pseudo' => $groupe->getPseudo(),
                'email' => $groupe->getEmail(),
            ] : null,
            'nomGroupe' => $pari->getNomGroupe(),
            'montantMise' => $pari->getMontantMise(),
            'combatId' => $pari->getCombatId(),
            'combatTitre' => $pari->getCombatTitre(),
            'combatantParie' => $pari->getCombatantParie(),
            'statut' => $pari->getStatut(),
            'commentaire' => $pari->getCommentaire(),
            'createdAt' => $dateFormatter->formatDateTimeISO($pari->getCreatedAt()),
        ], Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'api_pari_boxe_delete', methods: ['DELETE'])]
    public function delete(int $id, PariBoxeRepository $pariRepo, EntityManagerInterface $em): JsonResponse
    {
        $pari = $pariRepo->find($id);
        if (!$pari) {
            return new JsonResponse(['error' => 'Pari introuvable'], Response::HTTP_NOT_FOUND);
        }
        
        $em->remove($pari);
        $em->flush();
        
        return new JsonResponse(['message' => 'Pari supprimé']);
    }

    #[Route('/combat/{combatId}', name: 'api_pari_boxe_delete_combat', methods: ['DELETE'])]
    public function deleteCombat(string $combatId, PariBoxeRepository $pariRepo, EntityManagerInterface $em): JsonResponse
    {
        $paris = $pariRepo->findByCombatId($combatId);
        
        if (count($paris) === 0) {
            return new JsonResponse(['error' => 'Combat introuvable'], Response::HTTP_NOT_FOUND);
        }
        
        $nbParisSupprimes = 0;
        foreach ($paris as $pari) {
            $em->remove($pari);
            $nbParisSupprimes++;
        }
        
        $em->flush();
        
        return new JsonResponse([
            'message' => 'Combat et tous ses paris supprimés',
            'combatId' => $combatId,
            'nbParisSupprimes' => $nbParisSupprimes
        ]);
    }

    #[Route('/resoudre', name: 'api_pari_boxe_resoudre', methods: ['POST'])]
    public function resoudre(
        Request $request,
        PariBoxeService $pariBoxeService,
        EntityManagerInterface $em,
        DateFormatterService $dateFormatter
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);
        
        $combatId = $data['combatId'] ?? null;
        $combatantGagnant = $data['combatantGagnant'] ?? null;
        
        if (!$combatId || !$combatantGagnant) {
            return new JsonResponse([
                'error' => 'Données manquantes. Requis: combatId, combatantGagnant'
            ], Response::HTTP_BAD_REQUEST);
        }
        
        try {
            // Résoudre le combat
            $stats = $pariBoxeService->resoudreCombat($combatId, $combatantGagnant);
            
            // Sauvegarder tous les paris modifiés
            $em->flush();
            
            return new JsonResponse([
                'message' => 'Combat résolu avec succès',
                'stats' => $stats
            ]);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Erreur lors de la résolution du combat',
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}

