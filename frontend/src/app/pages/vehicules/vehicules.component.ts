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
    <div class="space-y-4 md:space-y-6 lg:space-y-8">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 class="text-2xl md:text-3xl font-bold text-gray-800">Véhicules</h1>
        <button (click)="showAddModal = true" 
                class="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm md:text-base">
          Ajouter un véhicule
        </button>
      </div>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div *ngFor="let vehicule of vehicules" 
             class="bg-white rounded-lg p-4 md:p-6 transition-all duration-300 cursor-pointer relative overflow-hidden"
             [style.border-left]="vehicule.couleur ? '6px solid ' + getColorValue(vehicule.couleur) : '6px solid #e5e7eb'"
             [style.box-shadow]="getBoxShadow(vehicule)"
             (mouseenter)="hoveredVehicule = vehicule"
             (mouseleave)="hoveredVehicule = null">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-xl font-semibold text-gray-800">{{ vehicule.plaque }}</h3>
              <p class="text-sm text-gray-600">{{ vehicule.modele }}</p>
              <div *ngIf="vehicule.couleur" class="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                   [style.backgroundColor]="getColorValue(vehicule.couleur) + '20'"
                   [style.color]="getColorValue(vehicule.couleur)"
                   [style.border]="'1px solid ' + getColorValue(vehicule.couleur) + '60'">
                <span class="inline-block w-3 h-3 rounded-full mr-2" 
                      [style.backgroundColor]="getColorValue(vehicule.couleur)"
                      [style.border]="'1px solid ' + getColorValue(vehicule.couleur) + '80'"></span>
                {{ vehicule.couleur }}
              </div>
            </div>
            <div class="flex gap-2">
              <button (click)="openEditModal(vehicule)" 
                      class="text-blue-600 hover:text-blue-800 text-sm">Modifier</button>
              <button (click)="deleteVehicule(vehicule.id)" 
                      class="text-red-600 hover:text-red-800 text-sm">Supprimer</button>
            </div>
          </div>
          
          <div class="mt-4 space-y-3">
            <div *ngIf="vehicule.proprietaire" class="flex items-center text-sm">
              <svg class="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              <span class="text-gray-500 font-medium mr-2">Propriétaire:</span>
              <span class="text-gray-800">{{ vehicule.proprietaire }}</span>
            </div>
            <div *ngIf="vehicule.emplacement" class="flex items-center text-sm">
              <svg class="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <span class="text-gray-500 font-medium mr-2">Emplacement:</span>
              <span class="text-gray-800">{{ vehicule.emplacement }}</span>
            </div>
            
            <div class="mt-3 pt-3 border-t border-gray-200">
              <h4 class="font-semibold text-gray-700 mb-2">Contenu:</h4>
              <ul class="space-y-1">
                <li *ngFor="let contenu of vehicule.contenus || []" 
                    class="text-sm text-gray-600">
                  {{ contenu?.article?.nom || 'N/A' }}: {{ (contenu?.quantite || '0') | number:'1.0-0' }} {{ contenu?.article?.unite || '' }}
                </li>
                <li *ngIf="!vehicule.contenus || vehicule.contenus.length === 0" class="text-sm text-gray-400 italic">
                  Aucun contenu
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <div *ngIf="showAddModal || showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <h2 class="text-2xl font-bold mb-4">{{ showEditModal ? 'Modifier' : 'Ajouter' }} un véhicule</h2>
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
