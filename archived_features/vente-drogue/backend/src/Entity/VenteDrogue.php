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

    #[ORM\Column(length: 50)]
    private ?string $typeDrogue = null; // cocaine, nebula, iron_mint, violet_storm, meth

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    private ?string $montantVenteTotal = null; // Recette complète (ex: 21,000$)

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    private ?string $prixAchatUnitaire = null; // Prix d'achat unitaire (calculé selon type)
    
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
        $this->typeDrogue = 'cocaine'; // Par défaut
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

    public function getTypeDrogue(): ?string
    {
        return $this->typeDrogue;
    }

    public function setTypeDrogue(string $typeDrogue): static
    {
        $this->typeDrogue = $typeDrogue;
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
     * Calcule le nombre approximatif d'unités vendues (pochons ou unités)
     */
    public function getNbUnitesApproximatif(): ?float
    {
        if (!$this->montantVenteTotal || !$this->typeDrogue) {
            return null;
        }

        // Cette méthode sera complétée par le service de pricing
        // Pour l'instant, on garde la logique par défaut pour la cocaïne
        if ($this->typeDrogue === 'cocaine') {
            $prixVenteMoyen = 837.50; // (825 + 850) / 2
            return round((float) $this->montantVenteTotal / $prixVenteMoyen, 2);
        }

        return null;
    }
    
    /**
     * @deprecated Utiliser getNbUnitesApproximatif() à la place
     */
    public function getNbPochonsApproximatif(): ?float
    {
        return $this->getNbUnitesApproximatif();
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

    public function calculerBenefices(?\App\Service\DroguePricingService $pricingService = null): void
    {
        if ($this->montantVenteTotal === null || $this->typeDrogue === null) {
            return;
        }

        $montantVente = (float) $this->montantVenteTotal;
        
        // Si un service de pricing est fourni, l'utiliser
        if ($pricingService) {
            try {
                $costs = $pricingService->calculateCosts($this->typeDrogue, $montantVente);
                
                $this->prixAchatUnitaire = number_format($costs['prixAchatUnitaire'], 2, '.', '');
                $this->coutAchatTotal = number_format($costs['coutAchatTotal'], 2, '.', '');
                
                // Bénéfice total = recette totale - coût d'achat
                $beneficeTotal = $montantVente - $costs['coutAchatTotal'];
                $this->benefice = number_format($beneficeTotal, 2, '.', '');
                
                // Commission vendeur : 5% du bénéfice
                $commissionTotal = $beneficeTotal * 0.05;
                $this->commission = number_format($commissionTotal, 2, '.', '');
                
                // Bénéfice pour le groupe = bénéfice - commission
                $beneficeGroupeTotal = $beneficeTotal - $commissionTotal;
                $this->beneficeGroupe = number_format($beneficeGroupeTotal, 2, '.', '');
                
                return;
            } catch (\Exception $e) {
                // En cas d'erreur, utiliser la logique par défaut
            }
        }
        
        // Logique par défaut pour la cocaïne (rétrocompatibilité)
        if ($this->typeDrogue === 'cocaine' || !$this->typeDrogue) {
            $prixAchat = (float) ($this->prixAchatUnitaire ?? 625.00);
            $prixVenteMoyen = 837.50; // (825 + 850) / 2
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
    }

    #[PrePersist]
    public function onPrePersist(): void
    {
        // S'assurer que les bénéfices sont calculés avant la sauvegarde
        $this->calculerBenefices();
    }
}

