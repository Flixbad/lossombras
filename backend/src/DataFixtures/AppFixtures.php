<?php

namespace App\DataFixtures;

use App\Entity\Article;
use App\Entity\Stock;
use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    private UserPasswordHasherInterface $passwordHasher;

    public function __construct(UserPasswordHasherInterface $passwordHasher)
    {
        $this->passwordHasher = $passwordHasher;
    }

    public function load(ObjectManager $manager): void
    {
        // Création des articles
        $articles = [
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

        foreach ($articles as $articleData) {
            $article = new Article();
            $article->setNom($articleData['nom']);
            $article->setType($articleData['type']);
            $article->setUnite($articleData['unite']);
            
            $stock = new Stock();
            $stock->setArticle($article);
            $stock->setQuantite('0');
            
            $manager->persist($article);
            $manager->persist($stock);
        }

        // Création d'un utilisateur admin
        $admin = new User();
        $admin->setEmail('admin@losombras.com');
        $admin->setPassword($this->passwordHasher->hashPassword($admin, 'admin123'));
        $admin->setRoles(['ROLE_JEFE']);
        $admin->setPrenom('Admin');
        $admin->setNom('Los Sombras');
        $admin->setPseudo('Admin');
        
        $manager->persist($admin);

        $manager->flush();
    }
}
