<?php

namespace App\Entity;

use App\Repository\ComptabiliteArchiveRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ComptabiliteArchiveRepository::class)]
#[ORM\Table(name: 'comptabilite_archive')]
class ComptabiliteArchive
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    private ?\DateTimeImmutable $dateCloture = null;

    #[ORM\Column(length: 10)]
    private ?string $semaine = null; // Format: YYYY-WW (ex: 2025-W01)

    #[ORM\Column]
    private ?int $nbOperations = null; // Nombre d'opérations archivées

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $commentaire = null;

    #[ORM\ManyToOne]
    private ?User $closedBy = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->dateCloture = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDateCloture(): ?\DateTimeImmutable
    {
        return $this->dateCloture;
    }

    public function setDateCloture(\DateTimeImmutable $dateCloture): static
    {
        $this->dateCloture = $dateCloture;
        return $this;
    }

    public function getSemaine(): ?string
    {
        return $this->semaine;
    }

    public function setSemaine(string $semaine): static
    {
        $this->semaine = $semaine;
        return $this;
    }

    public function getNbOperations(): ?int
    {
        return $this->nbOperations;
    }

    public function setNbOperations(int $nbOperations): static
    {
        $this->nbOperations = $nbOperations;
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

    public function getClosedBy(): ?User
    {
        return $this->closedBy;
    }

    public function setClosedBy(?User $closedBy): static
    {
        $this->closedBy = $closedBy;
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
}



