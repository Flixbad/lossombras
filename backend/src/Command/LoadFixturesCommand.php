<?php

namespace App\Command;

use App\Entity\Article;
use App\Entity\Stock;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsCommand(
    name: 'app:load-fixtures',
    description: 'Charge les fixtures (articles, stocks, utilisateur admin)'
)]
class LoadFixturesCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $em,
        private UserPasswordHasherInterface $passwordHasher
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addOption('append', null, InputOption::VALUE_NONE, 'Ajouter les fixtures sans vider la base')
            ->setHelp('Charge les fixtures dans la base de données');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        if (!$input->getOption('append')) {
            $io->warning('Cette commande va créer/écraser des données !');
            if (!$io->confirm('Continuer ?', false)) {
                return Command::FAILURE;
            }
        }

        $io->title('Chargement des fixtures');

        // Articles
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

        $io->progressStart(count($articlesData));
        $articleRepository = $this->em->getRepository(Article::class);

        foreach ($articlesData as $articleData) {
            // Vérifier si l'article existe déjà
            $existingArticle = $articleRepository->findOneBy(['nom' => $articleData['nom']]);
            
            if ($existingArticle) {
                // Mettre à jour l'article existant
                $existingArticle->setType($articleData['type']);
                $existingArticle->setUnite($articleData['unite']);
                $article = $existingArticle;
            } else {
                // Créer un nouvel article
                $article = new Article();
                $article->setNom($articleData['nom']);
                $article->setType($articleData['type']);
                $article->setUnite($articleData['unite']);
                $this->em->persist($article);
            }

            // Vérifier si le stock existe
            $stockRepository = $this->em->getRepository(Stock::class);
            $existingStock = $stockRepository->findOneBy(['article' => $article]);
            
            if (!$existingStock) {
                $stock = new Stock();
                $stock->setArticle($article);
                $stock->setQuantite('0');
                $this->em->persist($stock);
            }

            $io->progressAdvance();
        }

        $io->progressFinish();
        $io->success(sprintf('%d articles créés/mis à jour', count($articlesData)));

        // Utilisateur admin
        $userRepository = $this->em->getRepository(User::class);
        $admin = $userRepository->findOneBy(['email' => 'admin@losombras.com']);

        if ($admin) {
            $io->info('Utilisateur admin existe déjà, mise à jour...');
            $admin->setPassword($this->passwordHasher->hashPassword($admin, 'admin123'));
            $admin->setRoles(['ROLE_JEFE']);
            $admin->setPrenom('Admin');
            $admin->setNom('Los Sombras');
            $admin->setPseudo('Admin');
        } else {
            $io->info('Création de l\'utilisateur admin...');
            $admin = new User();
            $admin->setEmail('admin@losombras.com');
            $admin->setPassword($this->passwordHasher->hashPassword($admin, 'admin123'));
            $admin->setRoles(['ROLE_JEFE']);
            $admin->setPrenom('Admin');
            $admin->setNom('Los Sombras');
            $admin->setPseudo('Admin');
            $this->em->persist($admin);
        }

        $this->em->flush();

        $io->success('Fixtures chargées avec succès !');
        $io->table(
            ['Propriété', 'Valeur'],
            [
                ['Email', 'admin@losombras.com'],
                ['Mot de passe', 'admin123'],
                ['Rôle', 'ROLE_JEFE'],
            ]
        );

        return Command::SUCCESS;
    }
}

