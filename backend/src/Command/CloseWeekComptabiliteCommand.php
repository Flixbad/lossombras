<?php

namespace App\Command;

use App\Entity\ComptabiliteArchive;
use App\Repository\ComptabiliteRepository;
use App\Repository\ComptabiliteArchiveRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:close-week-comptabilite',
    description: 'Ferme la semaine de comptabilité produit : archive et efface l\'historique',
)]
class CloseWeekComptabiliteCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private ComptabiliteRepository $comptabiliteRepo,
        private ComptabiliteArchiveRepository $archiveRepo
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        // Compter les opérations
        $allComptabilites = $this->comptabiliteRepo->findAll();
        $nbOperations = count($allComptabilites);

        // Obtenir la semaine actuelle (ISO 8601)
        $now = new \DateTimeImmutable();
        $year = (int) $now->format('Y');
        $week = (int) $now->format('W');
        $semaineKey = sprintf('%d-W%02d', $year, $week);

        // Vérifier si cette semaine a déjà été clôturée
        $existingArchive = $this->archiveRepo->findBySemaine($semaineKey);
        if ($existingArchive) {
            $io->warning(sprintf(
                'La semaine %s a déjà été clôturée. Opérations archivées : %d',
                $semaineKey,
                $existingArchive->getNbOperations()
            ));
            return Command::FAILURE;
        }

        // Créer l'archive
        $archive = new ComptabiliteArchive();
        $archive->setDateCloture($now);
        $archive->setSemaine($semaineKey);
        $archive->setNbOperations($nbOperations);
        $archive->setCommentaire(sprintf('Clôture automatique de la semaine %s (%d opérations)', $semaineKey, $nbOperations));

        $this->entityManager->persist($archive);

        // Supprimer toutes les opérations
        foreach ($allComptabilites as $comptabilite) {
            $this->entityManager->remove($comptabilite);
        }

        $this->entityManager->flush();

        $io->success(sprintf(
            'Semaine %s clôturée avec succès ! %d opérations supprimées. Historique effacé.',
            $semaineKey,
            $nbOperations
        ));

        return Command::SUCCESS;
    }
}




