import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VehiculeService, Vehicule, ContenuVehicule } from '../../core/services/vehicule.service';
import { StockService, Article } from '../../core/services/stock.service';

@Component({
  selector: 'app-vehicules',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 md:space-y-8">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-emerald-800 to-teal-800 bg-clip-text text-transparent mb-2">Véhicules</h1>
          <p class="text-gray-600 text-sm md:text-base">Gestion de votre parc automobile</p>
        </div>
        <button (click)="showAddModal = true" 
                class="group w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 text-sm md:text-base font-semibold flex items-center gap-2">
          <svg class="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Ajouter un véhicule
        </button>
      </div>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        <div *ngFor="let vehicule of vehicules" 
             class="group bg-white/80 backdrop-blur-sm rounded-2xl p-5 md:p-6 transition-all duration-300 cursor-pointer relative overflow-hidden shadow-lg hover:shadow-2xl border border-gray-100/50"
             [style.border-left]="vehicule.couleur ? '4px solid ' + getColorValue(vehicule.couleur) : '4px solid #e5e7eb'"
             (mouseenter)="hoveredVehicule = vehicule"
             (mouseleave)="hoveredVehicule = null">
             <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div class="relative z-10">
            <div class="flex justify-between items-start mb-5">
              <div class="flex-1">
                <h3 class="text-xl font-bold text-gray-900 mb-1">{{ vehicule.plaque }}</h3>
                <p class="text-sm text-gray-600 font-medium">{{ vehicule.modele }}</p>
                <div *ngIf="vehicule.couleur" class="mt-3 inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm"
                     [style.backgroundColor]="getColorValue(vehicule.couleur) + '15'"
                     [style.color]="getColorValue(vehicule.couleur)"
                     [style.border]="'1.5px solid ' + getColorValue(vehicule.couleur) + '40'">
                  <span class="inline-block w-2.5 h-2.5 rounded-full mr-2" 
                        [style.backgroundColor]="getColorValue(vehicule.couleur)"></span>
                  {{ vehicule.couleur }}
                </div>
              </div>
              <div class="flex gap-2 ml-3">
                <button (click)="openEditModal(vehicule)" 
                        class="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                </button>
                <button (click)="deleteVehicule(vehicule.id)" 
                        class="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>
          
            <div class="mt-5 space-y-3">
              <div *ngIf="vehicule.proprietaire" class="flex items-center p-3 bg-gray-50 rounded-xl">
                <div class="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                  <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <div>
                  <p class="text-xs text-gray-500 font-medium">Propriétaire</p>
                  <p class="text-sm font-semibold text-gray-900">{{ vehicule.proprietaire }}</p>
                </div>
              </div>
              <div *ngIf="vehicule.emplacement" class="flex items-center p-3 bg-gray-50 rounded-xl">
                <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                  <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </div>
                <div>
                  <p class="text-xs text-gray-500 font-medium">Emplacement</p>
                  <p class="text-sm font-semibold text-gray-900">{{ vehicule.emplacement }}</p>
                </div>
              </div>
              
              <div class="mt-4 pt-4 border-t border-gray-200">
                <h4 class="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">Contenu</h4>
                <ul class="space-y-2">
                  <li *ngFor="let contenu of vehicule.contenus || []" 
                      class="flex items-center justify-between p-2.5 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100">
                    <span class="text-sm font-medium text-gray-900">{{ contenu?.article?.nom || 'N/A' }}</span>
                    <span class="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold">
                      {{ (contenu?.quantite || '0') | number:'1.0-0' }} {{ contenu?.article?.unite || '' }}
                    </span>
                  </li>
                  <li *ngIf="!vehicule.contenus || vehicule.contenus.length === 0" class="text-center py-4 text-sm text-gray-400 italic">
                    Aucun contenu
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div *ngIf="showAddModal || showEditModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
        <div class="bg-white rounded-2xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 animate-in slide-in-from-bottom-4 duration-300">
          <div class="mb-6">
            <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{{ showEditModal ? 'Modifier' : 'Ajouter' }} un véhicule</h2>
            <p class="text-sm text-gray-500">Gestion des informations du véhicule</p>
          </div>
          <form (ngSubmit)="saveVehicule()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">Plaque</label>
              <input type="text" [(ngModel)]="vehiculeData.plaque" name="plaque" required
                     class="w-full px-4 py-2 border rounded-md">
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Modèle</label>
              <input type="text" [(ngModel)]="vehiculeData.modele" name="modele" required
                     class="w-full px-4 py-2 border rounded-md">
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Couleur</label>
              <select [(ngModel)]="vehiculeData.couleur" name="couleur"
                      class="w-full px-4 py-2 border rounded-md">
                <option value="">Aucune couleur</option>
                <option value="Rouge">Rouge</option>
                <option value="Bleu">Bleu</option>
                <option value="Noir">Noir</option>
                <option value="Blanc">Blanc</option>
                <option value="Gris">Gris</option>
                <option value="Vert">Vert</option>
                <option value="Jaune">Jaune</option>
                <option value="Orange">Orange</option>
                <option value="Violet">Violet</option>
                <option value="Rose">Rose</option>
                <option value="Marron">Marron</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Propriétaire</label>
              <input type="text" [(ngModel)]="vehiculeData.proprietaire" name="proprietaire"
                     placeholder="Nom du propriétaire"
                     class="w-full px-4 py-2 border rounded-md">
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Emplacement</label>
              <input type="text" [(ngModel)]="vehiculeData.emplacement" name="emplacement"
                     placeholder="Où se trouve le véhicule ?"
                     class="w-full px-4 py-2 border rounded-md">
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-2">Contenu du véhicule</label>
              <div *ngFor="let contenu of vehiculeData.contenus; let i = index" class="flex gap-2 mb-2">
                <select [(ngModel)]="contenu.articleId" [name]="'article-' + i" required
                        class="flex-1 px-4 py-2 border rounded-md">
                  <option value="">Sélectionner un article</option>
                  <option *ngFor="let article of articles" [value]="article.id">
                    {{ article.nom }}
                  </option>
                </select>
                <input type="number" step="0.01" [(ngModel)]="contenu.quantite" [name]="'quantite-' + i" 
                       placeholder="Quantité" required
                       class="w-32 px-4 py-2 border rounded-md">
                <button type="button" (click)="removeContenu(i)" 
                        class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                  Supprimer
                </button>
              </div>
              <button type="button" (click)="addContenu()" 
                      class="mt-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                Ajouter un article
              </button>
            </div>
            
            <div class="flex gap-4">
              <button type="submit" class="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                {{ showEditModal ? 'Modifier' : 'Créer' }}
              </button>
              <button type="button" (click)="closeModal()" 
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
export class VehiculesComponent implements OnInit {
  vehicules: Vehicule[] = [];
  articles: Article[] = [];
  showAddModal = false;
  showEditModal = false;
  selectedVehicule: Vehicule | null = null;
  hoveredVehicule: Vehicule | null = null;
  
  vehiculeData = {
    plaque: '',
    modele: '',
    couleur: '',
    proprietaire: '',
    emplacement: '',
    contenus: [] as Array<{ articleId: number | null; quantite: string }>
  };

  constructor(
    private vehiculeService: VehiculeService,
    private stockService: StockService
  ) {}

  ngOnInit(): void {
    this.loadVehicules();
    this.loadArticles();
  }

  loadVehicules(): void {
    this.vehiculeService.getVehicules().subscribe({
      next: (vehicules) => {
        this.vehicules = vehicules;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des véhicules', err);
      }
    });
  }

  loadArticles(): void {
    this.stockService.getArticles().subscribe({
      next: (articles) => {
        this.articles = articles;
      }
    });
  }

  openEditModal(vehicule: Vehicule): void {
    this.selectedVehicule = vehicule;
    this.vehiculeData = {
      plaque: vehicule.plaque || '',
      modele: vehicule.modele || '',
      couleur: vehicule.couleur || '',
      proprietaire: vehicule.proprietaire || '',
      emplacement: vehicule.emplacement || '',
      contenus: vehicule.contenus?.map(c => ({
        articleId: c.article?.id || null,
        quantite: c.quantite || '0'
      })) || []
    };
    if (this.vehiculeData.contenus.length === 0) {
      this.addContenu();
    }
    this.showEditModal = true;
  }

  addContenu(): void {
    this.vehiculeData.contenus.push({ articleId: null, quantite: '0' });
  }

  removeContenu(index: number): void {
    this.vehiculeData.contenus.splice(index, 1);
  }

  closeModal(): void {
    this.showAddModal = false;
    this.showEditModal = false;
    this.selectedVehicule = null;
    this.vehiculeData = { plaque: '', modele: '', couleur: '', proprietaire: '', emplacement: '', contenus: [] };
  }

  saveVehicule(): void {
    const contenusValides = this.vehiculeData.contenus
      .filter(c => c.articleId !== null && c.articleId !== undefined && c.articleId !== 0);
    
    const data: any = {
      plaque: this.vehiculeData.plaque?.trim() || '',
      modele: this.vehiculeData.modele?.trim() || '',
      couleur: this.vehiculeData.couleur?.trim() || null,
      proprietaire: this.vehiculeData.proprietaire?.trim() || null,
      emplacement: this.vehiculeData.emplacement?.trim() || null,
      contenus: contenusValides.map(c => ({
        articleId: Number(c.articleId),
        quantite: String(c.quantite || '0')
      }))
    };
    
    // Si les champs optionnels sont vides, les mettre à null
    if (data.couleur === '') {
      data.couleur = null;
    }
    if (data.proprietaire === '') {
      data.proprietaire = null;
    }
    if (data.emplacement === '') {
      data.emplacement = null;
    }

    if (this.showEditModal && this.selectedVehicule) {
      this.vehiculeService.updateVehicule(this.selectedVehicule.id, data).subscribe({
        next: () => {
          this.closeModal();
          this.loadVehicules();
        },
        error: (err) => {
          console.error('Erreur lors de la modification du véhicule:', err);
          const errorMessage = err?.error?.error || err?.error?.message || 'Erreur lors de la modification du véhicule';
          alert(errorMessage);
        }
      });
    } else {
      this.vehiculeService.createVehicule(data).subscribe({
        next: () => {
          this.closeModal();
          this.loadVehicules();
        },
        error: (err) => {
          console.error('Erreur lors de la création du véhicule:', err);
          const errorMessage = err?.error?.error || err?.error?.message || 'Erreur lors de la création du véhicule';
          alert(errorMessage);
        }
      });
    }
  }

  getColorValue(couleur: string): string {
    const colors: { [key: string]: string } = {
      'Rouge': '#ef4444',
      'Bleu': '#3b82f6',
      'Noir': '#000000',
      'Blanc': '#ffffff',
      'Gris': '#6b7280',
      'Vert': '#10b981',
      'Jaune': '#eab308',
      'Orange': '#f97316',
      'Violet': '#a855f7',
      'Rose': '#ec4899',
      'Marron': '#92400e'
    };
    return colors[couleur] || '#e5e7eb';
  }

  getBoxShadow(vehicule: Vehicule): string {
    if (this.hoveredVehicule?.id === vehicule.id && vehicule.couleur) {
      const color = this.getColorValue(vehicule.couleur);
      // Convertir hex en rgba pour l'ombre
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `0 20px 25px -5px rgba(${r}, ${g}, ${b}, 0.4), 0 10px 10px -5px rgba(${r}, ${g}, ${b}, 0.2)`;
    }
    return '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
  }

  deleteVehicule(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) {
      this.vehiculeService.deleteVehicule(id).subscribe({
        next: () => {
          this.loadVehicules();
        },
        error: () => {
          alert('Erreur lors de la suppression du véhicule');
        }
      });
    }
  }
}
