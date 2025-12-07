<?php

namespace App\Repository;

use App\Entity\ArgentArchive;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<ArgentArchive>
 */
class ArgentArchiveRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ArgentArchive::class);
    }

    /**
     * Trouve l'archive la plus récente
     */
    public function findLatestArchive(): ?ArgentArchive
    {
        return $this->createQueryBuilder('a')
            ->orderBy('a.dateCloture', 'DESC')
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * Trouve une archive par semaine
     */
    public function findBySemaine(string $semaine): ?ArgentArchive
    {
        return $this->createQueryBuilder('a')
            ->where('a.semaine = :semaine')
            ->setParameter('semaine', $semaine)
            ->getQuery()
            ->getOneOrNullResult();
    }
}



