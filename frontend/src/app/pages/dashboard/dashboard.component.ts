import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { DashboardService, DashboardData } from '../../core/services/dashboard.service';
import { NotificationService } from '../../core/services/notification.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DatePipe, BaseChartDirective],
  providers: [provideCharts(withDefaultRegisterables())],
  template: `
    <div class="space-y-4 md:space-y-6 lg:space-y-8">
      <h1 class="text-2xl md:text-3xl font-bold text-gray-800">Dashboard</h1>
      
      <!-- Stats principales -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-700 mb-2">Articles</h3>
          <p class="text-3xl font-bold text-blue-600">{{ data?.stats?.totalArticles || 0 }}</p>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-700 mb-2">Véhicules</h3>
          <p class="text-3xl font-bold text-green-600">{{ data?.stats?.totalVehicules || 0 }}</p>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-700 mb-2">Utilisateurs</h3>
          <p class="text-3xl font-bold text-purple-600">{{ data?.stats?.totalUsers || 0 }}</p>
        </div>
      </div>

      <!-- Graphiques de tendances -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <!-- Tendance Stock -->
        <div class="bg-white rounded-lg shadow p-4 md:p-6">
          <h2 class="text-lg md:text-xl font-semibold text-gray-800 mb-4">Tendances Stock (7 derniers jours)</h2>
          <div class="h-48 md:h-64">
            <canvas baseChart
                    [data]="stockChartData"
                    [options]="chartOptions"
                    [type]="'line'">
            </canvas>
          </div>
        </div>

        <!-- Tendance Argent -->
        <div class="bg-white rounded-lg shadow p-4 md:p-6">
          <h2 class="text-lg md:text-xl font-semibold text-gray-800 mb-4">Tendances Argent (7 derniers jours)</h2>
          <div class="h-48 md:h-64">
            <canvas baseChart
                    [data]="argentChartData"
                    [options]="chartOptions"
                    [type]="'line'">
            </canvas>
          </div>
        </div>
      </div>

      <!-- Top 5 Articles et Dernières opérations -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <!-- Top 5 Articles -->
        <div class="bg-white rounded-lg shadow p-4 md:p-6">
          <h2 class="text-lg md:text-xl font-semibold text-gray-800 mb-4">Top 5 Articles les plus utilisés</h2>
          <div *ngIf="data?.topArticles && (data?.topArticles?.length ?? 0) > 0" class="space-y-3">
            <div *ngFor="let article of data?.topArticles; let i = index" 
                 class="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div class="flex items-center">
                <span class="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                  {{ i + 1 }}
                </span>
                <span class="font-medium text-gray-800">{{ article.nom }}</span>
              </div>
              <span class="text-gray-600 font-semibold">{{ article.quantite | number:'1.0-0' }}</span>
            </div>
          </div>
          <div *ngIf="!data?.topArticles || (data?.topArticles?.length ?? 0) === 0" class="text-gray-500 text-center py-8">
            Aucune donnée disponible
          </div>
        </div>

        <!-- Dernières opérations -->
        <div class="bg-white rounded-lg shadow p-4 md:p-6">
          <h2 class="text-lg md:text-xl font-semibold text-gray-800 mb-4">Dernières opérations</h2>
          <div class="overflow-x-auto -mx-4 md:mx-0">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-3 md:px-4 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase">Article</th>
                  <th class="px-3 md:px-4 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th class="px-3 md:px-4 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase">Qté</th>
                  <th class="hidden sm:table-cell px-3 md:px-4 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let op of data?.dernieresOperations?.slice(0, 5)">
                  <td class="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-900 truncate max-w-[120px]">{{ op?.article || 'N/A' }}</td>
                  <td class="px-3 md:px-4 py-2 md:py-3 whitespace-nowrap">
                    <span [class]="op?.type === 'entree' ? 'text-green-600' : 'text-red-600'" 
                          class="text-xs font-medium">
                      {{ op?.type === 'entree' ? 'Entrée' : 'Sortie' }}
                    </span>
                  </td>
                  <td class="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-900">{{ op?.quantite | number:'1.0-0' }}</td>
                  <td class="hidden sm:table-cell px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-500">{{ op?.user || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DashboardComponent implements OnInit, OnDestroy {
  data: DashboardData | null = null;
  refreshSubscription?: Subscription;
  
  stockChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: []
  };
  
  argentChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: []
  };

  chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  constructor(
    private dashboardService: DashboardService,
    private notificationService: NotificationService
  ) {}

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
    this.dashboardService.getDashboard().subscribe({
      next: (data) => {
        const previousAlertes = this.notificationService.getAlertes();
        const previousIds = new Set(previousAlertes.map(a => a.id));
        
        this.data = data;
        this.updateCharts();
        
        // Envoyer les alertes au service de notification
        if (data?.alertesStock) {
          this.notificationService.setAlertes(data.alertesStock);
          
          // Vérifier s'il y a de nouvelles alertes et afficher une notification
          const newAlertes = data.alertesStock.filter(a => !previousIds.has(a.id));
          if (newAlertes.length > 0) {
            // Les nouvelles alertes seront automatiquement marquées comme "new"
            // et apparaîtront avec l'animation dans la bulle
          }
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement du dashboard', err);
      }
    });
  }

  updateCharts(): void {
    if (this.data?.tendancesStock && this.data?.tendancesStock?.length > 0) {
      this.stockChartData = {
        labels: this.data.tendancesStock.map(t => t?.date || ''),
        datasets: [
          {
            label: 'Entrées',
            data: this.data.tendancesStock.map(t => t?.entrees || 0),
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            tension: 0.4
          },
          {
            label: 'Sorties',
            data: this.data.tendancesStock.map(t => t?.sorties || 0),
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            tension: 0.4
          }
        ]
      };
    }

    if (this.data?.tendancesArgent && this.data?.tendancesArgent?.length > 0) {
      this.argentChartData = {
        labels: this.data.tendancesArgent.map(t => t?.date || ''),
        datasets: [
          {
            label: 'Ajouts',
            data: this.data.tendancesArgent.map(t => t?.ajouts || 0),
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            tension: 0.4
          },
          {
            label: 'Retraits',
            data: this.data.tendancesArgent.map(t => t?.retraits || 0),
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            tension: 0.4
          }
        ]
      };
    }
  }
}
