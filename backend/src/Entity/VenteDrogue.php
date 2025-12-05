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

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    private ?string $montantVenteTotal = null; // Recette complète (ex: 21,000$)

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    private ?string $prixAchatUnitaire = null; // 625$ par défaut
    
    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2, nullable: true)]
    private ?string $coutAchatTotal = null; // Coût total d'achat calculé automatiquement

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
        $this->prixAchatUnitaire = '625.00'; // Prix d'achat par pochon par défaut
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

    public function getMontantVenteTotal(): ?string
    {
        return $this->montantVenteTotal;
    }

    public function setMontantVenteTotal(string $montantVenteTotal): static
    {
        $this->montantVenteTotal = $montantVenteTotal;
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

    public function getCoutAchatTotal(): ?string
    {
        return $this->coutAchatTotal;
    }

    public function setCoutAchatTotal(?string $coutAchatTotal): static
    {
        $this->coutAchatTotal = $coutAchatTotal;
        return $this;
    }
    
    /**
     * Calcule le nombre approximatif de pochons vendus
     */
    public function getNbPochonsApproximatif(): ?float
    {
        if (!$this->montantVenteTotal || !$this->prixAchatUnitaire) {
            return null;
        }
        // Calcul approximatif basé sur un prix de vente moyen entre 825-850$
        $prixVenteMoyen = 837.50; // (825 + 850) / 2
        return round((float) $this->montantVenteTotal / $prixVenteMoyen, 2);
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
        if ($this->montantVenteTotal === null || $this->prixAchatUnitaire === null) {
            return;
        }

        $montantVente = (float) $this->montantVenteTotal;
        $prixAchat = (float) $this->prixAchatUnitaire;
        
        // Calculer le nombre approximatif de pochons vendus
        // Prix de vente moyen estimé entre 825-850$ = 837.50$
        $prixVenteMoyen = 837.50;
        $nbPochonsApproximatif = $montantVente / $prixVenteMoyen;
        
        // Coût total d'achat
        $coutAchat = $nbPochonsApproximatif * $prixAchat;
        $this->coutAchatTotal = number_format($coutAchat, 2, '.', '');
        
        // Bénéfice total = recette totale - coût d'achat
        $beneficeTotal = $montantVente - $coutAchat;
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

