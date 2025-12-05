import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StockService, Stock, Article } from '../../core/services/stock.service';
import { HelpTooltipComponent } from '../../shared/components/help-tooltip/help-tooltip.component';

@Component({
  selector: 'app-stock-drogue',
  standalone: true,
  imports: [CommonModule, FormsModule, HelpTooltipComponent],
  template: `
    <div class="space-y-6 md:space-y-8">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-pink-800 bg-clip-text text-transparent mb-2">Stock Drogue</h1>
          <p class="text-gray-600 text-sm md:text-base">Gestion spécialisée de votre inventaire</p>
        </div>
        <button (click)="showAddModal = true" 
                class="group w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 text-sm md:text-base font-semibold flex items-center gap-2">
          <svg class="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Ajouter un article
        </button>
      </div>
      
      <!-- Filtres -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100/50">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <div>
            <label for="drogue-search" class="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">Recherche</label>
            <input id="drogue-search" type="search" [(ngModel)]="searchQuery" 
                   (input)="applyFilters()"
                   placeholder="Nom de l'article..."
                   aria-label="Rechercher un article"
                   autocomplete="off"
                   class="w-full px-3 md:px-4 py-2 text-sm md:text-base border rounded-md">
          </div>
          <div>
            <label for="drogue-type-filter" class="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">Filtrer par type</label>
            <select id="drogue-type-filter" [(ngModel)]="filterType" (change)="applyFilters()" 
                    aria-label="Filtrer les articles par type"
                    class="w-full px-3 md:px-4 py-2 text-sm md:text-base border rounded-md">
              <option value="">Tous les types</option>
              <option *ngFor="let type of uniqueTypes" [value]="type">{{ type }}</option>
            </select>
          </div>
          <div>
            <label for="drogue-sort" class="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">Trier par</label>
            <select id="drogue-sort" [(ngModel)]="sortBy" (change)="applyFilters()" 
                    aria-label="Trier les articles"
                    class="w-full px-3 md:px-4 py-2 text-sm md:text-base border rounded-md">
              <option value="nom">Nom (A-Z)</option>
              <option value="quantite-desc">Quantité (décroissant)</option>
              <option value="quantite-asc">Quantité (croissant)</option>
            </select>
          </div>
        </div>
      </div>
      
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-gray-100/50">
        <div class="overflow-x-auto">
          <table class="min-w-full" role="table" aria-label="Tableau des stocks de drogue">
            <thead>
              <tr class="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
                <th scope="col" class="px-4 md:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Article</th>
                <th scope="col" class="hidden sm:table-cell px-4 md:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Type</th>
                <th scope="col" class="px-4 md:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Quantité</th>
                <th scope="col" class="hidden md:table-cell px-4 md:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Unité</th>
                <th scope="col" class="px-4 md:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr *ngFor="let stock of filteredStocks" class="hover:bg-purple-50/30 transition-colors duration-150">
                <td class="px-4 md:px-6 py-4 text-sm font-semibold text-gray-900 truncate max-w-[150px] sm:max-w-none">{{ stock.article.nom }}</td>
                <td class="hidden sm:table-cell px-4 md:px-6 py-4 text-sm text-gray-600">{{ stock.article.type || '-' }}</td>
                <td class="px-4 md:px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 font-bold text-sm">
                    {{ stock.quantite | number:'1.0-0' }}
                  </span>
                </td>
                <td class="hidden md:table-cell px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm">
                  <button (click)="openEditUniteModal(stock)" 
                          [attr.aria-label]="'Modifier l unite de ' + stock.article.nom"
                          class="text-gray-500 hover:text-purple-600 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded px-2 py-1 hover:bg-purple-50 transition-colors flex items-center gap-1">
                    <span>{{ stock.article.unite || 'Non définie' }}</span>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </button>
                </td>
                <td class="px-4 md:px-6 py-4 whitespace-nowrap text-sm">
                  <button (click)="openEditModal(stock)" 
                          (keydown.enter)="openEditModal(stock)"
                          [attr.aria-label]="'Modifier le stock de ' + stock.article.nom"
                          class="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-md hover:shadow-lg font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
                    Modifier
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div *ngIf="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg p-6 md:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-start mb-4">
            <h2 class="text-2xl font-bold">Modifier le stock</h2>
            <button (click)="showEditModal = false" class="text-gray-400 hover:text-gray-600" aria-label="Fermer">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <!-- Information sur l'article -->
          <div class="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
            <p class="text-sm font-medium text-gray-700 mb-1">Article : <span class="font-bold text-gray-900">{{ selectedStock?.article?.nom }}</span></p>
            <p class="text-sm text-gray-600">Stock actuel : <span class="font-semibold text-purple-600">{{ selectedStock?.quantite | number:'1.0-0' }} {{ selectedStock?.article?.unite || '' }}</span></p>
          </div>

          <form (ngSubmit)="updateStock()" class="space-y-4">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <label class="block text-sm font-medium text-gray-700">Type d'opération</label>
                <app-help-tooltip text="Sélectionnez 'Entrée' pour ajouter du stock ou 'Sortie' pour en retirer. Le stock sera automatiquement mis à jour."></app-help-tooltip>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <button type="button" 
                        (click)="editData.type = 'entree'"
                        [class]="editData.type === 'entree' ? 'bg-green-600 text-white border-2 border-green-600' : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-green-500'"
                        class="px-4 py-3 rounded-md font-medium transition-all flex items-center justify-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Entrée
                </button>
                <button type="button" 
                        (click)="editData.type = 'sortie'"
                        [class]="editData.type === 'sortie' ? 'bg-red-600 text-white border-2 border-red-600' : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-red-500'"
                        class="px-4 py-3 rounded-md font-medium transition-all flex items-center justify-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                  </svg>
                  Sortie
                </button>
              </div>
              <select [(ngModel)]="editData.type" name="type" required class="hidden">
                <option value="entree">Entrée</option>
                <option value="sortie">Sortie</option>
              </select>
            </div>
            
            <div>
              <div class="flex items-center gap-2 mb-2">
                <label class="block text-sm font-medium text-gray-700">Quantité</label>
                <app-help-tooltip text="Entrez la quantité à ajouter ou retirer. La quantité doit être un nombre entier positif."></app-help-tooltip>
              </div>
              <input type="number" 
                     step="1" 
                     min="1" 
                     [(ngModel)]="editData.quantite" 
                     name="quantite" 
                     required
                     (input)="calculateNewStock()"
                     [class.border-red-500]="hasError()"
                     class="w-full px-4 py-2 border-2 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors">
              <p *ngIf="hasError()" class="mt-1 text-sm text-red-600 flex items-center gap-1">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                {{ getErrorMessage() }}
              </p>
              
              <!-- Prévisualisation -->
              <div *ngIf="!hasError() && editData.quantite && selectedStock" 
                   class="mt-3 p-3 rounded-lg border-2"
                   [class.bg-green-50]="editData.type === 'entree'"
                   [class.border-green-200]="editData.type === 'entree'"
                   [class.bg-red-50]="editData.type === 'sortie'"
                   [class.border-red-200]="editData.type === 'sortie'">
                <p class="text-sm font-medium mb-1">
                  {{ editData.type === 'entree' ? 'Stock après ajout :' : 'Stock après retrait :' }}
                </p>
                <p class="text-lg font-bold"
                   [class.text-green-700]="editData.type === 'entree'"
                   [class.text-red-700]="editData.type === 'sortie'">
                  {{ getNewStock() | number:'1.0-0' }} {{ selectedStock?.article?.unite || '' }}
                </p>
              </div>
            </div>
            
            <div>
              <div class="flex items-center gap-2 mb-2">
                <label class="block text-sm font-medium text-gray-700">Commentaire (optionnel)</label>
                <app-help-tooltip text="Ajoutez une note expliquant la raison de cette modification (ex: 'Livraison fournisseur', 'Vente client', etc.)."></app-help-tooltip>
              </div>
              <textarea [(ngModel)]="editData.commentaire" 
                        name="commentaire"
                        placeholder="Ex: Livraison fournisseur, Vente client, Stock initial..."
                        rows="3"
                        class="w-full px-4 py-2 border-2 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"></textarea>
            </div>
            
            <div class="flex gap-4 pt-2">
              <button type="submit" 
                      [disabled]="hasError() || !editData.quantite"
                      [class.opacity-50]="hasError() || !editData.quantite"
                      [class.cursor-not-allowed]="hasError() || !editData.quantite"
                      class="flex-1 bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Valider
              </button>
              <button type="button" 
                      (click)="showEditModal = false" 
                      class="flex-1 bg-gray-300 text-gray-700 py-3 rounded-md hover:bg-gray-400 transition-colors font-medium">
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div *ngIf="showEditUniteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg p-6 md:p-8 max-w-md w-full">
          <div class="flex justify-between items-start mb-4">
            <h2 class="text-2xl font-bold">Modifier l'unité</h2>
            <button (click)="showEditUniteModal = false" class="text-gray-400 hover:text-gray-600" aria-label="Fermer">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
            <p class="text-sm font-medium text-gray-700">Article : <span class="font-bold text-gray-900">{{ selectedArticleForUnite?.nom }}</span></p>
            <p class="text-sm text-gray-600 mt-1">Unité actuelle : <span class="font-semibold text-purple-600">{{ selectedArticleForUnite?.unite || 'Non définie' }}</span></p>
          </div>

          <form (ngSubmit)="updateUnite()" class="space-y-4">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <label class="block text-sm font-medium text-gray-700">Nouvelle unité</label>
                <app-help-tooltip text="Sélectionnez l'unité de mesure pour cet article. Exemples : kg pour les poids, L pour les liquides, 'unité' pour compter des objets, % pour les pourcentages."></app-help-tooltip>
              </div>
              <select [(ngModel)]="newUnite" 
                      name="unite"
                      required
                      class="w-full px-4 py-3 border-2 rounded-md text-base focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors">
                <option value="">Sélectionner une unité...</option>
                <option value="kg">kg (kilogramme) - Pour les poids</option>
                <option value="L">L (litre) - Pour les liquides</option>
                <option value="unité">unité - Pour compter des objets</option>
                <option value="%">% (pourcentage) - Pour les pourcentages</option>
              </select>
              <p class="mt-2 text-xs text-gray-500">
                💡 Astuce : Utilisez "kg" pour les matières en poids, "L" pour les liquides, "unité" pour compter des objets individuels.
              </p>
            </div>
            
            <div class="flex gap-4 pt-2">
              <button type="submit" 
                      [disabled]="!newUnite"
                      [class.opacity-50]="!newUnite"
                      [class.cursor-not-allowed]="!newUnite"
                      class="flex-1 bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Enregistrer
              </button>
              <button type="button" 
                      (click)="showEditUniteModal = false" 
                      class="flex-1 bg-gray-300 text-gray-700 py-3 rounded-md hover:bg-gray-400 transition-colors font-medium">
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div *ngIf="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg p-6 md:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-start mb-4">
            <h2 class="text-2xl font-bold">Ajouter un article</h2>
            <button (click)="showAddModal = false" class="text-gray-400 hover:text-gray-600" aria-label="Fermer">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form (ngSubmit)="createArticle()" class="space-y-4">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <label class="block text-sm font-medium text-gray-700">Nom de l'article *</label>
                <app-help-tooltip text="Entrez le nom de l'article (ex: 'Engrais', 'Nebula Pots', etc.). Ce champ est obligatoire."></app-help-tooltip>
              </div>
              <input type="text" 
                     [(ngModel)]="newArticle.nom" 
                     name="nom" 
                     required
                     placeholder="Ex: Engrais, Nebula Pots..."
                     class="w-full px-4 py-2 border-2 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors">
            </div>
            
            <div>
              <div class="flex items-center gap-2 mb-2">
                <label class="block text-sm font-medium text-gray-700">Type (optionnel)</label>
                <app-help-tooltip text="Catégorisez votre article (ex: 'Matière première', 'Produit fini')."></app-help-tooltip>
              </div>
              <select [(ngModel)]="newArticle.type" 
                      name="type"
                      class="w-full px-4 py-2 border-2 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors">
                <option value="">Sélectionner un type...</option>
                <option value="Matière première">Matière première</option>
                <option value="Produit fini">Produit fini</option>
              </select>
            </div>
            
            <div>
              <div class="flex items-center gap-2 mb-2">
                <label class="block text-sm font-medium text-gray-700">Unité (optionnel)</label>
                <app-help-tooltip text="Unité de mesure de l'article (ex: 'kg', 'L', 'unité')."></app-help-tooltip>
              </div>
              <select [(ngModel)]="newArticle.unite" 
                      name="unite"
                      class="w-full px-4 py-2 border-2 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors">
                <option value="">Sélectionner une unité...</option>
                <option value="kg">kg (kilogramme) - Pour les poids</option>
                <option value="L">L (litre) - Pour les liquides</option>
                <option value="unité">unité - Pour compter des objets</option>
                <option value="%">% (pourcentage) - Pour les pourcentages</option>
              </select>
              <p class="mt-2 text-xs text-gray-500">
                💡 Astuce : Utilisez "kg" pour les matières en poids, "L" pour les liquides, "unité" pour compter des objets individuels.
              </p>
            </div>
            
            <div>
              <div class="flex items-center gap-2 mb-2">
                <label class="block text-sm font-medium text-gray-700">Quantité initiale</label>
                <app-help-tooltip text="Stock initial de l'article. Vous pourrez le modifier plus tard si nécessaire."></app-help-tooltip>
              </div>
              <input type="number" 
                     step="1" 
                     min="0" 
                     [(ngModel)]="newArticle.quantiteInitiale" 
                     name="quantiteInitiale" 
                     value="0"
                     class="w-full px-4 py-2 border-2 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors">
            </div>
            
            <div class="flex gap-4 pt-2">
              <button type="submit" 
                      [disabled]="!newArticle.nom"
                      [class.opacity-50]="!newArticle.nom"
                      [class.cursor-not-allowed]="!newArticle.nom"
                      class="flex-1 bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Créer l'article
              </button>
              <button type="button" 
                      (click)="showAddModal = false" 
                      class="flex-1 bg-gray-300 text-gray-700 py-3 rounded-md hover:bg-gray-400 transition-colors font-medium">
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
export class StockDrogueComponent implements OnInit {
  stocks: Stock[] = [];
  filteredStocks: Stock[] = [];
  showEditModal = false;
  showEditUniteModal = false;
  showAddModal = false;
  selectedStock: Stock | null = null;
  selectedArticleForUnite: Article | null = null;
  newUnite: string = '';
  
  searchQuery: string = '';
  filterType: string = '';
  sortBy: string = 'nom';
  uniqueTypes: string[] = [];
  
  editData = {
    quantite: '',
    type: 'entree',
    commentaire: ''
  };
  
  newArticle = {
    nom: '',
    type: '',
    unite: '',
    quantiteInitiale: 0
  };

  constructor(private stockService: StockService) {}

  ngOnInit(): void {
    this.loadStocks();
  }

  loadStocks(): void {
    this.stockService.getStocks().subscribe({
      next: (stocks) => {
        // Filtrer uniquement les articles de drogue
        this.stocks = stocks.filter(stock => this.isDrogueArticle(stock.article));
        this.uniqueTypes = [...new Set(this.stocks.map(s => s.article.type).filter((t): t is string => !!t))];
        this.applyFilters();
      },
      error: (err) => {
        console.error('Erreur lors du chargement du stock drogue', err);
      }
    });
  }

  isDrogueArticle(article: Article): boolean {
    const nom = article.nom.toLowerCase();
    const droguesKeywords = [
      'pots', 'pochon', 'tête', 'meth', 'coke', 'nebula', 'iron', 'violet storm',
      'engrais', 'eau', 'fertilizant'
    ];
    return droguesKeywords.some(keyword => nom.includes(keyword));
  }

  applyFilters(): void {
    let filtered = [...this.stocks];
    
    // Recherche par nom
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        s.article.nom.toLowerCase().includes(query)
      );
    }
    
    // Filtre par type
    if (this.filterType) {
      filtered = filtered.filter(s => s.article.type === this.filterType);
    }
    
    // Tri
    filtered.sort((a, b) => {
      if (this.sortBy === 'nom') {
        return a.article.nom.localeCompare(b.article.nom);
      } else if (this.sortBy === 'quantite-desc') {
        return parseFloat(b.quantite) - parseFloat(a.quantite);
      } else if (this.sortBy === 'quantite-asc') {
        return parseFloat(a.quantite) - parseFloat(b.quantite);
      }
      return 0;
    });
    
    this.filteredStocks = filtered;
  }

  openEditModal(stock: Stock): void {
    this.selectedStock = stock;
    this.editData.quantite = '';
    this.editData.type = 'entree';
    this.editData.commentaire = '';
    this.showEditModal = true;
  }

  openEditUniteModal(stock: Stock): void {
    this.selectedArticleForUnite = stock.article;
    this.newUnite = stock.article.unite || '';
    this.showEditUniteModal = true;
  }

  updateUnite(): void {
    if (!this.selectedArticleForUnite || !this.newUnite) return;
    
    this.stockService.updateArticle(this.selectedArticleForUnite.id, {
      unite: this.newUnite
    }).subscribe({
      next: () => {
        this.showEditUniteModal = false;
        this.showSuccessMessage('Unité modifiée avec succès !');
        this.loadStocks();
      },
      error: (err) => {
        alert('Erreur lors de la modification de l\'unité');
        console.error(err);
      }
    });
  }

  calculateNewStock(): void {
    // Cette méthode est appelée lors de la saisie pour recalculer
  }

  getNewStock(): number {
    if (!this.selectedStock || !this.editData.quantite) return 0;
    const current = parseFloat(this.selectedStock.quantite);
    const change = parseFloat(this.editData.quantite);
    if (this.editData.type === 'entree') {
      return current + change;
    } else {
      return current - change;
    }
  }

  hasError(): boolean {
    if (!this.selectedStock || !this.editData.quantite) return false;
    const change = parseFloat(this.editData.quantite);
    if (isNaN(change) || change <= 0) return true;
    if (this.editData.type === 'sortie') {
      const current = parseFloat(this.selectedStock.quantite);
      return change > current;
    }
    return false;
  }

  getErrorMessage(): string {
    if (!this.editData.quantite) return '';
    const change = parseFloat(this.editData.quantite);
    if (isNaN(change) || change <= 0) {
      return 'La quantité doit être un nombre positif';
    }
    if (this.editData.type === 'sortie' && this.selectedStock) {
      const current = parseFloat(this.selectedStock.quantite);
      if (change > current) {
        const currentFormatted = Math.round(current).toString();
        return 'Stock insuffisant ! Stock disponible : ' + currentFormatted;
      }
    }
    return '';
  }

  updateStock(): void {
    if (!this.selectedStock || this.hasError()) return;
    
    this.stockService.updateStock(
      this.selectedStock.id,
      this.editData.quantite,
      this.editData.type,
      this.editData.commentaire
    ).subscribe({
      next: () => {
        this.showEditModal = false;
        this.showSuccessMessage('Stock mis à jour avec succès !');
        this.loadStocks();
      },
      error: (err) => {
        if (err.error?.error) {
          alert('Erreur : ' + err.error.error);
        } else {
          alert('Erreur lors de la mise à jour du stock');
        }
      }
    });
  }

  createArticle(): void {
    this.stockService.createArticle(this.newArticle).subscribe({
      next: () => {
        this.showAddModal = false;
        this.showSuccessMessage('Article créé avec succès !');
        this.newArticle = { nom: '', type: '', unite: '', quantiteInitiale: 0 };
        this.loadStocks();
      },
      error: (err) => {
        alert('Erreur lors de la création de l\'article');
      }
    });
  }

  showSuccessMessage(text: string = 'Stock mis à jour avec succès !'): void {
    const message = document.createElement('div');
    message.className = 'fixed top-4 right-4 bg-purple-600 text-white px-6 py-4 rounded-lg shadow-lg z-50 flex items-center gap-3 animate-slide-in';
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'w-6 h-6');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('viewBox', '0 0 24 24');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('d', 'M5 13l4 4L19 7');
    svg.appendChild(path);
    
    const span = document.createElement('span');
    span.className = 'font-medium';
    span.textContent = text;
    
    message.appendChild(svg);
    message.appendChild(span);
    document.body.appendChild(message);
    
    setTimeout(() => {
      message.style.animation = 'slide-out 0.3s ease-out';
      setTimeout(() => message.remove(), 300);
    }, 3000);
  }
}

