<?php

namespace App\Controller;

use App\Entity\VenteDrogue;
use App\Entity\Argent;
use App\Repository\VenteDrogueRepository;
use App\Repository\UserRepository;
use App\Service\DateFormatterService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/vente-drogue')]
class VenteDrogueController extends AbstractController
{
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
                'vendeur' => $vendeur ? [
                    'id' => $vendeur->getId(),
                    'pseudo' => $vendeur->getPseudo(),
                    'email' => $vendeur->getEmail(),
                ] : null,
                'nbPochons' => $vente->getNbPochons(),
                'prixVenteUnitaire' => $vente->getPrixVenteUnitaire(),
                'prixAchatUnitaire' => $vente->getPrixAchatUnitaire(),
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
        $totalPochons = array_sum(array_map(fn($v) => $v->getNbPochons(), $ventes));
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
                    'totalPochons' => 0,
                    'totalCommission' => 0,
                    'totalBeneficeGroupe' => 0,
                ];
            }

            $ventesParVendeur[$vendeurId]['nbVentes']++;
            $ventesParVendeur[$vendeurId]['totalPochons'] += $vente->getNbPochons();
            $ventesParVendeur[$vendeurId]['totalCommission'] += (float) $vente->getCommission();
            $ventesParVendeur[$vendeurId]['totalBeneficeGroupe'] += (float) $vente->getBeneficeGroupe();
        }

        $statsParVendeur = array_values($ventesParVendeur);
        usort($statsParVendeur, fn($a, $b) => $b['totalCommission'] <=> $a['totalCommission']);

        return new JsonResponse([
            'global' => [
                'totalVentes' => $totalVentes,
                'totalPochons' => $totalPochons,
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
        DateFormatterService $dateFormatter
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        $vendeurId = $data['vendeurId'] ?? null;
        $nbPochons = $data['nbPochons'] ?? null;
        $prixVenteUnitaire = $data['prixVenteUnitaire'] ?? null;
        $prixAchatUnitaire = $data['prixAchatUnitaire'] ?? 625.00;
        $commentaire = $data['commentaire'] ?? null;

        if (!$vendeurId) {
            return new JsonResponse(['error' => 'Vendeur requis'], Response::HTTP_BAD_REQUEST);
        }

        if (!$nbPochons || $nbPochons <= 0) {
            return new JsonResponse(['error' => 'Nombre de pochons invalide'], Response::HTTP_BAD_REQUEST);
        }

        if (!$prixVenteUnitaire || $prixVenteUnitaire <= 0) {
            return new JsonResponse(['error' => 'Prix de vente invalide'], Response::HTTP_BAD_REQUEST);
        }

        $vendeur = $userRepo->find($vendeurId);
        if (!$vendeur) {
            return new JsonResponse(['error' => 'Vendeur introuvable'], Response::HTTP_NOT_FOUND);
        }

        // Créer la vente
        $vente = new VenteDrogue();
        $vente->setVendeur($vendeur);
        $vente->setNbPochons((int) $nbPochons);
        $vente->setPrixVenteUnitaire((string) $prixVenteUnitaire);
        $vente->setPrixAchatUnitaire((string) $prixAchatUnitaire);
        $vente->setCommentaire($commentaire);

        $em->persist($vente);
        $em->flush();

        // Créer automatiquement les entrées dans la comptabilité argent :
        // 1. Ajout du bénéfice groupe (revenu)
        $argentBenefice = new Argent();
        $argentBenefice->setType('ajout');
        $argentBenefice->setMontant($vente->getBeneficeGroupe());
        $argentBenefice->setCommentaire(sprintf(
            'Vente drogue - %d pochon(s) par %s (Bénéfice groupe)',
            $vente->getNbPochons(),
            $vendeur->getPseudo() ?? $vendeur->getEmail()
        ));
        $argentBenefice->setUser($this->getUser());
        $em->persist($argentBenefice);

        // 2. Retrait de la commission vendeur (dépense)
        $argentCommission = new Argent();
        $argentCommission->setType('retrait');
        $argentCommission->setMontant($vente->getCommission());
        $argentCommission->setCommentaire(sprintf(
            'Commission vendeur - %d pochon(s) - %s (5%% du bénéfice)',
            $vente->getNbPochons(),
            $vendeur->getPseudo() ?? $vendeur->getEmail()
        ));
        $argentCommission->setUser($this->getUser());
        $em->persist($argentCommission);

        $em->flush();

        return new JsonResponse([
            'id' => $vente->getId(),
            'vendeur' => [
                'id' => $vendeur->getId(),
                'pseudo' => $vendeur->getPseudo(),
                'email' => $vendeur->getEmail(),
            ],
            'nbPochons' => $vente->getNbPochons(),
            'prixVenteUnitaire' => $vente->getPrixVenteUnitaire(),
            'prixAchatUnitaire' => $vente->getPrixAchatUnitaire(),
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
        EntityManagerInterface $em
    ): JsonResponse {
        $vente = $venteRepo->find($id);
        if (!$vente) {
            return new JsonResponse(['error' => 'Vente introuvable'], Response::HTTP_NOT_FOUND);
        }

        $em->remove($vente);
        $em->flush();

        return new JsonResponse(['message' => 'Vente supprimée']);
    }
}

