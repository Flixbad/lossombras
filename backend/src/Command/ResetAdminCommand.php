<?php

namespace App\Command;

use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:reset-admin',
    description: 'Remet le rôle ROLE_JEFE à l\'utilisateur admin@losombras.com'
)]
class ResetAdminCommand extends Command
{
    public function __construct(
        private UserRepository $userRepo,
        private EntityManagerInterface $em
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $user = $this->userRepo->findOneBy(['email' => 'admin@losombras.com']);

        if (!$user) {
            $io->error('Utilisateur admin@losombras.com introuvable !');
            return Command::FAILURE;
        }

        $user->setRoles(['ROLE_JEFE']);
        $this->em->flush();

        $io->success(sprintf(
            'Rôle ROLE_JEFE remis à %s (ID: %d, Pseudo: %s)',
            $user->getEmail(),
            $user->getId(),
            $user->getPseudo() ?? 'non défini'
        ));

        return Command::SUCCESS;
    }
}
