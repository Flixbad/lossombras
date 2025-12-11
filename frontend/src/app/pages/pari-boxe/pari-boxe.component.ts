import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PariBoxeService, PariBoxe, PariBoxeStats, CreatePariBoxeRequest, CombatBoxe, CreateCombatRequest } from '../../core/services/pari-boxe.service';
import { AdminService } from '../../core/services/admin.service';
import { User } from '../../core/services/auth.service';

@Component({
  selector: 'app-pari-boxe',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 md:space-y-8">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-red-800 to-orange-800 bg-clip-text text-transparent mb-2">
            Paris Boxe
          </h1>
          <p class="text-gray-600 text-sm md:text-base">Gestion des paris sportifs</p>
        </div>
        <button (click)="showNewCombatModal = true" 
                class="group w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl hover:from-red-700 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 font-semibold flex items-center gap-2">
          <svg class="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Nouveau Combat
        </button>
      </div>

      <!-- Sélection du combat -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-5 md:p-6 border border-gray-100/50">
        <div class="flex flex-col sm:flex-row gap-4 items-end">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-2">Combat actif :</label>
            <div class="flex gap-2">
              <select [(ngModel)]="selectedCombatId" (change)="loadCombatData()" 
                      class="flex-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500">
                <option value="">Tous les combats</option>
                <option *ngFor="let combat of combatsUniques" [value]="combat.id">
                  {{ combat.titre }}
                </option>
              </select>
              <button *ngIf="selectedCombatId" 
                      (click)="deleteCombat()"
                      class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                      title="Supprimer le combat et tous ses paris">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          </div>
          <div class="flex gap-2">
            <button *ngIf="selectedCombatId" 
                    (click)="openNewPariModal()" 
                    class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
              Nouveau Pari
            </button>
            <button *ngIf="selectedCombatId && stats && stats.parStatut.en_attente > 0" 
                    (click)="openResoudreModal()" 
                    class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Résoudre Combat
            </button>
          </div>
        </div>
      </div>

      <!-- Stats du combat -->
      <div *ngIf="stats && selectedCombatId" class="grid grid-cols-1 md:grid-cols-5 gap-5 md:gap-6">
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100/50">
          <h3 class="text-sm font-semibold text-gray-600 mb-1 uppercase">Total Paris</h3>
          <p class="text-3xl font-bold text-gray-900">{{ stats.totalParis }}</p>
        </div>
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100/50">
          <h3 class="text-sm font-semibold text-gray-600 mb-1 uppercase">Montant Total</h3>
          <p class="text-3xl font-bold text-green-600">{{ stats.montantTotal | number:'1.0-0' }} $</p>
        </div>
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100/50">
          <h3 class="text-sm font-semibold text-gray-600 mb-1 uppercase">Total Commissions</h3>
          <p class="text-3xl font-bold text-orange-600">{{ stats.totalCommissions | number:'1.0-0' }} $</p>
        </div>
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100/50">
          <h3 class="text-sm font-semibold text-gray-600 mb-1 uppercase">En Attente</h3>
          <p class="text-3xl font-bold text-yellow-600">{{ stats.parStatut.en_attente }}</p>
        </div>
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100/50">
          <h3 class="text-sm font-semibold text-gray-600 mb-1 uppercase">Résolus</h3>
          <p class="text-3xl font-bold text-blue-600">{{ stats.parStatut.gagne + stats.parStatut.perdu }}</p>
        </div>
      </div>

      <!-- Liste des paris -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 overflow-hidden">
        <div class="p-5 md:p-6 border-b border-gray-200">
          <h2 class="text-xl font-bold text-gray-900">Paris</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Groupe</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Combat</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Combatant Parié</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mise</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gain</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let pari of paris" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ pari.nomGroupe || (pari.groupe?.pseudo || pari.groupe?.email || 'N/A') }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ pari.combatTitre }}</div>
                  <div class="text-xs text-gray-500">{{ pari.combatId }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ pari.combatantParie }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ pari.montantMise | number:'1.2-2' }} $</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span [ngClass]="{
                    'bg-yellow-100 text-yellow-800': pari.statut === 'en_attente',
                    'bg-green-100 text-green-800': pari.statut === 'gagne',
                    'bg-red-100 text-red-800': pari.statut === 'perdu',
                    'bg-gray-100 text-gray-800': pari.statut === 'annule'
                  }" class="px-2 py-1 text-xs font-semibold rounded-full">
                    {{ getStatutLabel(pari.statut) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div *ngIf="pari.gainCalcule" class="text-sm font-medium text-green-600">
                    {{ pari.gainCalcule | number:'1.2-2' }} $
                  </div>
                  <div *ngIf="pari.commissionOrganisateur && pari.statut !== 'en_attente'" class="text-xs text-gray-500">
                    Comm: {{ pari.commissionOrganisateur | number:'1.2-2' }} $
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button (click)="deletePari(pari.id)"
                          class="text-red-600 hover:text-red-900">
                    Supprimer
                  </button>
                </td>
              </tr>
              <tr *ngIf="paris.length === 0">
                <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                  Aucun pari enregistré
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal Nouveau Combat -->
      <div *ngIf="showNewCombatModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" (click)="showNewCombatModal = false">
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" (click)="$event.stopPropagation()">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Nouveau Combat</h2>
          <form (ngSubmit)="createNewCombat()">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nom du Combat</label>
                <input type="text" [(ngModel)]="newCombat.nom" name="combatNom" required
                       class="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-red-500"
                       placeholder="Ex: Carlos vs Miguel">
                <p class="text-xs text-gray-500 mt-1">Ce nom servira d'identifiant unique</p>
              </div>
              <div class="flex gap-3 pt-4">
                <button type="button" (click)="showNewCombatModal = false"
                        class="flex-1 px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">
                  Annuler
                </button>
                <button type="submit"
                        class="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                  Créer
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal Nouveau Pari -->
      <div *ngIf="showNewPariModal && selectedCombatId" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" (click)="showNewPariModal = false">
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" (click)="$event.stopPropagation()">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Nouveau Pari</h2>
          <form (ngSubmit)="createPari()">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nom du Groupe</label>
                <input type="text" [(ngModel)]="newPari.nomGroupe" name="nomGroupe" required
                       class="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-red-500"
                       placeholder="Ex: Los Sombras, Vagos, etc.">
                <p class="text-xs text-gray-500 mt-1">Écrivez librement le nom du groupe</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Montant de la mise ($)</label>
                <input type="number" [(ngModel)]="newPari.montantMise" name="montantMise" required min="1" step="0.01"
                       class="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-red-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Combatant/Groupe Parié</label>
                <input type="text" [(ngModel)]="newPari.combatantParie" name="combatantParie" required
                       class="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-red-500"
                       placeholder="Nom du combatant ou groupe">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Commentaire (optionnel)</label>
                <textarea [(ngModel)]="newPari.commentaire" name="commentaire"
                          class="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-red-500" rows="3"></textarea>
              </div>
              <div class="flex gap-3 pt-4">
                <button type="button" (click)="showNewPariModal = false"
                        class="flex-1 px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">
                  Annuler
                </button>
                <button type="submit" [disabled]="creatingPari"
                        class="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50">
                  {{ creatingPari ? 'Création...' : 'Créer' }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal Résoudre Combat -->
      <div *ngIf="showResoudreModal && selectedCombatId" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" (click)="showResoudreModal = false">
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" (click)="$event.stopPropagation()">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Résoudre le Combat</h2>
          <p class="text-sm text-gray-600 mb-4">Sélectionnez le combatant/groupe gagnant pour calculer les gains.</p>
          <form (ngSubmit)="resoudreCombat()">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Combatant/Groupe Gagnant</label>
                <select [(ngModel)]="combatantGagnant" name="combatantGagnant" required
                        class="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-red-500">
                  <option value="">Sélectionner le gagnant</option>
                  <option *ngFor="let combatant of combatantsUniques" [value]="combatant">
                    {{ combatant }}
                  </option>
                </select>
              </div>
              <div *ngIf="stats" class="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <p class="text-sm text-yellow-800">
                  <strong>Attention :</strong> Cette action est irréversible. Les gains seront calculés automatiquement :
                  <br>- L'organisateur prend 25% sur le total de toutes les mises
                  <br>- Les gagnants récupèrent leur mise + part des gains (mises perdants - commission)
                  <br>- Les perdants perdent leur mise
                </p>
              </div>
              <div class="flex gap-3 pt-4">
                <button type="button" (click)="showResoudreModal = false"
                        class="flex-1 px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">
                  Annuler
                </button>
                <button type="submit" [disabled]="resolvantCombat"
                        class="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50">
                  {{ resolvantCombat ? 'Résolution...' : 'Résoudre' }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class PariBoxeComponent implements OnInit {
  paris: PariBoxe[] = [];
  stats: PariBoxeStats | null = null;
  users: User[] = [];
  selectedCombatId: string = '';
  combatantsUniques: string[] = [];
  combatsUniques: Array<{ id: string; titre: string }> = [];
  
  showNewCombatModal = false;
  showNewPariModal = false;
  showResoudreModal = false;
  creatingPari = false;
  resolvantCombat = false;
  
  newPari: CreatePariBoxeRequest = {
    nomGroupe: '',
    montantMise: 0,
    combatId: '',
    combatTitre: '',
    combatantParie: '',
    commentaire: ''
  };
  
  newCombat = { nom: '' };
  combatantGagnant = '';

  constructor(
    private pariBoxeService: PariBoxeService,
    private adminService: AdminService
  ) {}

  ngOnInit() {
    this.loadUsers();
    this.loadCombats();
    this.loadParis();
  }

  loadCombats() {
    this.pariBoxeService.getCombats().subscribe({
      next: (combats) => {
        this.combatsUniques = combats.map(c => ({ id: c.id, titre: c.titre }));
        // Si un combat est sélectionné, vérifier qu'il existe toujours
        if (this.selectedCombatId && !this.combatsUniques.find(c => c.id === this.selectedCombatId)) {
          this.selectedCombatId = '';
        }
      },
      error: (err) => console.error('Erreur lors du chargement des combats:', err)
    });
  }

  updateCombatsList() {
    // Les combats viennent maintenant de l'API
    this.loadCombats();
  }

  loadUsers() {
    this.adminService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (err) => console.error('Erreur lors du chargement des utilisateurs:', err)
    });
  }

  loadParis() {
    const combatId = this.selectedCombatId || undefined;
    this.pariBoxeService.getParis(combatId).subscribe({
      next: (paris) => {
        this.paris = paris;
        this.extractCombatants();
        if (this.selectedCombatId) {
          this.loadStats();
        }
      },
      error: (err) => console.error('Erreur lors du chargement des paris:', err)
    });
  }

  loadCombatData() {
    this.loadParis();
    if (this.selectedCombatId) {
      this.loadStats();
    } else {
      this.stats = null;
    }
  }

  loadStats() {
    if (!this.selectedCombatId) return;
    
    this.pariBoxeService.getStats(this.selectedCombatId).subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (err) => console.error('Erreur lors du chargement des stats:', err)
    });
  }


  extractCombatants() {
    if (!this.selectedCombatId) {
      this.combatantsUniques = [];
      return;
    }
    const combatantsSet = new Set<string>();
    this.paris
      .filter(p => p.combatId === this.selectedCombatId)
      .forEach(pari => combatantsSet.add(pari.combatantParie));
    this.combatantsUniques = Array.from(combatantsSet);
  }

  createNewCombat() {
    if (!this.newCombat.nom || this.newCombat.nom.trim() === '') {
      alert('Veuillez entrer un nom pour le combat');
      return;
    }
    
    const combat: CreateCombatRequest = {
      nom: this.newCombat.nom.trim()
    };
    
    this.pariBoxeService.createCombat(combat).subscribe({
      next: (nouveauCombat) => {
        this.showNewCombatModal = false;
        this.newCombat = { nom: '' };
        this.loadCombats();
        this.selectedCombatId = nouveauCombat.id;
        this.loadCombatData();
      },
      error: (err) => {
        alert(err.error?.error || 'Erreur lors de la création du combat');
      }
    });
  }

  openNewPariModal() {
    if (!this.selectedCombatId) {
      alert('Veuillez sélectionner un combat d\'abord');
      return;
    }
    const combat = this.combatsUniques.find(c => c.id === this.selectedCombatId);
    this.newPari = {
      nomGroupe: '',
      montantMise: 0,
      combatId: this.selectedCombatId,
      combatTitre: combat?.titre || '',
      combatantParie: '',
      commentaire: ''
    };
    this.showNewPariModal = true;
  }

  createPari() {
    if (!this.newPari.nomGroupe || !this.newPari.montantMise || !this.newPari.combatantParie) {
      alert('Veuillez remplir tous les champs requis');
      return;
    }

    this.creatingPari = true;
    this.pariBoxeService.createPari(this.newPari).subscribe({
      next: () => {
        this.creatingPari = false;
        this.showNewPariModal = false;
        this.loadCombatData();
        const combat = this.combatsUniques.find(c => c.id === this.selectedCombatId);
        this.newPari = {
          nomGroupe: '',
          montantMise: 0,
          combatId: this.selectedCombatId,
          combatTitre: combat?.titre || '',
          combatantParie: '',
          commentaire: ''
        };
      },
      error: (err) => {
        this.creatingPari = false;
        alert(err.error?.error || 'Erreur lors de la création du pari');
      }
    });
  }

  deletePari(id: number) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce pari ?')) return;
    
    this.pariBoxeService.deletePari(id).subscribe({
      next: () => {
        this.loadCombatData();
      },
      error: (err) => {
        alert(err.error?.error || 'Erreur lors de la suppression du pari');
      }
    });
  }

  deleteCombat() {
    if (!this.selectedCombatId) return;
    
    const combat = this.combatsUniques.find(c => c.id === this.selectedCombatId);
    const nomCombat = combat?.titre || this.selectedCombatId;
    
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le combat "${nomCombat}" et TOUS ses paris ? Cette action est irréversible.`)) {
      return;
    }
    
    this.pariBoxeService.deleteCombat(this.selectedCombatId).subscribe({
      next: (result) => {
        alert(`Combat supprimé avec succès. ${result.nbParisSupprimes} pari(s) supprimé(s).`);
        
        // Réinitialiser la sélection
        this.selectedCombatId = '';
        this.loadCombats();
        this.loadCombatData();
      },
      error: (err) => {
        alert(err.error?.error || 'Erreur lors de la suppression du combat');
      }
    });
  }

  openResoudreModal() {
    if (!this.selectedCombatId) {
      alert('Veuillez sélectionner un combat d\'abord');
      return;
    }
    this.combatantGagnant = '';
    this.showResoudreModal = true;
  }

  resoudreCombat() {
    if (!this.combatantGagnant) {
      alert('Veuillez sélectionner le gagnant');
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir résoudre ce combat ? Cette action est irréversible.')) {
      return;
    }

    this.resolvantCombat = true;
    this.pariBoxeService.resoudreCombat({
      combatId: this.selectedCombatId,
      combatantGagnant: this.combatantGagnant
    }).subscribe({
      next: (result) => {
        this.resolvantCombat = false;
        this.showResoudreModal = false;
        alert('Combat résolu avec succès !');
        this.loadCombatData();
      },
      error: (err) => {
        this.resolvantCombat = false;
        alert(err.error?.error || 'Erreur lors de la résolution du combat');
      }
    });
  }

  getStatutLabel(statut: string): string {
    const labels: { [key: string]: string } = {
      'en_attente': 'En attente',
      'gagne': 'Gagné',
      'perdu': 'Perdu',
      'annule': 'Annulé'
    };
    return labels[statut] || statut;
  }
}

