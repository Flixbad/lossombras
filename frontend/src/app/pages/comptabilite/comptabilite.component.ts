import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComptabiliteService, Comptabilite } from '../../core/services/comptabilite.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-comptabilite',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
  template: `
    <div class="space-y-6 md:space-y-8">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-orange-800 to-amber-800 bg-clip-text text-transparent mb-2">Comptabilité - Entrées/Sorties</h1>
          <p class="text-gray-600 text-sm md:text-base">Historique complet des mouvements de stock</p>
        </div>
        <button *ngIf="canCloseWeek()" 
                (click)="showCloseWeekModal = true" 
                class="group w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 font-semibold flex items-center gap-2">
          <svg class="w-5 h-5 group-hover:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Clôturer la semaine
        </button>
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

      <!-- Modal clôture semaine -->
      <div *ngIf="showCloseWeekModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
        <div class="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 animate-in slide-in-from-bottom-4 duration-300">
          <div class="flex justify-between items-start mb-6">
            <div>
              <h2 class="text-2xl font-bold text-gray-900 mb-1">Clôturer la semaine</h2>
              <p class="text-sm text-gray-500">Archiver et effacer l'historique</p>
            </div>
            <button (click)="showCloseWeekModal = false" class="text-gray-400 hover:text-gray-600" aria-label="Fermer">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200/50 rounded-xl p-5 mb-6 shadow-sm">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-600">Opérations à supprimer</p>
                <p class="text-2xl font-bold text-orange-700">
                  {{ comptabilite.length || 0 }} opération(s)
                </p>
              </div>
            </div>
            <p class="text-xs text-gray-600 mt-3">
              ⚠️ Cette action va :<br>
              • Archiver le nombre d'opérations ({{ comptabilite.length || 0 }})<br>
              • Supprimer toutes les opérations de l'historique<br>
              • Réinitialiser l'historique pour la nouvelle semaine<br>
              • Améliorer les performances en réduisant les données
            </p>
          </div>

          <form (ngSubmit)="closeWeek()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Commentaire (optionnel)</label>
              <textarea [(ngModel)]="closeWeekComment" 
                        name="closeWeekComment" 
                        rows="3"
                        placeholder="Ex: Clôture de la semaine, nettoyage de l'historique..."
                        class="w-full px-4 py-2 border-2 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"></textarea>
            </div>
            
            <div class="flex gap-4 pt-2">
              <button type="submit" 
                      [disabled]="closingWeek || comptabilite.length === 0"
                      [class.opacity-50]="closingWeek || comptabilite.length === 0"
                      [class.cursor-not-allowed]="closingWeek || comptabilite.length === 0"
                      class="flex-1 bg-orange-600 text-white py-3 rounded-md hover:bg-orange-700 transition-colors font-medium flex items-center justify-center gap-2">
                <svg *ngIf="closingWeek" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{{ closingWeek ? 'Clôture en cours...' : 'Clôturer la semaine' }}</span>
              </button>
              <button type="button" 
                      (click)="showCloseWeekModal = false"
                      [disabled]="closingWeek"
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
export class ComptabiliteComponent implements OnInit {
  comptabilite: Comptabilite[] = [];
  showCloseWeekModal = false;
  closingWeek = false;
  closeWeekComment = '';

  constructor(
    private comptabiliteService: ComptabiliteService,
    private authService: AuthService
  ) {}

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

  closeWeek(): void {
    if (!confirm('⚠️ Êtes-vous sûr de vouloir clôturer la semaine ? Cette action est irréversible et effacera tout l\'historique.')) {
      return;
    }

    this.closingWeek = true;
    this.comptabiliteService.closeWeek(this.closeWeekComment || undefined).subscribe({
      next: (response) => {
        this.closingWeek = false;
        this.showCloseWeekModal = false;
        this.closeWeekComment = '';
        this.showSuccessCloseMessage(response.nbOperationsSupprimees, response.semaine);
        this.loadComptabilite(); // Recharger les données
      },
      error: (err) => {
        this.closingWeek = false;
        console.error('Erreur lors de la clôture', err);
        if (err.status === 401) {
          alert('Votre session a expiré. Veuillez vous reconnecter.');
        } else {
          alert(err.error?.error || 'Erreur lors de la clôture de la semaine');
        }
      }
    });
  }

  canCloseWeek(): boolean {
    const user = this.authService.getCurrentUser();
    if (!user || !user.roles) {
      return false;
    }

    const authorizedRoles = [
      'ROLE_CAPITAN',
      'ROLE_ALFERES',
      'ROLE_COMANDANTE',
      'ROLE_SEGUNDO',
      'ROLE_JEFE'
    ];

    return user.roles.some(role => authorizedRoles.includes(role));
  }

  showSuccessCloseMessage(nbOperations: number, semaine: string): void {
    const message = document.createElement('div');
    message.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg z-50 flex items-center gap-3 max-w-md';
    message.innerHTML = `
      <svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
      <div>
        <p class="font-medium">Semaine ${semaine} clôturée avec succès !</p>
        <p class="text-sm opacity-90">${nbOperations} opération(s) supprimée(s)</p>
      </div>
    `;
    document.body.appendChild(message);
    setTimeout(() => {
      message.style.opacity = '0';
      message.style.transition = 'opacity 0.3s ease-out';
      setTimeout(() => message.remove(), 300);
    }, 5000);
  }
}
