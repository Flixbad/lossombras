<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api')]
class AuthController extends AbstractController
{
    #[Route('/register', name: 'api_register', methods: ['POST'])]
    public function register(
        Request $request,
        EntityManagerInterface $em,
        UserPasswordHasherInterface $passwordHasher,
        ValidatorInterface $validator
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        $user = new User();
        $user->setEmail($data['email'] ?? '');
        $user->setPassword($data['password'] ?? '');
        $user->setPrenom($data['prenom'] ?? null);
        $user->setNom($data['nom'] ?? null);
        $user->setAge($data['age'] ?? null);
        $user->setTelephone($data['telephone'] ?? null);
        $user->setPseudo($data['pseudo'] ?? null);

        $errors = $validator->validate($user);
        if (count($errors) > 0) {
            return new JsonResponse(['errors' => (string) $errors], Response::HTTP_BAD_REQUEST);
        }

        $hashedPassword = $passwordHasher->hashPassword($user, $data['password']);
        $user->setPassword($hashedPassword);

        $em->persist($user);
        $em->flush();

        return new JsonResponse([
            'message' => 'Inscription réussie',
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'pseudo' => $user->getPseudo(),
            ]
        ], Response::HTTP_CREATED);
    }

    #[Route('/me', name: 'api_me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user) {
            return new JsonResponse(['error' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        return new JsonResponse([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'prenom' => $user->getPrenom(),
            'nom' => $user->getNom(),
            'age' => $user->getAge(),
            'telephone' => $user->getTelephone(),
            'pseudo' => $user->getPseudo(),
            'roles' => $user->getRoles(),
        ]);
    }

    #[Route('/reset-password', name: 'api_reset_password', methods: ['POST'])]
    public function resetPassword(
        Request $request,
        UserRepository $userRepo,
        EntityManagerInterface $em,
        UserPasswordHasherInterface $passwordHasher
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);
        
        $email = $data['email'] ?? null;
        $newPassword = $data['newPassword'] ?? null;
        
        if (!$email || !$newPassword) {
            return new JsonResponse([
                'error' => 'Email et nouveau mot de passe requis'
            ], Response::HTTP_BAD_REQUEST);
        }
        
        // Validation du mot de passe (minimum 6 caractères)
        if (strlen($newPassword) < 6) {
            return new JsonResponse([
                'error' => 'Le mot de passe doit contenir au moins 6 caractères'
            ], Response::HTTP_BAD_REQUEST);
        }
        
        // Trouver l'utilisateur par email
        $user = $userRepo->findOneBy(['email' => $email]);
        
        if (!$user) {
            return new JsonResponse([
                'error' => 'Aucun utilisateur trouvé avec cet email'
            ], Response::HTTP_NOT_FOUND);
        }
        
        // Hasher et définir le nouveau mot de passe
        $hashedPassword = $passwordHasher->hashPassword($user, $newPassword);
        $user->setPassword($hashedPassword);
        
        $em->flush();
        
        return new JsonResponse([
            'message' => 'Mot de passe réinitialisé avec succès',
            'email' => $user->getEmail()
        ], Response::HTTP_OK);
    }
}
