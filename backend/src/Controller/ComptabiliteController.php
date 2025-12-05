<?php

namespace App\Controller;

use App\Entity\ComptabiliteArchive;
use App\Repository\ComptabiliteRepository;
use App\Repository\ComptabiliteArchiveRepository;
use App\Service\DateFormatterService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
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

    #[Route('/close-week', name: 'api_comptabilite_close_week', methods: ['POST'])]
    public function closeWeek(
        Request $request,
        ComptabiliteRepository $comptabiliteRepo,
        ComptabiliteArchiveRepository $archiveRepo,
        EntityManagerInterface $em
    ): JsonResponse {
        $user = $this->getUser();
        
        if (!$user) {
            return new JsonResponse(['error' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        // Vérifier que l'utilisateur a un des rôles autorisés
        $authorizedRoles = [
            'ROLE_CAPITAN',
            'ROLE_ALFERES',
            'ROLE_COMANDANTE',
            'ROLE_SEGUNDO',
            'ROLE_JEFE'
        ];
        
        $userRoles = $user->getRoles();
        $hasAccess = false;
        foreach ($authorizedRoles as $role) {
            if (in_array($role, $userRoles)) {
                $hasAccess = true;
                break;
            }
        }

        if (!$hasAccess) {
            return new JsonResponse([
                'error' => 'Accès refusé. Seuls les grades supérieurs peuvent clôturer la comptabilité.'
            ], Response::HTTP_FORBIDDEN);
        }

        // Compter les opérations à supprimer
        $allComptabilites = $comptabiliteRepo->findAll();
        $nbOperations = count($allComptabilites);

        // Obtenir la semaine actuelle (ISO 8601)
        $now = new \DateTimeImmutable();
        $year = (int) $now->format('Y');
        $week = (int) $now->format('W');
        $semaineKey = sprintf('%d-W%02d', $year, $week);

        // Vérifier si cette semaine a déjà été clôturée
        $existingArchive = $archiveRepo->findBySemaine($semaineKey);
        if ($existingArchive) {
            return new JsonResponse([
                'error' => sprintf('La semaine %s a déjà été clôturée', $semaineKey)
            ], Response::HTTP_BAD_REQUEST);
        }

        $data = json_decode($request->getContent(), true);
        $commentaire = $data['commentaire'] ?? null;

        // Créer l'archive
        $archive = new ComptabiliteArchive();
        $archive->setDateCloture($now);
        $archive->setSemaine($semaineKey);
        $archive->setNbOperations($nbOperations);
        $archive->setCommentaire($commentaire ?? sprintf('Clôture manuelle de la semaine %s (%d opérations supprimées)', $semaineKey, $nbOperations));
        $archive->setClosedBy($this->getUser());

        $em->persist($archive);

        // Supprimer toutes les opérations
        foreach ($allComptabilites as $comptabilite) {
            $em->remove($comptabilite);
        }

        $em->flush();

        return new JsonResponse([
            'message' => sprintf('Semaine %s clôturée avec succès', $semaineKey),
            'nbOperationsSupprimees' => $nbOperations,
            'semaine' => $semaineKey
        ], Response::HTTP_OK);
    }
}
