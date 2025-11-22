import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArmeService, Arme } from '../../core/services/arme.service';
import { AdminService } from '../../core/services/admin.service';
import { User } from '../../core/services/auth.service';

@Component({
  selector: 'app-armes',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  template: `
    <div class="space-y-8">
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold text-gray-800">Gestion des Armes</h1>
        <div class="flex gap-4">
          <button (click)="resetAll()" 
                  class="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition">
            Remettre à zéro toutes les sorties
          </button>
          <button (click)="showAddModal = true" 
                  class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
            Ajouter une arme
          </button>
        </div>
      </div>

      <!-- Statistiques -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-700 mb-2">Total d'armes</h3>
          <p class="text-3xl font-bold text-blue-600">{{ armes.length }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-700 mb-2">Armes en sortie</h3>
          <p class="text-3xl font-bold text-red-600">{{ armesEnSortie().length }}</p>
        </div>
      </div>

      <!-- Liste des armes -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <h2 class="text-xl font-semibold text-gray-800 p-6 mb-0 border-b">Liste des armes</h2>
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">État</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sortie par</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date sortie</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commentaire</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let arme of armes">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ arme.nom }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ arme.type || '-' }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {{ arme.description || '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span [class]="arme.enSortie ? 'text-red-600' : 'text-green-600'" 
                      class="text-sm font-medium">
                  {{ arme.enSortie ? 'En sortie' : 'Disponible' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ arme.sortiePar?.pseudo || arme.sortiePar?.email || '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ arme.dateSortie ? (arme.dateSortie | date:'short') : '-' }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {{ arme.commentaireSortie || '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <button *ngIf="!arme.enSortie" (click)="openSortieModal(arme)" 
                        class="text-blue-600 hover:text-blue-800 mr-3">Sortie</button>
                <button *ngIf="arme.enSortie" (click)="retourArme(arme.id)" 
                        class="text-green-600 hover:text-green-800 mr-3">Retour</button>
                <button (click)="openEditModal(arme)" 
                        class="text-yellow-600 hover:text-yellow-800 mr-3">Modifier</button>
                <button (click)="deleteArme(arme.id)" 
                        class="text-red-600 hover:text-red-800">Supprimer</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal ajout -->
      <div *ngIf="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-8 max-w-md w-full">
          <h2 class="text-2xl font-bold mb-4">Ajouter une arme</h2>
          <form (ngSubmit)="createArme()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">Nom de l'arme *</label>
              <input type="text" [(ngModel)]="newArme.nom" name="nom" required
                     class="w-full px-4 py-2 border rounded-md">
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Type</label>
              <input type="text" [(ngModel)]="newArme.type" name="type"
                     placeholder="Ex: Pistolett, AK-47, etc."
                     class="w-full px-4 py-2 border rounded-md">
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Description</label>
              <textarea [(ngModel)]="newArme.description" name="description" rows="3"
                        class="w-full px-4 py-2 border rounded-md"></textarea>
            </div>
            <div class="flex gap-4">
              <button type="submit" class="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                Enregistrer
              </button>
              <button type="button" (click)="showAddModal = false" 
                      class="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400">
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal modification -->
      <div *ngIf="showEditModal && selectedArme" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-8 max-w-md w-full">
          <h2 class="text-2xl font-bold mb-4">Modifier l'arme</h2>
          <form (ngSubmit)="updateArme()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">Nom de l'arme *</label>
              <input type="text" [(ngModel)]="editData.nom" name="nom" required
                     class="w-full px-4 py-2 border rounded-md">
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Type</label>
              <input type="text" [(ngModel)]="editData.type" name="type"
                     class="w-full px-4 py-2 border rounded-md">
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Description</label>
              <textarea [(ngModel)]="editData.description" name="description" rows="3"
                        class="w-full px-4 py-2 border rounded-md"></textarea>
            </div>
            <div class="flex gap-4">
              <button type="submit" class="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                Modifier
              </button>
              <button type="button" (click)="showEditModal = false" 
                      class="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400">
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal sortie -->
      <div *ngIf="showSortieModal && selectedArme" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-8 max-w-md w-full">
          <h2 class="text-2xl font-bold mb-4">Sortie d'arme : {{ selectedArme.nom }}</h2>
          <form (ngSubmit)="sortieArme()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">Sortie pour la soirée par *</label>
              <select [(ngModel)]="sortieData.userId" name="userId" required
                      class="w-full px-4 py-2 border rounded-md">
                <option value="">Sélectionner un utilisateur</option>
                <option *ngFor="let user of users" [value]="user.id">
                  {{ user.pseudo || user.email }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Commentaire (optionnel)</label>
              <textarea [(ngModel)]="sortieData.commentaire" name="commentaire" rows="3"
                        placeholder="Ex: Sortie pour mission spéciale, Protection du territoire, etc."
                        class="w-full px-4 py-2 border rounded-md"></textarea>
            </div>
            <div class="flex gap-4">
              <button type="submit" class="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                Enregistrer la sortie
              </button>
              <button type="button" (click)="showSortieModal = false" 
                      class="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400">
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ArmesComponent implements OnInit {
  armes: Arme[] = [];
  users: User[] = [];
  showAddModal = false;
  showEditModal = false;
  showSortieModal = false;
  selectedArme: Arme | null = null;
  
  newArme = {
    nom: '',
    type: '',
    description: ''
  };

  editData = {
    nom: '',
    type: '',
    description: ''
  };

  sortieData = {
    userId: 0,
    commentaire: ''
  };

  constructor(
    private armeService: ArmeService,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.armeService.getArmes().subscribe({
      next: (data: Arme[]) => {
        this.armes = data;
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement', err);
      }
    });

    this.adminService.getUsers().subscribe({
      next: (data: User[]) => {
        this.users = data;
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des utilisateurs', err);
      }
    });
  }

  armesEnSortie(): Arme[] {
    return this.armes.filter(a => a.enSortie);
  }

  createArme(): void {
    this.armeService.createArme(
      this.newArme.nom,
      this.newArme.type || undefined,
      this.newArme.description || undefined
    ).subscribe({
      next: () => {
        this.showAddModal = false;
        this.newArme = { nom: '', type: '', description: '' };
        this.loadData();
      },
      error: () => {
        alert('Erreur lors de l\'ajout');
      }
    });
  }

  openEditModal(arme: Arme): void {
    this.selectedArme = arme;
    this.editData = {
      nom: arme.nom,
      type: arme.type || '',
      description: arme.description || ''
    };
    this.showEditModal = true;
  }

  updateArme(): void {
    if (!this.selectedArme) return;
    
    this.armeService.updateArme(this.selectedArme.id, this.editData).subscribe({
      next: () => {
        this.showEditModal = false;
        this.loadData();
      },
      error: () => {
        alert('Erreur lors de la modification');
      }
    });
  }

  deleteArme(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette arme ?')) {
      this.armeService.deleteArme(id).subscribe({
        next: () => {
          this.loadData();
        },
        error: () => {
          alert('Erreur lors de la suppression');
        }
      });
    }
  }

  openSortieModal(arme: Arme): void {
    this.selectedArme = arme;
    this.sortieData = { userId: 0, commentaire: '' };
    this.showSortieModal = true;
  }

  sortieArme(): void {
    if (!this.selectedArme || !this.sortieData.userId) return;
    
    this.armeService.sortieArme(
      this.selectedArme.id,
      this.sortieData.userId,
      this.sortieData.commentaire || undefined
    ).subscribe({
      next: () => {
        this.showSortieModal = false;
        this.loadData();
      },
      error: () => {
        alert('Erreur lors de l\'enregistrement de la sortie');
      }
    });
  }

  retourArme(id: number): void {
    if (confirm('Remettre cette arme en stock (retour) ?')) {
      this.armeService.retourArme(id).subscribe({
        next: () => {
          this.loadData();
        },
        error: () => {
          alert('Erreur lors du retour');
        }
      });
    }
  }

  resetAll(): void {
    if (confirm('Remettre à zéro toutes les sorties d\'armes ? Cela va libérer toutes les armes en sortie.')) {
      this.armeService.resetAll().subscribe({
        next: (response) => {
          alert(response.message);
          this.loadData();
        },
        error: () => {
          alert('Erreur lors de la remise à zéro');
        }
      });
    }
  }
}

