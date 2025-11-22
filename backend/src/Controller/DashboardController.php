<?php

namespace App\Controller;

use App\Repository\StockRepository;
use App\Repository\VehiculeRepository;
use App\Repository\ComptabiliteRepository;
use App\Repository\ArgentRepository;
use App\Repository\UserRepository;
use App\Service\DateFormatterService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/dashboard')]
class DashboardController extends AbstractController
{
    #[Route('', name: 'api_dashboard', methods: ['GET'])]
    public function dashboard(
        StockRepository $stockRepo,
        VehiculeRepository $vehiculeRepo,
        ComptabiliteRepository $comptabiliteRepo,
        ArgentRepository $argentRepo,
        UserRepository $userRepo,
        DateFormatterService $dateFormatter
    ): JsonResponse {
        $stocks = $stockRepo->findAll();
        $vehicules = $vehiculeRepo->findAll();
        $comptabilites = $comptabiliteRepo->findBy([], ['createdAt' => 'DESC'], 10);
        $users = $userRepo->findAll();

        $totalArticles = count($stocks);
        $totalVehicules = count($vehicules);
        $totalUsers = count($users);

        // Dernières opérations
        $dernieresOperations = [];
        foreach ($comptabilites as $comptabilite) {
            $article = $comptabilite->getArticle();
            $user = $comptabilite->getUser();
            $dernieresOperations[] = [
                'id' => $comptabilite->getId(),
                'article' => $article->getNom(),
                'type' => $comptabilite->getType(),
                'quantite' => $comptabilite->getQuantite(),
                'user' => $user ? $user->getPseudo() : null,
                'createdAt' => $dateFormatter->formatDateTimeISO($comptabilite->getCreatedAt()),
            ];
        }

        // Top 5 des articles les plus utilisés (par quantité totale sortie)
        $topArticles = [];
        $articleUsage = [];
        foreach ($comptabilites as $comptabilite) {
            $articleId = $comptabilite->getArticle()->getId();
            $articleNom = $comptabilite->getArticle()->getNom();
            if ($comptabilite->getType() === 'sortie') {
                if (!isset($articleUsage[$articleId])) {
                    $articleUsage[$articleId] = [
                        'id' => $articleId,
                        'nom' => $articleNom,
                        'quantite' => 0
                    ];
                }
                $articleUsage[$articleId]['quantite'] += (float) $comptabilite->getQuantite();
            }
        }
        usort($articleUsage, function($a, $b) {
            return $b['quantite'] <=> $a['quantite'];
        });
        $topArticles = array_slice($articleUsage, 0, 5);

        // Alertes de stock faible (stock < 100)
        $alertesStock = [];
        foreach ($stocks as $stock) {
            $quantite = (float) $stock->getQuantite();
            if ($quantite < 100) {
                $article = $stock->getArticle();
                $alertesStock[] = [
                    'id' => $stock->getId(),
                    'article' => $article->getNom(),
                    'quantite' => $quantite,
                    'unite' => $article->getUnite() ?? '',
                ];
            }
        }

        // Tendances des 7 derniers jours (stock et argent)
        $tendancesStock = [];
        $tendancesArgent = [];
        $dateNow = new \DateTimeImmutable();
        
        try {
            for ($i = 6; $i >= 0; $i--) {
                $date = $dateNow->modify("-$i days");
                $dateStr = $date->format('Y-m-d');
                $dateFormatted = $date->setTimezone(new \DateTimeZone('Europe/Paris'))->format('d/m/Y');
                
                // Tendances stock (entrées/sorties du jour)
                try {
                    $comptabilitesJour = $comptabiliteRepo->createQueryBuilder('c')
                        ->where('DATE(c.createdAt) = :date')
                        ->setParameter('date', $dateStr)
                        ->getQuery()
                        ->getResult();
                } catch (\Exception $e) {
                    $comptabilitesJour = [];
                }
                
                $entrees = 0;
                $sorties = 0;
                foreach ($comptabilitesJour as $c) {
                    $qty = (float) $c->getQuantite();
                    if ($c->getType() === 'entree') {
                        $entrees += $qty;
                    } else {
                        $sorties += $qty;
                    }
                }
                
                $tendancesStock[] = [
                    'date' => $dateFormatted,
                    'entrees' => $entrees,
                    'sorties' => $sorties,
                ];

                // Tendances argent (ajouts/retraits du jour)
                try {
                    $argentJour = $argentRepo->createQueryBuilder('a')
                        ->where('DATE(a.createdAt) = :date')
                        ->setParameter('date', $dateStr)
                        ->getQuery()
                        ->getResult();
                } catch (\Exception $e) {
                    $argentJour = [];
                }
                
                $ajouts = 0;
                $retraits = 0;
                foreach ($argentJour as $a) {
                    $montant = (float) $a->getMontant();
                    if ($a->getType() === 'ajout') {
                        $ajouts += $montant;
                    } else {
                        $retraits += $montant;
                    }
                }
                
                $tendancesArgent[] = [
                    'date' => $dateFormatted,
                    'ajouts' => $ajouts,
                    'retraits' => $retraits,
                ];
            }
        } catch (\Exception $e) {
            // En cas d'erreur, retourner des tableaux vides plutôt que de planter
            $tendancesStock = [];
            $tendancesArgent = [];
        }

        return new JsonResponse([
            'stats' => [
                'totalArticles' => $totalArticles,
                'totalVehicules' => $totalVehicules,
                'totalUsers' => $totalUsers,
            ],
            'dernieresOperations' => $dernieresOperations,
            'topArticles' => $topArticles,
            'alertesStock' => $alertesStock,
            'tendancesStock' => $tendancesStock,
            'tendancesArgent' => $tendancesArgent,
        ]);
    }
}
