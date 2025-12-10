<?php

namespace App\Entity;

use App\Repository\PariBoxeRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PariBoxeRepository::class)]
class PariBoxe
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $groupe = null; // Le groupe qui parie

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    private ?string $montantMise = null; // Montant total misé

    #[ORM\Column(length: 255)]
    private ?string $combatId = null; // Identifiant du combat (ex: "combat_2025_01")

    #[ORM\Column(length: 255)]
    private ?string $combatTitre = null; // Titre du combat (ex: "Carlos vs Miguel")

    #[ORM\Column(length: 255)]
    private ?string $combatantParie = null; // Nom du combatant/groupe sur lequel on parie

    #[ORM\Column(length: 50)]
    private ?string $statut = null; // en_attente, gagne, perdu, annule

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2, nullable: true)]
    private ?string $gainCalcule = null; // Gain calculé si gagnant

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2, nullable: true)]
    private ?string $commissionOrganisateur = null; // Commission de l'organisateur (15% ou 25%)

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $commentaire = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $updatedAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->statut = 'en_attente';
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getGroupe(): ?User
    {
        return $this->groupe;
    }

    public function setGroupe(?User $groupe): static
    {
        $this->groupe = $groupe;
        return $this;
    }

    public function getMontantMise(): ?string
    {
        return $this->montantMise;
    }

    public function setMontantMise(string $montantMise): static
    {
        $this->montantMise = $montantMise;
        return $this;
    }

    public function getCombatId(): ?string
    {
        return $this->combatId;
    }

    public function setCombatId(string $combatId): static
    {
        $this->combatId = $combatId;
        return $this;
    }

    public function getCombatTitre(): ?string
    {
        return $this->combatTitre;
    }

    public function setCombatTitre(string $combatTitre): static
    {
        $this->combatTitre = $combatTitre;
        return $this;
    }

    public function getCombatantParie(): ?string
    {
        return $this->combatantParie;
    }

    public function setCombatantParie(string $combatantParie): static
    {
        $this->combatantParie = $combatantParie;
        return $this;
    }

    public function getStatut(): ?string
    {
        return $this->statut;
    }

    public function setStatut(string $statut): static
    {
        $this->statut = $statut;
        $this->updatedAt = new \DateTimeImmutable();
        return $this;
    }

    public function getGainCalcule(): ?string
    {
        return $this->gainCalcule;
    }

    public function setGainCalcule(?string $gainCalcule): static
    {
        $this->gainCalcule = $gainCalcule;
        return $this;
    }

    public function getCommissionOrganisateur(): ?string
    {
        return $this->commissionOrganisateur;
    }

    public function setCommissionOrganisateur(?string $commissionOrganisateur): static
    {
        $this->commissionOrganisateur = $commissionOrganisateur;
        return $this;
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

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(?\DateTimeImmutable $updatedAt): static
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }
}

