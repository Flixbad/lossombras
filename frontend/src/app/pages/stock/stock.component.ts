import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StockService, Stock, Article } from '../../core/services/stock.service';

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4 md:space-y-6 lg:space-y-8">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 class="text-2xl md:text-3xl font-bold text-gray-800">Stock Général</h1>
        <button (click)="showAddModal = true" 
                class="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm md:text-base">
          Ajouter un article
        </button>
      </div>
      
      <!-- Filtres -->
      <div class="bg-white rounded-lg shadow p-3 md:p-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <div>
            <label for="stock-search" class="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">Recherche</label>
            <input id="stock-search" type="search" [(ngModel)]="searchQuery" 
                   (input)="applyFilters()"
                   placeholder="Nom de l'article..."
                   aria-label="Rechercher un article"
                   autocomplete="off"
                   class="w-full px-3 md:px-4 py-2 text-sm md:text-base border rounded-md">
          </div>
          <div>
            <label for="stock-type-filter" class="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">Filtrer par type</label>
            <select id="stock-type-filter" [(ngModel)]="filterType" (change)="applyFilters()" 
                    aria-label="Filtrer les articles par type"
                    class="w-full px-3 md:px-4 py-2 text-sm md:text-base border rounded-md">
              <option value="">Tous les types</option>
              <option *ngFor="let type of uniqueTypes" [value]="type">{{ type }}</option>
            </select>
          </div>
          <div>
            <label for="stock-sort" class="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">Trier par</label>
            <select id="stock-sort" [(ngModel)]="sortBy" (change)="applyFilters()" 
                    aria-label="Trier les articles"
                    class="w-full px-3 md:px-4 py-2 text-sm md:text-base border rounded-md">
              <option value="nom">Nom (A-Z)</option>
              <option value="quantite-desc">Quantité (décroissant)</option>
              <option value="quantite-asc">Quantité (croissant)</option>
            </select>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200" role="table" aria-label="Tableau des stocks">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase">Article</th>
                <th scope="col" class="hidden sm:table-cell px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th scope="col" class="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantité</th>
                <th scope="col" class="hidden md:table-cell px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase">Unité</th>
                <th scope="col" class="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let stock of filteredStocks">
                <td class="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium text-gray-900 truncate max-w-[150px] sm:max-w-none">{{ stock.article.nom }}</td>
                <td class="hidden sm:table-cell px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-500">{{ stock.article.type || '-' }}</td>
                <td class="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-900 font-semibold">{{ stock.quantite | number:'1.0-0' }}</td>
                <td class="hidden md:table-cell px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-500">{{ stock.article.unite || '-' }}</td>
                <td class="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm">
                  <button (click)="openEditModal(stock)" 
                          (keydown.enter)="openEditModal(stock)"
                          [attr.aria-label]="'Modifier le stock de ' + stock.article.nom"
                          class="text-blue-600 hover:text-blue-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-1">Modifier</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div *ngIf="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-8 max-w-md w-full">
          <h2 class="text-2xl font-bold mb-4">Modifier le stock</h2>
          <form (ngSubmit)="updateStock()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">Type d'opération</label>
              <select [(ngModel)]="editData.type" name="type" required
                      class="w-full px-4 py-2 border rounded-md">
                <option value="entree">Entrée</option>
                <option value="sortie">Sortie</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Quantité</label>
              <input type="number" step="1" min="1" [(ngModel)]="editData.quantite" name="quantite" required
                     class="w-full px-4 py-2 border rounded-md">
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Commentaire</label>
              <textarea [(ngModel)]="editData.commentaire" name="commentaire"
                        class="w-full px-4 py-2 border rounded-md"></textarea>
            </div>
            <div class="flex gap-4">
              <button type="submit" class="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                Valider
              </button>
              <button type="button" (click)="showEditModal = false" 
                      class="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400">
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div *ngIf="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-8 max-w-md w-full">
          <h2 class="text-2xl font-bold mb-4">Ajouter un article</h2>
          <form (ngSubmit)="createArticle()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">Nom</label>
              <input type="text" [(ngModel)]="newArticle.nom" name="nom" required
                     class="w-full px-4 py-2 border rounded-md">
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Type</label>
              <input type="text" [(ngModel)]="newArticle.type" name="type"
                     class="w-full px-4 py-2 border rounded-md">
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Unité</label>
              <input type="text" [(ngModel)]="newArticle.unite" name="unite"
                     class="w-full px-4 py-2 border rounded-md">
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Quantité initiale</label>
              <input type="number" step="1" min="0" [(ngModel)]="newArticle.quantiteInitiale" name="quantiteInitiale" value="0"
                     class="w-full px-4 py-2 border rounded-md">
            </div>
            <div class="flex gap-4">
              <button type="submit" class="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                Créer
              </button>
              <button type="button" (click)="showAddModal = false" 
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
export class StockComponent implements OnInit {
  stocks: Stock[] = [];
  filteredStocks: Stock[] = [];
  showEditModal = false;
  showAddModal = false;
  selectedStock: Stock | null = null;
  
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
    // Écouter la recherche globale
    window.addEventListener('globalSearch', (event: any) => {
      this.searchQuery = event.detail.query;
      this.applyFilters();
    });
  }

  loadStocks(): void {
    this.stockService.getStocks().subscribe({
      next: (stocks) => {
        this.stocks = stocks;
        this.uniqueTypes = [...new Set(stocks.map(s => s.article.type).filter((t): t is string => !!t))];
        this.applyFilters();
      },
      error: (err) => {
        console.error('Erreur lors du chargement du stock', err);
      }
    });
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

  updateStock(): void {
    if (!this.selectedStock) return;
    
    this.stockService.updateStock(
      this.selectedStock.id,
      this.editData.quantite,
      this.editData.type,
      this.editData.commentaire
    ).subscribe({
      next: () => {
        this.showEditModal = false;
        this.loadStocks();
      },
      error: (err) => {
        alert('Erreur lors de la mise à jour du stock');
      }
    });
  }

  createArticle(): void {
    this.stockService.createArticle(this.newArticle).subscribe({
      next: () => {
        this.showAddModal = false;
        this.newArticle = { nom: '', type: '', unite: '', quantiteInitiale: 0 };
        this.loadStocks();
      },
      error: (err) => {
        alert('Erreur lors de la création de l\'article');
      }
    });
  }
}
