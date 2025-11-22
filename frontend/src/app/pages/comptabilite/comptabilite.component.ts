import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ComptabiliteService, Comptabilite } from '../../core/services/comptabilite.service';

@Component({
  selector: 'app-comptabilite',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="space-y-8">
      <h1 class="text-3xl font-bold text-gray-800">Comptabilité - Entrées/Sorties</h1>
      
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Article</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantité</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commentaire</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let item of comptabilite">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ item.createdAt | date:'dd/MM/yyyy HH:mm:ss' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ item.article.nom }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span [class]="item.type === 'entree' ? 'text-green-600' : 'text-red-600'" 
                      class="text-sm font-medium">
                  {{ item.type === 'entree' ? 'Entrée' : 'Sortie' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ item.quantite | number:'1.0-0' }} {{ item.article.unite || '' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ item.user?.pseudo || item.user?.email || '-' }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
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
