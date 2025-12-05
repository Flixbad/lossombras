<?php

namespace App\Entity;

use App\Repository\VenteDrogueRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\ORM\Mapping\PrePersist;

#[ORM\Entity(repositoryClass: VenteDrogueRepository::class)]
class VenteDrogue
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $vendeur = null;

    #[ORM\Column]
    private ?int $nbPochons = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    private ?string $prixVenteUnitaire = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    private ?string $prixAchatUnitaire = null; // 625$ par défaut

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    private ?string $benefice = null; // Calculé automatiquement

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    private ?string $commission = null; // 5% du bénéfice

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    private ?string $beneficeGroupe = null; // Bénéfice - commission

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $commentaire = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->prixAchatUnitaire = '625.00'; // Prix d'achat par défaut
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getVendeur(): ?User
    {
        return $this->vendeur;
    }

    public function setVendeur(?User $vendeur): static
    {
        $this->vendeur = $vendeur;
        return $this;
    }

    public function getNbPochons(): ?int
    {
        return $this->nbPochons;
    }

    public function setNbPochons(int $nbPochons): static
    {
        $this->nbPochons = $nbPochons;
        return $this;
    }

    public function getPrixVenteUnitaire(): ?string
    {
        return $this->prixVenteUnitaire;
    }

    public function setPrixVenteUnitaire(string $prixVenteUnitaire): static
    {
        $this->prixVenteUnitaire = $prixVenteUnitaire;
        return $this;
    }

    public function getPrixAchatUnitaire(): ?string
    {
        return $this->prixAchatUnitaire;
    }

    public function setPrixAchatUnitaire(string $prixAchatUnitaire): static
    {
        $this->prixAchatUnitaire = $prixAchatUnitaire;
        return $this;
    }

    public function getBenefice(): ?string
    {
        return $this->benefice;
    }

    public function getCommission(): ?string
    {
        return $this->commission;
    }

    public function getBeneficeGroupe(): ?string
    {
        return $this->beneficeGroupe;
    }

    public function getCommentaire(): ?string
    {
        return $this->commentaire;
    }

    public function setCommentaire(?string $commentaire): static
    {
        $this->commentaire = $commentaire;
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    public function calculerBenefices(): void
    {
        if ($this->nbPochons === null || $this->prixVenteUnitaire === null || $this->prixAchatUnitaire === null) {
            return;
        }

        // Bénéfice par pochon
        $beneficeUnitaire = (float) $this->prixVenteUnitaire - (float) $this->prixAchatUnitaire;
        
        // Bénéfice total
        $beneficeTotal = $beneficeUnitaire * $this->nbPochons;
        $this->benefice = number_format($beneficeTotal, 2, '.', '');
        
        // Commission vendeur : 5% du bénéfice
        $commissionTotal = $beneficeTotal * 0.05;
        $this->commission = number_format($commissionTotal, 2, '.', '');
        
        // Bénéfice pour le groupe = bénéfice - commission
        $beneficeGroupeTotal = $beneficeTotal - $commissionTotal;
        $this->beneficeGroupe = number_format($beneficeGroupeTotal, 2, '.', '');
    }

    #[PrePersist]
    public function onPrePersist(): void
    {
        // S'assurer que les bénéfices sont calculés avant la sauvegarde
        $this->calculerBenefices();
    }
}

