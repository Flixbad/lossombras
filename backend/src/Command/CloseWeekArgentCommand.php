<?php

namespace App\Command;

use App\Entity\Argent;
use App\Entity\ArgentArchive;
use App\Repository\ArgentRepository;
use App\Repository\ArgentArchiveRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:close-week-argent',
    description: 'Ferme la semaine de comptabilité argent : archive le solde et efface l\'historique',
)]
class CloseWeekArgentCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private ArgentRepository $argentRepo,
        private ArgentArchiveRepository $archiveRepo
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        // Calculer le solde actuel
        $allArgent = $this->argentRepo->findAll();
        $solde = 0;

        foreach ($allArgent as $argent) {
            $montant = (float) $argent->getMontant();
            if ($argent->getType() === 'ajout') {
                $solde += $montant;
            } elseif ($argent->getType() === 'retrait') {
                $solde -= $montant;
            }
        }

        // Obtenir la semaine actuelle (ISO 8601)
        $now = new \DateTimeImmutable();
        $year = (int) $now->format('Y');
        $week = (int) $now->format('W');
        $semaineKey = sprintf('%d-W%02d', $year, $week);

        // Vérifier si cette semaine a déjà été clôturée
        $existingArchive = $this->archiveRepo->findBySemaine($semaineKey);
        if ($existingArchive) {
            $io->warning(sprintf('La semaine %s a déjà été clôturée. Solde archivé : %s €', $semaineKey, $existingArchive->getSolde()));
            return Command::FAILURE;
        }

        // Créer l'archive
        $archive = new ArgentArchive();
        $archive->setSolde((string) $solde);
        $archive->setDateCloture($now);
        $archive->setSemaine($semaineKey);
        $archive->setCommentaire(sprintf('Clôture automatique de la semaine %s', $semaineKey));

        $this->entityManager->persist($archive);

        // Supprimer toutes les opérations
        foreach ($allArgent as $argent) {
            $this->entityManager->remove($argent);
        }

        // Si le solde est positif, créer une nouvelle opération "ajout" avec le solde
        if ($solde > 0) {
            $nouvelArgent = new Argent();
            $nouvelArgent->setType('ajout');
            $nouvelArgent->setMontant((string) $solde);
            $nouvelArgent->setCommentaire(sprintf('Solde reporté de la semaine %s', $semaineKey));
            $this->entityManager->persist($nouvelArgent);
        }

        $this->entityManager->flush();

        $io->success(sprintf(
            'Semaine %s clôturée avec succès ! Solde archivé : %s €. Historique effacé.',
            $semaineKey,
            number_format($solde, 2, ',', ' ')
        ));

        return Command::SUCCESS;
    }
}



