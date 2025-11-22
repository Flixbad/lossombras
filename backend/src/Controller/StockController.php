<?php

namespace App\Controller;

use App\Entity\Article;
use App\Entity\Stock;
use App\Entity\Comptabilite;
use App\Repository\StockRepository;
use App\Repository\ArticleRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/stock')]
class StockController extends AbstractController
{
    #[Route('', name: 'api_stock_list', methods: ['GET'])]
    public function list(StockRepository $stockRepo, ArticleRepository $articleRepo): JsonResponse
    {
        $stocks = $stockRepo->findAll();
        $data = [];

        foreach ($stocks as $stock) {
            $article = $stock->getArticle();
            $data[] = [
                'id' => $stock->getId(),
                'article' => [
                    'id' => $article->getId(),
                    'nom' => $article->getNom(),
                    'type' => $article->getType(),
                    'unite' => $article->getUnite(),
                ],
                'quantite' => $stock->getQuantite(),
                'updatedAt' => $stock->getUpdatedAt()->format('Y-m-d H:i:s'),
            ];
        }

        return new JsonResponse($data);
    }

    #[Route('/{id}', name: 'api_stock_update', methods: ['PUT'])]
    public function update(
        int $id,
        Request $request,
        StockRepository $stockRepo,
        EntityManagerInterface $em
    ): JsonResponse {
        $stock = $stockRepo->find($id);
        if (!$stock) {
            return new JsonResponse(['error' => 'Stock introuvable'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);
        $quantite = $data['quantite'] ?? null;
        $typeOperation = $data['type'] ?? 'sortie';

        if ($quantite === null) {
            return new JsonResponse(['error' => 'Quantité requise'], Response::HTTP_BAD_REQUEST);
        }

        $ancienneQuantite = (float) $stock->getQuantite();
        $nouvelleQuantite = (float) $quantite;

        if ($typeOperation === 'entree') {
            $stock->setQuantite((string) ($ancienneQuantite + $nouvelleQuantite));
        } elseif ($typeOperation === 'sortie') {
            if ($nouvelleQuantite > $ancienneQuantite) {
                return new JsonResponse(['error' => 'Stock insuffisant'], Response::HTTP_BAD_REQUEST);
            }
            $stock->setQuantite((string) ($ancienneQuantite - $nouvelleQuantite));
        } else {
            $stock->setQuantite($quantite);
        }

        $stock->setUpdatedAt(new \DateTimeImmutable());

        // Enregistrer dans la comptabilité
        $comptabilite = new Comptabilite();
        $comptabilite->setArticle($stock->getArticle());
        $comptabilite->setType($typeOperation);
        $comptabilite->setQuantite($nouvelleQuantite);
        $comptabilite->setCommentaire($data['commentaire'] ?? null);
        $comptabilite->setUser($this->getUser());

        $em->persist($comptabilite);
        $em->flush();

        return new JsonResponse([
            'id' => $stock->getId(),
            'quantite' => $stock->getQuantite(),
            'updatedAt' => $stock->getUpdatedAt()->format('Y-m-d H:i:s'),
        ]);
    }
}
