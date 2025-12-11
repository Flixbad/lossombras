<?php

namespace App\Repository;

use App\Entity\CombatBoxe;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<CombatBoxe>
 */
class CombatBoxeRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, CombatBoxe::class);
    }

    public function findByCombatId(string $combatId): ?CombatBoxe
    {
        return $this->findOneBy(['combatId' => $combatId]);
    }
}

