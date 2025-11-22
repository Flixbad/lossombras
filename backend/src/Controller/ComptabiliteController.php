<?php

namespace App\Controller;

use App\Repository\ComptabiliteRepository;
use App\Service\DateFormatterService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/comptabilite')]
class ComptabiliteController extends AbstractController
{
    #[Route('', name: 'api_comptabilite_list', methods: ['GET'])]
    public function list(ComptabiliteRepository $comptabiliteRepo, DateFormatterService $dateFormatter): JsonResponse
    {
        $comptabilites = $comptabiliteRepo->findBy([], ['createdAt' => 'DESC']);
        $data = [];

        foreach ($comptabilites as $comptabilite) {
            $article = $comptabilite->getArticle();
            $user = $comptabilite->getUser();
            $data[] = [
                'id' => $comptabilite->getId(),
                'article' => [
                    'id' => $article->getId(),
                    'nom' => $article->getNom(),
                    'type' => $article->getType(),
                    'unite' => $article->getUnite(),
                ],
                'type' => $comptabilite->getType(),
                'quantite' => $comptabilite->getQuantite(),
                'commentaire' => $comptabilite->getCommentaire(),
                'user' => $user ? [
                    'id' => $user->getId(),
                    'pseudo' => $user->getPseudo(),
                    'email' => $user->getEmail(),
                ] : null,
                'createdAt' => $dateFormatter->formatDateTimeISO($comptabilite->getCreatedAt()),
            ];
        }

        return new JsonResponse($data);
    }
}
