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
    <div class="space-y-6 md:space-y-8 lg:space-y-10">
      <div class="mb-6">
        <h1 class="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-2">Dashboard</h1>
        <p class="text-gray-600 text-sm md:text-base">Vue d'ensemble de votre gestion</p>
      </div>
      
      <!-- Stats principales -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        <div class="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100/50 overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-blue-600/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div class="relative z-10">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
              </div>
            </div>
            <h3 class="text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wider">Articles</h3>
            <p class="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">{{ data?.stats?.totalArticles || 0 }}</p>
          </div>
        </div>
        
        <div class="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100/50 overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-green-600/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div class="relative z-10">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path>
                </svg>
              </div>
            </div>
            <h3 class="text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wider">Véhicules</h3>
            <p class="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">{{ data?.stats?.totalVehicules || 0 }}</p>
          </div>
        </div>
        
        <div class="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100/50 overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-purple-600/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div class="relative z-10">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
              </div>
            </div>
            <h3 class="text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wider">Utilisateurs</h3>
            <p class="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">{{ data?.stats?.totalUsers || 0 }}</p>
          </div>
        </div>
      </div>

      <!-- Graphiques de tendances -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">
        <!-- Tendance Stock -->
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-5 md:p-7 border border-gray-100/50">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <div>
              <h2 class="text-lg md:text-xl font-bold text-gray-900">Tendances Stock</h2>
              <p class="text-xs text-gray-500">7 derniers jours</p>
            </div>
          </div>
          <div class="h-48 md:h-64">
            <canvas baseChart
                    [data]="stockChartData"
                    [options]="chartOptions"
                    [type]="'line'">
            </canvas>
          </div>
        </div>

        <!-- Tendance Argent -->
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-5 md:p-7 border border-gray-100/50">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <h2 class="text-lg md:text-xl font-bold text-gray-900">Tendances Argent</h2>
              <p class="text-xs text-gray-500">7 derniers jours</p>
            </div>
          </div>
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
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">
        <!-- Top 5 Articles -->
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-5 md:p-7 border border-gray-100/50">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
              </svg>
            </div>
            <div>
              <h2 class="text-lg md:text-xl font-bold text-gray-900">Top 5 Articles</h2>
              <p class="text-xs text-gray-500">Les plus utilisés</p>
            </div>
          </div>
          <div *ngIf="data?.topArticles && (data?.topArticles?.length ?? 0) > 0" class="space-y-3">
            <div *ngFor="let article of data?.topArticles; let i = index" 
                 class="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200">
              <div class="flex items-center gap-4">
                <span class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl flex items-center justify-center font-bold shadow-md group-hover:scale-110 transition-transform">
                  {{ i + 1 }}
                </span>
                <span class="font-semibold text-gray-900">{{ article.nom }}</span>
              </div>
              <span class="px-3 py-1.5 bg-blue-50 text-blue-700 font-bold rounded-lg">{{ article.quantite | number:'1.0-0' }}</span>
            </div>
          </div>
          <div *ngIf="!data?.topArticles || (data?.topArticles?.length ?? 0) === 0" class="text-center py-12">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
              </svg>
            </div>
            <p class="text-gray-500 font-medium">Aucune donnée disponible</p>
          </div>
        </div>

        <!-- Dernières opérations -->
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-5 md:p-7 border border-gray-100/50">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <h2 class="text-lg md:text-xl font-bold text-gray-900">Dernières opérations</h2>
              <p class="text-xs text-gray-500">Activité récente</p>
            </div>
          </div>
          <div class="overflow-x-auto -mx-4 md:mx-0">
            <table class="min-w-full">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Article</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Qté</th>
                  <th class="hidden sm:table-cell px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr *ngFor="let op of data?.dernieresOperations?.slice(0, 5)" class="hover:bg-gray-50/50 transition-colors">
                  <td class="px-4 py-3 text-sm font-medium text-gray-900 truncate max-w-[120px]">{{ op?.article || 'N/A' }}</td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <span [class]="op?.type === 'entree' ? 'px-2.5 py-1 bg-green-100 text-green-700' : 'px-2.5 py-1 bg-red-100 text-red-700'" 
                          class="text-xs font-semibold rounded-lg inline-block">
                      {{ op?.type === 'entree' ? 'Entrée' : 'Sortie' }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-sm font-bold text-gray-900">{{ op?.quantite | number:'1.0-0' }}</td>
                  <td class="hidden sm:table-cell px-4 py-3 text-sm text-gray-600">{{ op?.user || '-' }}</td>
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

