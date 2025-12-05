import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ComptabiliteService, Comptabilite } from '../../core/services/comptabilite.service';

@Component({
  selector: 'app-comptabilite',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="space-y-6 md:space-y-8">
      <div>
        <h1 class="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-orange-800 to-amber-800 bg-clip-text text-transparent mb-2">Comptabilité - Entrées/Sorties</h1>
        <p class="text-gray-600 text-sm md:text-base">Historique complet des mouvements de stock</p>
      </div>
      
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-gray-100/50">
        <div class="p-5 md:p-7 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-900">Journal des opérations</h2>
              <p class="text-xs text-gray-500">Toutes les entrées et sorties</p>
            </div>
          </div>
        </div>
        <table class="min-w-full">
          <thead>
            <tr class="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Article</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Type</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Quantité</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Utilisateur</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Commentaire</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr *ngFor="let item of comptabilite" class="hover:bg-gray-50/50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {{ item.createdAt | date:'dd/MM/yyyy HH:mm:ss' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                {{ item.article.nom }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span [class]="item.type === 'entree' ? 'px-3 py-1.5 bg-green-100 text-green-700' : 'px-3 py-1.5 bg-red-100 text-red-700'" 
                      class="text-xs font-bold rounded-lg inline-block">
                  {{ item.type === 'entree' ? 'Entrée' : 'Sortie' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                {{ item.quantite | number:'1.0-0' }} {{ item.article.unite || '' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {{ item.user?.pseudo || item.user?.email || '-' }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                {{ item.commentaire || '-' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: []
})
export class ComptabiliteComponent implements OnInit {
  comptabilite: Comptabilite[] = [];

  constructor(private comptabiliteService: ComptabiliteService) {}

  ngOnInit(): void {
    this.loadComptabilite();
  }

  loadComptabilite(): void {
    this.comptabiliteService.getComptabilite().subscribe({
      next: (data) => {
        this.comptabilite = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement de la comptabilité', err);
      }
    });
  }
}
