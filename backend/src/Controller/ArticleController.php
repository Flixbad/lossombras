<?php

namespace App\Controller;

use App\Entity\Article;
use App\Entity\Stock;
use App\Repository\ArticleRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/articles')]
class ArticleController extends AbstractController
{
    #[Route('', name: 'api_articles_list', methods: ['GET'])]
    public function list(ArticleRepository $articleRepo): JsonResponse
    {
        $articles = $articleRepo->findAll();
        $data = [];

        foreach ($articles as $article) {
            $data[] = [
                'id' => $article->getId(),
                'nom' => $article->getNom(),
                'type' => $article->getType(),
                'unite' => $article->getUnite(),
            ];
        }

        return new JsonResponse($data);
    }

    #[Route('', name: 'api_articles_create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $article = new Article();
        $article->setNom($data['nom'] ?? '');
        $article->setType($data['type'] ?? null);
        $article->setUnite($data['unite'] ?? null);

        $stock = new Stock();
        $stock->setArticle($article);
        $stock->setQuantite($data['quantiteInitiale'] ?? '0');

        $em->persist($article);
        $em->persist($stock);
        $em->flush();

        return new JsonResponse([
            'id' => $article->getId(),
            'nom' => $article->getNom(),
            'type' => $article->getType(),
            'unite' => $article->getUnite(),
        ], Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'api_articles_update', methods: ['PUT'])]
    public function update(int $id, Request $request, ArticleRepository $articleRepo, EntityManagerInterface $em): JsonResponse
    {
        $article = $articleRepo->find($id);
        if (!$article) {
            return new JsonResponse(['error' => 'Article introuvable'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['nom'])) {
            $article->setNom($data['nom']);
        }
        if (isset($data['type'])) {
            $article->setType($data['type']);
        }
        if (isset($data['unite'])) {
            $article->setUnite($data['unite']);
        }

        $em->flush();

        return new JsonResponse([
            'id' => $article->getId(),
            'nom' => $article->getNom(),
            'type' => $article->getType(),
            'unite' => $article->getUnite(),
        ]);
    }

    #[Route('/{id}', name: 'api_articles_delete', methods: ['DELETE'])]
    public function delete(int $id, ArticleRepository $articleRepo, EntityManagerInterface $em): JsonResponse
    {
        $article = $articleRepo->find($id);
        if (!$article) {
            return new JsonResponse(['error' => 'Article introuvable'], Response::HTTP_NOT_FOUND);
        }

        $em->remove($article);
        $em->flush();

        return new JsonResponse(['message' => 'Article supprimé']);
    }
}
