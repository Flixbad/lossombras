<?php

/**
 * Script simple pour charger les fixtures sans le bundle DoctrineFixturesBundle
 * Usage: php CHARGER_FIXTURES_SIMPLE.php
 */

use App\Entity\Article;
use App\Entity\Stock;
use App\Entity\User;
use Symfony\Component\Dotenv\Dotenv;

require __DIR__ . '/backend/vendor/autoload.php';

if (!class_exists(Dotenv::class)) {
    throw new RuntimeException('Please run "composer require symfony/dotenv" to load the ".env" files.');
}

// Charger les variables d'environnement
(new Dotenv())->bootEnv(__DIR__ . '/backend/.env');

$kernel = new App\Kernel($_SERVER['APP_ENV'] ?? 'dev', (bool) ($_SERVER['APP_DEBUG'] ?? false));
$kernel->boot();

$container = $kernel->getContainer();
$entityManager = $container->get('doctrine.orm.entity_manager');

// Obtenir le password hasher via l'interface (plus fiable)
try {
    $passwordHasher = $container->get(\Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface::class);
} catch (\Exception $e) {
    // Si ça ne marche pas, utiliser password_hash directement
    echo "⚠️  Impossible d'obtenir le password hasher, utilisation de password_hash()\n";
    $passwordHasher = null;
}

echo "🚀 Chargement des fixtures...\n";
echo "══════════════════════════════════════════════════════════════\n\n";

// Créer les articles
$articlesData = [
    ['nom' => 'Engrais', 'type' => 'Matière première', 'unite' => 'kg'],
    ['nom' => 'Eau', 'type' => 'Matière première', 'unite' => 'L'],
    ['nom' => 'Fertilizant', 'type' => 'Matière première', 'unite' => 'kg'],
    ['nom' => 'Nebula Pots', 'type' => 'Produit fini', 'unite' => 'unité'],
    ['nom' => 'Nebula Pochon', 'type' => 'Produit fini', 'unite' => 'unité'],
    ['nom' => 'Nebula Tête', 'type' => 'Produit fini', 'unite' => 'unité'],
    ['nom' => 'Iron Pots', 'type' => 'Produit fini', 'unite' => 'unité'],
    ['nom' => 'Iron Pochon', 'type' => 'Produit fini', 'unite' => 'unité'],
    ['nom' => 'Iron Tête', 'type' => 'Produit fini', 'unite' => 'unité'],
    ['nom' => 'Violet Storm Pots', 'type' => 'Produit fini', 'unite' => 'unité'],
    ['nom' => 'Violet Storm Pochon', 'type' => 'Produit fini', 'unite' => 'unité'],
    ['nom' => 'Violet Storm Tête', 'type' => 'Produit fini', 'unite' => 'unité'],
    ['nom' => 'Meth Pochon', 'type' => 'Produit fini', 'unite' => 'unité'],
    ['nom' => 'Coke Pochon', 'type' => 'Produit fini', 'unite' => 'unité'],
    ['nom' => 'Clé ATM', 'type' => 'Outillage', 'unite' => 'unité'],
    ['nom' => 'Clé GoFast', 'type' => 'Outillage', 'unite' => 'unité'],
    ['nom' => 'Kit Voitures', 'type' => 'Kit', 'unite' => 'unité'],
    ['nom' => 'Kit Cambu', 'type' => 'Kit', 'unite' => 'unité'],
    ['nom' => 'Kit Fleeca', 'type' => 'Kit', 'unite' => 'unité'],
    ['nom' => 'Kit Disqueuse', 'type' => 'Kit', 'unite' => 'unité'],
    ['nom' => 'Kit Perceuse', 'type' => 'Kit', 'unite' => 'unité'],
    ['nom' => 'Pièce véhicule', 'type' => 'Pièce', 'unite' => '%'],
    ['nom' => 'Pièce cambu', 'type' => 'Pièce', 'unite' => '%'],
];

echo "📝 Création des articles et stocks...\n";
$articleCount = 0;
foreach ($articlesData as $articleData) {
    $article = new Article();
    $article->setNom($articleData['nom']);
    $article->setType($articleData['type']);
    $article->setUnite($articleData['unite']);
    
    $stock = new Stock();
    $stock->setArticle($article);
    $stock->setQuantite('0');
    
    $entityManager->persist($article);
    $entityManager->persist($stock);
    $articleCount++;
}

echo "   ✅ $articleCount articles créés\n\n";

// Vérifier si l'utilisateur admin existe déjà
$userRepo = $entityManager->getRepository(User::class);
$existingAdmin = $userRepo->findOneBy(['email' => 'admin@losombras.com']);

// Fonction pour hasher le mot de passe
$hashPassword = function($user, $plainPassword) use ($passwordHasher) {
    if ($passwordHasher) {
        return $passwordHasher->hashPassword($user, $plainPassword);
    } else {
        // Fallback: utiliser password_hash directement
        return password_hash($plainPassword, PASSWORD_DEFAULT);
    }
};

if ($existingAdmin) {
    echo "⚠️  L'utilisateur admin@losombras.com existe déjà\n";
    echo "   Mise à jour du mot de passe et du rôle...\n";
    $existingAdmin->setPassword($hashPassword($existingAdmin, 'admin123'));
    $existingAdmin->setRoles(['ROLE_JEFE']);
    $existingAdmin->setPrenom('Admin');
    $existingAdmin->setNom('Los Sombras');
    $existingAdmin->setPseudo('Admin');
    $entityManager->persist($existingAdmin);
} else {
    echo "📝 Création de l'utilisateur admin...\n";
    $admin = new User();
    $admin->setEmail('admin@losombras.com');
    $admin->setPassword($hashPassword($admin, 'admin123'));
    $admin->setRoles(['ROLE_JEFE']);
    $admin->setPrenom('Admin');
    $admin->setNom('Los Sombras');
    $admin->setPseudo('Admin');
    $entityManager->persist($admin);
}

$entityManager->flush();

echo "   ✅ Utilisateur admin créé/mis à jour\n\n";

echo "══════════════════════════════════════════════════════════════\n";
echo "✅ Fixtures chargées avec succès !\n";
echo "══════════════════════════════════════════════════════════════\n\n";
echo "📋 Compte admin :\n";
echo "   Email : admin@losombras.com\n";
echo "   Mot de passe : admin123\n";
echo "   Rôle : ROLE_JEFE\n\n";

$kernel->shutdown();

