<?php

namespace App\Controller;

use App\Entity\Argent;
use App\Repository\ArgentRepository;
use App\Service\DateFormatterService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/argent')]
class ArgentController extends AbstractController
{
    #[Route('', name: 'api_argent_list', methods: ['GET'])]
    public function list(ArgentRepository $argentRepo, DateFormatterService $dateFormatter): JsonResponse
    {
        $argentList = $argentRepo->findBy([], ['createdAt' => 'DESC']);
        $data = [];

        foreach ($argentList as $argent) {
            $user = $argent->getUser();
            $data[] = [
                'id' => $argent->getId(),
                'type' => $argent->getType(),
                'montant' => $argent->getMontant(),
                'commentaire' => $argent->getCommentaire(),
                'user' => $user ? [
                    'id' => $user->getId(),
                    'pseudo' => $user->getPseudo(),
                    'email' => $user->getEmail(),
                ] : null,
                'createdAt' => $dateFormatter->formatDateTimeISO($argent->getCreatedAt()),
            ];
        }

        return new JsonResponse($data);
    }

    #[Route('/stats', name: 'api_argent_stats', methods: ['GET'])]
    public function stats(Request $request, ArgentRepository $argentRepo, DateFormatterService $dateFormatter): JsonResponse
    {
        $period = $request->query->get('period', 'mois');
        $all = $argentRepo->findAll();
        
        $totalAjoute = 0;
        $totalRetire = 0;
        $solde = 0;
        
        $parMois = [];
        $parSemaine = [];
        $parJour = [];
        $parUser = [];

        foreach ($all as $argent) {
            $montant = (float) $argent->getMontant();
            
            if ($argent->getType() === 'ajout') {
                $totalAjoute += $montant;
                $solde += $montant;
            } elseif ($argent->getType() === 'retrait') {
                $totalRetire += $montant;
                $solde -= $montant;
            }

            $date = $dateFormatter->getParisDateTime($argent->getCreatedAt());

            // Stats par jour
            $jour = $date->format('Y-m-d');
            if (!isset($parJour[$jour])) {
                $parJour[$jour] = ['ajout' => 0, 'retrait' => 0];
            }
            if ($argent->getType() === 'ajout') {
                $parJour[$jour]['ajout'] += $montant;
            } else {
                $parJour[$jour]['retrait'] += $montant;
            }

            // Stats par semaine (ISO 8601)
            $year = (int) $date->format('Y');
            $week = (int) $date->format('W');
            $semaineKey = sprintf('%d-W%02d', $year, $week);
            if (!isset($parSemaine[$semaineKey])) {
                $parSemaine[$semaineKey] = ['ajout' => 0, 'retrait' => 0];
            }
            if ($argent->getType() === 'ajout') {
                $parSemaine[$semaineKey]['ajout'] += $montant;
            } else {
                $parSemaine[$semaineKey]['retrait'] += $montant;
            }

            // Stats par mois
            $mois = $date->format('Y-m');
            if (!isset($parMois[$mois])) {
                $parMois[$mois] = ['ajout' => 0, 'retrait' => 0];
            }
            if ($argent->getType() === 'ajout') {
                $parMois[$mois]['ajout'] += $montant;
            } else {
                $parMois[$mois]['retrait'] += $montant;
            }

            // Stats par utilisateur
            $user = $argent->getUser();
            if ($user) {
                $userId = $user->getId();
                if (!isset($parUser[$userId])) {
                    $parUser[$userId] = [
                        'user' => [
                            'id' => $user->getId(),
                            'pseudo' => $user->getPseudo(),
                            'email' => $user->getEmail(),
                        ],
                        'ajout' => 0,
                        'retrait' => 0
                    ];
                }
                if ($argent->getType() === 'ajout') {
                    $parUser[$userId]['ajout'] += $montant;
                } else {
                    $parUser[$userId]['retrait'] += $montant;
                }
            }
        }

        $response = [
            'totalAjoute' => $totalAjoute,
            'totalRetire' => $totalRetire,
            'solde' => $solde,
            'parMois' => $parMois,
            'parSemaine' => $parSemaine,
            'parJour' => $parJour,
            'parUser' => array_values($parUser),
        ];

        return new JsonResponse($response);
    }

    #[Route('', name: 'api_argent_create', methods: ['POST'])]
    public function create(
        Request $request,
        EntityManagerInterface $em,
        DateFormatterService $dateFormatter
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        $type = $data['type'] ?? null;
        $montant = $data['montant'] ?? null;
        $commentaire = $data['commentaire'] ?? null;

        if (!$type || !in_array($type, ['ajout', 'retrait'])) {
            return new JsonResponse(['error' => 'Type invalide (ajout ou retrait)'], Response::HTTP_BAD_REQUEST);
        }

        if ($montant === null || $montant <= 0) {
            return new JsonResponse(['error' => 'Montant invalide'], Response::HTTP_BAD_REQUEST);
        }

        $argent = new Argent();
        $argent->setType($type);
        $argent->setMontant((string) $montant);
        $argent->setCommentaire($commentaire);
        $argent->setUser($this->getUser());

        $em->persist($argent);
        $em->flush();

        return new JsonResponse([
            'id' => $argent->getId(),
            'type' => $argent->getType(),
            'montant' => $argent->getMontant(),
            'commentaire' => $argent->getCommentaire(),
            'user' => $argent->getUser() ? [
                'id' => $argent->getUser()->getId(),
                'pseudo' => $argent->getUser()->getPseudo(),
            ] : null,
            'createdAt' => $dateFormatter->formatDateTimeISO($argent->getCreatedAt()),
        ], Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'api_argent_delete', methods: ['DELETE'])]
    public function delete(int $id, ArgentRepository $argentRepo, EntityManagerInterface $em): JsonResponse
    {
        $argent = $argentRepo->find($id);
        if (!$argent) {
            return new JsonResponse(['error' => 'Opération introuvable'], Response::HTTP_NOT_FOUND);
        }

        $em->remove($argent);
        $em->flush();

        return new JsonResponse(['message' => 'Opération supprimée']);
    }
}

