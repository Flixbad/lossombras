<?php

namespace App\Repository;

use App\Entity\VenteDrogue;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<VenteDrogue>
 */
class VenteDrogueRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, VenteDrogue::class);
    }

    /**
     * Récupère les ventes par vendeur avec total des commissions
     */
    public function findVentesByVendeur(): array
    {
        $qb = $this->createQueryBuilder('v')
            ->select([
                'v.vendeur as vendeur_id',
                'COUNT(v.id) as nb_ventes',
                'SUM(v.nbPochons) as total_pochons',
                'SUM(v.commission) as total_commission',
                'SUM(v.beneficeGroupe) as total_benefice_groupe'
            ])
            ->groupBy('v.vendeur')
            ->orderBy('total_commission', 'DESC');

        return $qb->getQuery()->getResult();
    }

    /**
     * Récupère les ventes d'un vendeur spécifique
     */
    public function findByVendeur($vendeurId): array
    {
        return $this->createQueryBuilder('v')
            ->where('v.vendeur = :vendeurId')
            ->setParameter('vendeurId', $vendeurId)
            ->orderBy('v.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }
}

