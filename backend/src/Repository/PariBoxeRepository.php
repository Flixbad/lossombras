<?php

namespace App\Repository;

use App\Entity\PariBoxe;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<PariBoxe>
 */
class PariBoxeRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, PariBoxe::class);
    }

    /**
     * Trouve tous les paris pour un combat donné
     */
    public function findByCombatId(string $combatId): array
    {
        return $this->createQueryBuilder('p')
            ->where('p.combatId = :combatId')
            ->setParameter('combatId', $combatId)
            ->orderBy('p.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Trouve tous les paris d'un groupe
     */
    public function findByGroupe(int $groupeId): array
    {
        return $this->createQueryBuilder('p')
            ->where('p.groupe = :groupeId')
            ->setParameter('groupeId', $groupeId)
            ->orderBy('p.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Trouve tous les paris en attente
     */
    public function findEnAttente(): array
    {
        return $this->createQueryBuilder('p')
            ->where('p.statut = :statut')
            ->setParameter('statut', 'en_attente')
            ->orderBy('p.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Trouve tous les paris d'un combat avec un statut donné
     */
    public function findByCombatIdAndStatut(string $combatId, string $statut): array
    {
        return $this->createQueryBuilder('p')
            ->where('p.combatId = :combatId')
            ->andWhere('p.statut = :statut')
            ->setParameter('combatId', $combatId)
            ->setParameter('statut', $statut)
            ->getQuery()
            ->getResult();
    }
}

