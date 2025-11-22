<?php

namespace App\Controller;

use App\Entity\Vehicule;
use App\Entity\ContenuVehicule;
use App\Repository\VehiculeRepository;
use App\Service\DateFormatterService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/vehicules')]
class VehiculeController extends AbstractController
{
    #[Route('', name: 'api_vehicules_list', methods: ['GET'])]
    public function list(VehiculeRepository $vehiculeRepo, DateFormatterService $dateFormatter): JsonResponse
    {
        $vehicules = $vehiculeRepo->findAll();
        $data = [];

        foreach ($vehicules as $vehicule) {
            $contenus = [];
            foreach ($vehicule->getContenus() as $contenu) {
                $article = $contenu->getArticle();
                $contenus[] = [
                    'id' => $contenu->getId(),
                    'article' => [
                        'id' => $article->getId(),
                        'nom' => $article->getNom(),
                        'type' => $article->getType(),
                        'unite' => $article->getUnite(),
                    ],
                    'quantite' => $contenu->getQuantite(),
                ];
            }

            $data[] = [
                'id' => $vehicule->getId(),
                'plaque' => $vehicule->getPlaque(),
                'modele' => $vehicule->getModele(),
                'couleur' => $vehicule->getCouleur(),
                'proprietaire' => $vehicule->getProprietaire(),
                'emplacement' => $vehicule->getEmplacement(),
                'contenus' => $contenus,
                'createdAt' => $dateFormatter->formatDateTimeISO($vehicule->getCreatedAt()),
                'updatedAt' => $dateFormatter->formatDateTimeISO($vehicule->getUpdatedAt()),
            ];
        }

        return new JsonResponse($data);
    }

    #[Route('', name: 'api_vehicules_create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em, DateFormatterService $dateFormatter): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['plaque']) || empty($data['modele'])) {
            return new JsonResponse(['error' => 'Plaque et modèle sont requis'], Response::HTTP_BAD_REQUEST);
        }

        $vehicule = new Vehicule();
        $vehicule->setPlaque(trim($data['plaque']));
        $vehicule->setModele(trim($data['modele']));
        $couleur = isset($data['couleur']) && !empty(trim($data['couleur'])) ? trim($data['couleur']) : null;
        $vehicule->setCouleur($couleur);
        $proprietaire = isset($data['proprietaire']) && !empty(trim($data['proprietaire'])) ? trim($data['proprietaire']) : null;
        $vehicule->setProprietaire($proprietaire);
        $emplacement = isset($data['emplacement']) && !empty(trim($data['emplacement'])) ? trim($data['emplacement']) : null;
        $vehicule->setEmplacement($emplacement);

        if (isset($data['contenus']) && is_array($data['contenus'])) {
            $articleRepo = $em->getRepository(\App\Entity\Article::class);
            foreach ($data['contenus'] as $contenuData) {
                $articleId = $contenuData['articleId'] ?? null;
                if ($articleId) {
                    $article = $articleRepo->find($articleId);
                    if ($article) {
                        $contenu = new ContenuVehicule();
                        $contenu->setArticle($article);
                        $contenu->setQuantite($contenuData['quantite'] ?? '0');
                        $vehicule->addContenu($contenu);
                    }
                }
            }
        }

        try {
            $em->persist($vehicule);
            $em->flush();
            
            return new JsonResponse([
                'id' => $vehicule->getId(),
                'plaque' => $vehicule->getPlaque(),
                'modele' => $vehicule->getModele(),
                'couleur' => $vehicule->getCouleur(),
                'proprietaire' => $vehicule->getProprietaire(),
                'emplacement' => $vehicule->getEmplacement(),
                'createdAt' => $dateFormatter->formatDateTimeISO($vehicule->getCreatedAt()),
            ], Response::HTTP_CREATED);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => 'Erreur lors de la création: ' . $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        return new JsonResponse([
            'id' => $vehicule->getId(),
            'plaque' => $vehicule->getPlaque(),
            'modele' => $vehicule->getModele(),
            'couleur' => $vehicule->getCouleur(),
        ], Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'api_vehicules_update', methods: ['PUT'])]
    public function update(int $id, Request $request, VehiculeRepository $vehiculeRepo, EntityManagerInterface $em, DateFormatterService $dateFormatter): JsonResponse
    {
        $vehicule = $vehiculeRepo->find($id);
        if (!$vehicule) {
            return new JsonResponse(['error' => 'Véhicule introuvable'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['plaque'])) {
            $vehicule->setPlaque($data['plaque']);
        }
        if (isset($data['modele'])) {
            $vehicule->setModele($data['modele']);
        }
        if (isset($data['couleur'])) {
            $vehicule->setCouleur($data['couleur']);
        }
        if (isset($data['proprietaire'])) {
            $vehicule->setProprietaire(trim($data['proprietaire']) ?: null);
        }
        if (isset($data['emplacement'])) {
            $vehicule->setEmplacement(trim($data['emplacement']) ?: null);
        }

        if (isset($data['contenus']) && is_array($data['contenus'])) {
            $vehicule->getContenus()->clear();
            $articleRepo = $em->getRepository(\App\Entity\Article::class);
            foreach ($data['contenus'] as $contenuData) {
                $article = $articleRepo->find($contenuData['articleId'] ?? null);
                if ($article) {
                    $contenu = new ContenuVehicule();
                    $contenu->setArticle($article);
                    $contenu->setQuantite($contenuData['quantite'] ?? '0');
                    $vehicule->addContenu($contenu);
                }
            }
        }

        $vehicule->setUpdatedAt(new \DateTimeImmutable());
        $em->flush();

        return new JsonResponse([
            'id' => $vehicule->getId(),
            'plaque' => $vehicule->getPlaque(),
            'modele' => $vehicule->getModele(),
            'couleur' => $vehicule->getCouleur(),
            'proprietaire' => $vehicule->getProprietaire(),
            'emplacement' => $vehicule->getEmplacement(),
            'updatedAt' => $dateFormatter->formatDateTimeISO($vehicule->getUpdatedAt()),
        ]);
    }

    #[Route('/{id}', name: 'api_vehicules_delete', methods: ['DELETE'])]
    public function delete(int $id, VehiculeRepository $vehiculeRepo, EntityManagerInterface $em): JsonResponse
    {
        $vehicule = $vehiculeRepo->find($id);
        if (!$vehicule) {
            return new JsonResponse(['error' => 'Véhicule introuvable'], Response::HTTP_NOT_FOUND);
        }

        $em->remove($vehicule);
        $em->flush();

        return new JsonResponse(['message' => 'Véhicule supprimé']);
    }
}
