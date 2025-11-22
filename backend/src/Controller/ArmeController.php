<?php

namespace App\Controller;

use App\Entity\Arme;
use App\Entity\User;
use App\Repository\ArmeRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/armes')]
class ArmeController extends AbstractController
{
    #[Route('', name: 'api_armes_list', methods: ['GET'])]
    public function list(ArmeRepository $armeRepo): JsonResponse
    {
        $armes = $armeRepo->findAll();
        $data = [];

        foreach ($armes as $arme) {
            $sortiePar = $arme->getSortiePar();
            $data[] = [
                'id' => $arme->getId(),
                'nom' => $arme->getNom(),
                'type' => $arme->getType(),
                'description' => $arme->getDescription(),
                'sortiePar' => $sortiePar ? [
                    'id' => $sortiePar->getId(),
                    'pseudo' => $sortiePar->getPseudo(),
                    'email' => $sortiePar->getEmail(),
                ] : null,
                'dateSortie' => $arme->getDateSortie()?->format('Y-m-d H:i:s'),
                'commentaireSortie' => $arme->getCommentaireSortie(),
                'enSortie' => $arme->isEnSortie(),
                'createdAt' => $arme->getCreatedAt()->format('Y-m-d H:i:s'),
            ];
        }

        return new JsonResponse($data);
    }

    #[Route('', name: 'api_armes_create', methods: ['POST'])]
    public function create(
        Request $request,
        EntityManagerInterface $em
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        $arme = new Arme();
        $arme->setNom($data['nom'] ?? '');
        $arme->setType($data['type'] ?? null);
        $arme->setDescription($data['description'] ?? null);

        $em->persist($arme);
        $em->flush();

        return new JsonResponse([
            'id' => $arme->getId(),
            'nom' => $arme->getNom(),
            'type' => $arme->getType(),
            'description' => $arme->getDescription(),
            'enSortie' => false,
        ], Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'api_armes_update', methods: ['PUT'])]
    public function update(
        int $id,
        Request $request,
        ArmeRepository $armeRepo,
        EntityManagerInterface $em
    ): JsonResponse {
        $arme = $armeRepo->find($id);
        if (!$arme) {
            return new JsonResponse(['error' => 'Arme introuvable'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['nom'])) {
            $arme->setNom($data['nom']);
        }
        if (isset($data['type'])) {
            $arme->setType($data['type']);
        }
        if (isset($data['description'])) {
            $arme->setDescription($data['description']);
        }

        $em->flush();

        $sortiePar = $arme->getSortiePar();
        return new JsonResponse([
            'id' => $arme->getId(),
            'nom' => $arme->getNom(),
            'type' => $arme->getType(),
            'description' => $arme->getDescription(),
            'sortiePar' => $sortiePar ? [
                'id' => $sortiePar->getId(),
                'pseudo' => $sortiePar->getPseudo(),
                'email' => $sortiePar->getEmail(),
            ] : null,
            'dateSortie' => $arme->getDateSortie()?->format('Y-m-d H:i:s'),
            'commentaireSortie' => $arme->getCommentaireSortie(),
            'enSortie' => $arme->isEnSortie(),
        ]);
    }

    #[Route('/{id}', name: 'api_armes_delete', methods: ['DELETE'])]
    public function delete(int $id, ArmeRepository $armeRepo, EntityManagerInterface $em): JsonResponse
    {
        $arme = $armeRepo->find($id);
        if (!$arme) {
            return new JsonResponse(['error' => 'Arme introuvable'], Response::HTTP_NOT_FOUND);
        }

        $em->remove($arme);
        $em->flush();

        return new JsonResponse(['message' => 'Arme supprimée']);
    }

    #[Route('/{id}/sortie', name: 'api_armes_sortie', methods: ['POST'])]
    public function sortie(
        int $id,
        Request $request,
        ArmeRepository $armeRepo,
        UserRepository $userRepo,
        EntityManagerInterface $em
    ): JsonResponse {
        $arme = $armeRepo->find($id);
        if (!$arme) {
            return new JsonResponse(['error' => 'Arme introuvable'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);
        $userId = $data['userId'] ?? null;
        $commentaire = $data['commentaire'] ?? null;

        if (!$userId) {
            return new JsonResponse(['error' => 'Utilisateur requis'], Response::HTTP_BAD_REQUEST);
        }

        $user = $userRepo->find($userId);
        if (!$user) {
            return new JsonResponse(['error' => 'Utilisateur introuvable'], Response::HTTP_NOT_FOUND);
        }

        $arme->setSortiePar($user);
        $arme->setDateSortie(new \DateTimeImmutable());
        $arme->setCommentaireSortie($commentaire);

        $em->flush();

        return new JsonResponse([
            'id' => $arme->getId(),
            'sortiePar' => [
                'id' => $user->getId(),
                'pseudo' => $user->getPseudo(),
                'email' => $user->getEmail(),
            ],
            'dateSortie' => $arme->getDateSortie()->format('Y-m-d H:i:s'),
            'commentaireSortie' => $arme->getCommentaireSortie(),
            'enSortie' => true,
        ]);
    }

    #[Route('/{id}/retour', name: 'api_armes_retour', methods: ['POST'])]
    public function retour(
        int $id,
        ArmeRepository $armeRepo,
        EntityManagerInterface $em
    ): JsonResponse {
        $arme = $armeRepo->find($id);
        if (!$arme) {
            return new JsonResponse(['error' => 'Arme introuvable'], Response::HTTP_NOT_FOUND);
        }

        $arme->setSortiePar(null);
        $arme->setDateSortie(null);
        $arme->setCommentaireSortie(null);

        $em->flush();

        return new JsonResponse([
            'id' => $arme->getId(),
            'sortiePar' => null,
            'dateSortie' => null,
            'commentaireSortie' => null,
            'enSortie' => false,
        ]);
    }

    #[Route('/reset', name: 'api_armes_reset', methods: ['POST'])]
    public function reset(
        ArmeRepository $armeRepo,
        EntityManagerInterface $em
    ): JsonResponse {
        $armes = $armeRepo->findAll();
        $count = 0;

        foreach ($armes as $arme) {
            if ($arme->isEnSortie()) {
                $arme->setSortiePar(null);
                $arme->setDateSortie(null);
                $arme->setCommentaireSortie(null);
                $count++;
            }
        }

        $em->flush();

        return new JsonResponse([
            'message' => "{$count} arme(s) remise(s) à zéro",
            'count' => $count,
        ]);
    }
}

