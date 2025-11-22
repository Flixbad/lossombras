import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ArgentService, Argent, ArgentStats } from '../../core/services/argent.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-comptabilite-argent',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, BaseChartDirective],
  providers: [provideCharts(withDefaultRegisterables())],
  template: `
    <div class="space-y-8">
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold text-gray-800">Comptabilité Financière</h1>
        <button (click)="showAddModal = true" 
                class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
          Ajouter une opération
        </button>
      </div>

      <!-- Sélection période -->
      <div class="bg-white rounded-lg shadow p-4">
        <div class="flex items-center gap-4">
          <label class="text-sm font-medium text-gray-700">Période :</label>
          <select [(ngModel)]="selectedPeriod" (change)="loadData()" 
                  class="px-4 py-2 border rounded-md">
            <option value="jour">Par jour</option>
            <option value="semaine">Par semaine</option>
            <option value="mois">Par mois</option>
          </select>
          <span class="text-sm text-gray-500 ml-auto">
            Dernière mise à jour : {{ lastUpdate | date:'dd/MM/yyyy HH:mm:ss' }}
          </span>
        </div>
      </div>

      <!-- Statistiques -->
      <div *ngIf="stats" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-700 mb-2">Total Ajouté</h3>
          <p class="text-3xl font-bold text-green-600">{{ stats.totalAjoute | number:'1.0-0' }} €</p>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-700 mb-2">Total Retiré</h3>
          <p class="text-3xl font-bold text-red-600">{{ stats.totalRetire | number:'1.0-0' }} €</p>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-700 mb-2">Solde</h3>
          <p class="text-3xl font-bold" [class]="stats.solde >= 0 ? 'text-blue-600' : 'text-red-600'">
            {{ stats.solde | number:'1.0-0' }} €
          </p>
        </div>
      </div>

      <!-- Graphiques -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">
            {{ selectedPeriod === 'jour' ? 'Évolution par jour' : 
               selectedPeriod === 'semaine' ? 'Évolution par semaine' : 
               'Évolution par mois' }}
          </h2>
          <div class="h-64">
            <canvas baseChart
                    [data]="lineChartData"
                    [options]="lineChartOptions"
                    [type]="'line'">
            </canvas>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">Répartition ajouts/retraits</h2>
          <div class="h-64 flex items-center justify-center">
            <canvas baseChart
                    [data]="doughnutChartData"
                    [options]="doughnutChartOptions"
                    [type]="'doughnut'">
            </canvas>
          </div>
        </div>
      </div>

      <!-- Tableau des opérations -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <h2 class="text-xl font-semibold text-gray-800 p-6 mb-0 border-b">Historique des opérations</h2>
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commentaire</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let item of argentList">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ item.createdAt | date:'dd/MM/yyyy HH:mm:ss' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span [class]="item.type === 'ajout' ? 'text-green-600' : 'text-red-600'" 
                      class="text-sm font-medium">
                  {{ item.type === 'ajout' ? 'Ajout' : 'Retrait' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ item.montant | number:'1.0-0' }} €
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ item.user?.pseudo || item.user?.email || '-' }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {{ item.commentaire || '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <button (click)="deleteArgent(item.id)" 
                        class="text-red-600 hover:text-red-800">Supprimer</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal ajout opération -->
      <div *ngIf="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-8 max-w-md w-full">
          <h2 class="text-2xl font-bold mb-4">Ajouter une opération</h2>
          <form (ngSubmit)="createArgent()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">Type d'opération</label>
              <select [(ngModel)]="newOperation.type" name="type" required
                      class="w-full px-4 py-2 border rounded-md">
                <option value="ajout">Ajout d'argent</option>
                <option value="retrait">Retrait d'argent</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Montant (€)</label>
              <input type="number" step="1" min="1" [(ngModel)]="newOperation.montant" name="montant" required
                     class="w-full px-4 py-2 border rounded-md">
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Commentaire (pourquoi ajouter/retirer)</label>
              <textarea [(ngModel)]="newOperation.commentaire" name="commentaire" rows="3"
                        placeholder="Ex: Vente de produits, Achat de matériel, etc."
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
    </div>
  `,
  styles: []
})
export class ComptabiliteArgentComponent implements OnInit, OnDestroy {
  argentList: Argent[] = [];
  stats: ArgentStats | null = null;
  showAddModal = false;
  selectedPeriod: 'jour' | 'semaine' | 'mois' = 'mois';
  lastUpdate = new Date();
  private refreshSubscription?: Subscription;
  
  newOperation = {
    type: 'ajout',
    montant: 0,
    commentaire: ''
  };

  lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: []
  };

  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        enabled: true
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  doughnutChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Ajouts', 'Retraits'],
    datasets: [{
      data: [0, 0],
      backgroundColor: ['#10b981', '#ef4444']
    }]
  };

  doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom'
      },
      tooltip: {
        enabled: true
      }
    }
  };

  constructor(private argentService: ArgentService) {}

  ngOnInit(): void {
    this.loadData();
    // Rafraîchissement automatique toutes les minutes
    this.refreshSubscription = interval(60000).subscribe(() => {
      this.loadData();
    });
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  loadData(): void {
    this.argentService.getArgent().subscribe({
      next: (data: Argent[]) => {
        this.argentList = data;
        this.lastUpdate = new Date();
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement', err);
        // Ne pas déconnecter l'utilisateur en cas d'erreur
      }
    });

    this.argentService.getStats(this.selectedPeriod).subscribe({
      next: (stats: ArgentStats) => {
        this.stats = stats;
        this.updateCharts();
        this.lastUpdate = new Date();
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des stats', err);
        // Ne pas déconnecter l'utilisateur en cas d'erreur
      }
    });
  }

  updateCharts(): void {
    if (!this.stats) return;

    // Graphique en ligne - Évolution par jour, semaine ou mois
    let periodsData: { [key: string]: { ajout: number; retrait: number } };
    
    if (this.selectedPeriod === 'jour') {
      periodsData = this.stats.parJour || {};
    } else if (this.selectedPeriod === 'semaine') {
      periodsData = this.stats.parSemaine || {};
    } else {
      periodsData = this.stats.parMois;
    }
    
    const periods = Object.keys(periodsData).sort();
    const ajouts = periods.map(p => Math.round(periodsData[p].ajout));
    const retraits = periods.map(p => Math.round(periodsData[p].retrait));

    // Formater les labels selon la période
    const labels = periods.map(p => {
      if (this.selectedPeriod === 'jour') {
        // Format: "DD/MM/YYYY"
        const [year, month, day] = p.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
      } else if (this.selectedPeriod === 'semaine') {
        // Format: "Semaine SXX MM"
        const [year, week] = p.split('-W');
        const date = new Date(parseInt(year), 0, 1 + (parseInt(week) - 1) * 7);
        return `S${week} ${date.toLocaleDateString('fr-FR', { month: 'short' })}`;
      } else {
        // Format: "MMM YYYY"
        const [year, month] = p.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
      }
    });

    this.lineChartData = {
      labels: labels,
      datasets: [
        {
          data: ajouts,
          label: 'Ajouts',
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4
        },
        {
          data: retraits,
          label: 'Retraits',
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4
        }
      ]
    };

    // Graphique en donut
    this.doughnutChartData = {
      labels: ['Ajouts', 'Retraits'],
      datasets: [{
        data: [Math.round(this.stats.totalAjoute), Math.round(this.stats.totalRetire)],
        backgroundColor: ['#10b981', '#ef4444']
      }]
    };
  }

  createArgent(): void {
    this.argentService.createArgent(
      this.newOperation.type,
      this.newOperation.montant,
      this.newOperation.commentaire
    ).subscribe({
      next: () => {
        this.showAddModal = false;
        this.newOperation = { type: 'ajout', montant: 0, commentaire: '' };
        this.loadData(); // Recharge automatiquement les données
      },
      error: (err) => {
        console.error('Erreur lors de l\'enregistrement', err);
        if (err.status === 401) {
          alert('Votre session a expiré. Veuillez vous reconnecter.');
        } else {
          alert('Erreur lors de l\'enregistrement');
        }
      }
    });
  }

  deleteArgent(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette opération ?')) {
      this.argentService.deleteArgent(id).subscribe({
        next: () => {
          this.loadData();
        },
        error: () => {
          alert('Erreur lors de la suppression');
        }
      });
    }
  }
}
