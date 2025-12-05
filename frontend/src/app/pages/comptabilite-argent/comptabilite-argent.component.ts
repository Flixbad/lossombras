import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ArgentService, Argent, ArgentStats } from '../../core/services/argent.service';
import { VenteDrogueService, VenteDrogue, VenteDrogueStats } from '../../core/services/vente-drogue.service';
import { AdminService } from '../../core/services/admin.service';
import { User } from '../../core/services/auth.service';
import { HelpTooltipComponent } from '../../shared/components/help-tooltip/help-tooltip.component';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-comptabilite-argent',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, BaseChartDirective, HelpTooltipComponent],
  providers: [provideCharts(withDefaultRegisterables())],
  template: `
    <div class="space-y-6 md:space-y-8">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-green-800 to-emerald-800 bg-clip-text text-transparent mb-2">Comptabilité Financière</h1>
          <p class="text-gray-600 text-sm md:text-base">Suivi complet de vos finances</p>
        </div>
        <div class="flex flex-col sm:flex-row gap-3">
          <button (click)="showAddModal = true" 
                  class="group w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 font-semibold flex items-center gap-2">
            <svg class="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Ajouter une opération
          </button>
          <button (click)="showCloseWeekModal = true" 
                  class="group w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 font-semibold flex items-center gap-2">
            <svg class="w-5 h-5 group-hover:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Clôturer la semaine
          </button>
        </div>
      </div>

      <!-- Sélection période -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-5 md:p-6 border border-gray-100/50">
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
      <div *ngIf="stats" class="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
        <div class="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100/50 overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-emerald-600/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div class="relative z-10">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
              </div>
            </div>
            <h3 class="text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wider">Total Ajouté</h3>
            <p class="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">{{ stats.totalAjoute | number:'1.0-0' }} €</p>
          </div>
        </div>
        
        <div class="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100/50 overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-400/20 to-red-600/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div class="relative z-10">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                </svg>
              </div>
            </div>
            <h3 class="text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wider">Total Retiré</h3>
            <p class="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">{{ stats.totalRetire | number:'1.0-0' }} €</p>
          </div>
        </div>
        
        <div class="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100/50 overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"
               [ngClass]="stats.solde >= 0 ? 'bg-gradient-to-br from-blue-400/20 to-blue-600/10' : 'bg-gradient-to-br from-red-400/20 to-red-600/10'"></div>
          <div class="relative z-10">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                   [ngClass]="stats.solde >= 0 ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-red-500 to-red-600'">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                </svg>
              </div>
            </div>
            <h3 class="text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wider">Solde</h3>
            <p class="text-4xl font-bold bg-clip-text text-transparent"
               [ngClass]="stats.solde >= 0 ? 'bg-gradient-to-r from-blue-600 to-blue-700' : 'bg-gradient-to-r from-red-600 to-red-700'">
              {{ stats.solde | number:'1.0-0' }} €
            </p>
          </div>
        </div>
      </div>

      <!-- Graphiques -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-5 md:p-7 border border-gray-100/50">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <div>
              <h2 class="text-lg md:text-xl font-bold text-gray-900">
                {{ selectedPeriod === 'jour' ? 'Évolution par jour' : 
                   selectedPeriod === 'semaine' ? 'Évolution par semaine' : 
                   'Évolution par mois' }}
              </h2>
              <p class="text-xs text-gray-500">Analyse des tendances</p>
            </div>
          </div>
          <div class="h-64">
            <canvas baseChart
                    [data]="lineChartData"
                    [options]="lineChartOptions"
                    [type]="'bar'">
            </canvas>
          </div>
        </div>

        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-5 md:p-7 border border-gray-100/50">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path>
              </svg>
            </div>
            <div>
              <h2 class="text-lg md:text-xl font-bold text-gray-900">Total ajouts/retraits</h2>
              <p class="text-xs text-gray-500">Comparaison des montants</p>
            </div>
          </div>
          <div class="h-64 flex items-center justify-center">
            <canvas baseChart
                    [data]="doughnutChartData"
                    [options]="doughnutChartOptions"
                    [type]="'bar'">
            </canvas>
          </div>
        </div>
      </div>

      <!-- Section Ventes de Drogue -->
      <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg border border-purple-100/50 overflow-hidden">
        <div class="p-5 md:p-7 border-b border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <h2 class="text-xl font-bold text-gray-900">Ventes de Drogue</h2>
                <p class="text-xs text-gray-500">Gestion des ventes et commissions (5% du bénéfice)</p>
              </div>
            </div>
            <button (click)="showVenteDrogueModal = true" 
                    class="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 font-semibold flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Enregistrer une vente
            </button>
          </div>
        </div>

        <!-- Stats globales ventes -->
        <div *ngIf="venteDrogueStats" class="p-5 md:p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-purple-100">
            <p class="text-xs text-gray-600 mb-1">Total ventes</p>
            <p class="text-2xl font-bold text-gray-900">{{ venteDrogueStats.global.totalVentes }}</p>
          </div>
          <div class="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-purple-100">
            <p class="text-xs text-gray-600 mb-1">Total pochons</p>
            <p class="text-2xl font-bold text-gray-900">{{ venteDrogueStats.global.totalPochons }}</p>
          </div>
          <div class="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-purple-100">
            <p class="text-xs text-gray-600 mb-1">Total commissions</p>
            <p class="text-2xl font-bold text-purple-600">{{ venteDrogueStats.global.totalCommissions | number:'1.0-2' }} €</p>
          </div>
          <div class="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-purple-100">
            <p class="text-xs text-gray-600 mb-1">Bénéfice groupe</p>
            <p class="text-2xl font-bold text-green-600">{{ venteDrogueStats.global.totalBeneficeGroupe | number:'1.0-2' }} €</p>
          </div>
        </div>

        <!-- Tableau commissions par vendeur -->
        <div *ngIf="venteDrogueStats && venteDrogueStats.parVendeur.length > 0" class="p-5 md:p-6">
          <h3 class="text-lg font-bold text-gray-900 mb-4">Commissions par vendeur</h3>
          <div class="overflow-x-auto">
            <table class="min-w-full">
              <thead>
                <tr class="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-200">
                  <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Vendeur</th>
                  <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Nb ventes</th>
                  <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Pochons vendus</th>
                  <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Commission totale</th>
                  <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Bénéfice groupe</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-purple-100">
                <tr *ngFor="let stat of venteDrogueStats.parVendeur" class="hover:bg-purple-50/50 transition-colors">
                  <td class="px-4 py-3 text-sm font-semibold text-gray-900">
                    {{ stat.vendeur.pseudo || stat.vendeur.email }}
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ stat.nbVentes }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ stat.totalPochons }}</td>
                  <td class="px-4 py-3 text-sm font-bold text-purple-600">{{ stat.totalCommission | number:'1.0-2' }} €</td>
                  <td class="px-4 py-3 text-sm font-bold text-green-600">{{ stat.totalBeneficeGroupe | number:'1.0-2' }} €</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Tableau des opérations -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-gray-100/50">
        <div class="p-5 md:p-7 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-900">Historique des opérations</h2>
              <p class="text-xs text-gray-500">Toutes vos transactions financières</p>
            </div>
          </div>
        </div>
        <table class="min-w-full">
          <thead>
            <tr class="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Type</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Montant</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Utilisateur</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Commentaire</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr *ngFor="let item of argentList" class="hover:bg-gray-50/50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {{ item.createdAt | date:'dd/MM/yyyy HH:mm:ss' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span [class]="item.type === 'ajout' ? 'px-3 py-1.5 bg-green-100 text-green-700' : 'px-3 py-1.5 bg-red-100 text-red-700'" 
                      class="text-xs font-bold rounded-lg inline-block">
                  {{ item.type === 'ajout' ? 'Ajout' : 'Retrait' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm font-bold text-gray-900">{{ item.montant | number:'1.0-0' }} €</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {{ item.user?.pseudo || item.user?.email || '-' }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                {{ item.commentaire || '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <button (click)="deleteArgent(item.id)" 
                        class="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-semibold transition-colors">Supprimer</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal ajout opération -->
      <div *ngIf="showAddModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
        <div class="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 animate-in slide-in-from-bottom-4 duration-300">
          <div class="flex justify-between items-start mb-6">
            <div>
              <h2 class="text-2xl font-bold text-gray-900 mb-1">Ajouter une opération</h2>
              <p class="text-sm text-gray-500">Enregistrer une transaction</p>
            </div>
            <button (click)="showAddModal = false" class="text-gray-400 hover:text-gray-600" aria-label="Fermer">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Solde actuel -->
          <div *ngIf="stats" class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl p-5 mb-6 shadow-sm">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                   [class.bg-gradient-to-br]="true"
                   [class.from-blue-500]="stats.solde >= 0"
                   [class.to-blue-600]="stats.solde >= 0"
                   [class.from-red-500]="stats.solde < 0"
                   [class.to-red-600]="stats.solde < 0">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-600">Solde actuel</p>
                <p class="text-2xl font-bold" [class.text-blue-700]="stats.solde >= 0" [class.text-red-700]="stats.solde < 0">
                  {{ stats.solde | number:'1.0-0' }} €
                </p>
              </div>
            </div>
          </div>

          <form (ngSubmit)="createArgent()" class="space-y-4">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <label class="block text-sm font-medium text-gray-700">Type d'opération</label>
                <app-help-tooltip text="Sélectionnez 'Ajout' pour ajouter de l'argent (ventes, revenus) ou 'Retrait' pour en retirer (achats, dépenses)."></app-help-tooltip>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <button type="button" 
                        (click)="newOperation.type = 'ajout'"
                        [class]="newOperation.type === 'ajout' ? 'bg-green-600 text-white border-2 border-green-600' : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-green-500'"
                        class="px-4 py-3 rounded-md font-medium transition-all flex items-center justify-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Ajout
                </button>
                <button type="button" 
                        (click)="newOperation.type = 'retrait'"
                        [class]="newOperation.type === 'retrait' ? 'bg-red-600 text-white border-2 border-red-600' : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-red-500'"
                        class="px-4 py-3 rounded-md font-medium transition-all flex items-center justify-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                  </svg>
                  Retrait
                </button>
              </div>
              <select [(ngModel)]="newOperation.type" name="type" required class="hidden">
                <option value="ajout">Ajout d'argent</option>
                <option value="retrait">Retrait d'argent</option>
              </select>
            </div>
            
            <div>
              <div class="flex items-center gap-2 mb-2">
                <label class="block text-sm font-medium text-gray-700">Montant (€) *</label>
                <app-help-tooltip text="Entrez le montant en euros. Seuls les nombres entiers sont acceptés (pas de centimes)."></app-help-tooltip>
              </div>
              <div class="relative">
                <span class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">€</span>
                <input type="number" 
                       step="1" 
                       min="1" 
                       [(ngModel)]="newOperation.montant" 
                       name="montant" 
                       required
                       (input)="calculateNewBalance()"
                       placeholder="0"
                       class="w-full pl-10 pr-4 py-2 border-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
              </div>
              
              <!-- Prévisualisation -->
              <div *ngIf="newOperation.montant && stats" 
                   class="mt-3 p-3 rounded-lg border-2"
                   [class.bg-green-50]="newOperation.type === 'ajout'"
                   [class.border-green-200]="newOperation.type === 'ajout'"
                   [class.bg-red-50]="newOperation.type === 'retrait'"
                   [class.border-red-200]="newOperation.type === 'retrait'">
                <p class="text-sm font-medium mb-1">
                  {{ newOperation.type === 'ajout' ? 'Solde après ajout :' : 'Solde après retrait :' }}
                </p>
                <p class="text-lg font-bold"
                   [class.text-green-700]="newOperation.type === 'ajout'"
                   [class.text-red-700]="newOperation.type === 'retrait'">
                  {{ getNewBalance() | number:'1.0-0' }} €
                </p>
              </div>
            </div>
            
            <div>
              <div class="flex items-center gap-2 mb-2">
                <label class="block text-sm font-medium text-gray-700">Commentaire (optionnel)</label>
                <app-help-tooltip text="Décrivez la raison de cette opération (ex: 'Vente de produits', 'Achat de matériel', 'Paiement facture')."></app-help-tooltip>
              </div>
              <textarea [(ngModel)]="newOperation.commentaire" 
                        name="commentaire" 
                        rows="3"
                        placeholder="Ex: Vente de produits, Achat de matériel, Paiement facture..."
                        class="w-full px-4 py-2 border-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"></textarea>
            </div>
            
            <div class="flex gap-4 pt-2">
              <button type="submit" 
                      [disabled]="!newOperation.montant || newOperation.montant <= 0"
                      [class.opacity-50]="!newOperation.montant || newOperation.montant <= 0"
                      [class.cursor-not-allowed]="!newOperation.montant || newOperation.montant <= 0"
                      class="flex-1 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Enregistrer
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

      <!-- Modal clôture semaine -->
      <div *ngIf="showCloseWeekModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
        <div class="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 animate-in slide-in-from-bottom-4 duration-300">
          <div class="flex justify-between items-start mb-6">
            <div>
              <h2 class="text-2xl font-bold text-gray-900 mb-1">Clôturer la semaine</h2>
              <p class="text-sm text-gray-500">Archiver le solde et effacer l'historique</p>
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
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-600">Solde actuel à archiver</p>
                <p class="text-2xl font-bold text-orange-700">
                  {{ stats?.solde || 0 | number:'1.0-0' }} €
                </p>
              </div>
            </div>
            <p class="text-xs text-gray-600 mt-3">
              ⚠️ Cette action va :<br>
              • Archiver le solde actuel ({{ stats?.solde || 0 | number:'1.0-0' }} €)<br>
              • Supprimer toutes les opérations de l'historique<br>
              • Créer une nouvelle opération "ajout" avec le solde reporté<br>
              • Réinitialiser l'historique pour la nouvelle semaine
            </p>
          </div>

          <form (ngSubmit)="closeWeek()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Commentaire (optionnel)</label>
              <textarea [(ngModel)]="closeWeekComment" 
                        name="closeWeekComment" 
                        rows="3"
                        placeholder="Ex: Clôture de la semaine, vérification des comptes..."
                        class="w-full px-4 py-2 border-2 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"></textarea>
            </div>
            
            <div class="flex gap-4 pt-2">
              <button type="submit" 
                      [disabled]="closingWeek"
                      [class.opacity-50]="closingWeek"
                      [class.cursor-not-allowed]="closingWeek"
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

      <!-- Modal vente drogue -->
      <div *ngIf="showVenteDrogueModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
        <div class="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 animate-in slide-in-from-bottom-4 duration-300">
          <div class="flex justify-between items-start mb-6">
            <div>
              <h2 class="text-2xl font-bold text-gray-900 mb-1">Enregistrer une vente</h2>
              <p class="text-sm text-gray-500">Vente de drogue avec calcul automatique des commissions</p>
            </div>
            <button (click)="showVenteDrogueModal = false" class="text-gray-400 hover:text-gray-600" aria-label="Fermer">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form (ngSubmit)="createVenteDrogue()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Vendeur *</label>
              <select [(ngModel)]="newVente.vendeurId" name="vendeurId" required
                      class="w-full px-4 py-2 border-2 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                <option value="">Sélectionner un vendeur</option>
                <option *ngFor="let user of users" [value]="user.id">
                  {{ user.pseudo || user.email }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nombre de pochons *</label>
              <input type="number" [(ngModel)]="newVente.nbPochons" name="nbPochons" required min="1" step="1"
                     (input)="calculateVentePreview()"
                     class="w-full px-4 py-2 border-2 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Prix de vente unitaire (€) *</label>
              <input type="number" [(ngModel)]="newVente.prixVenteUnitaire" name="prixVenteUnitaire" required min="625" step="1"
                     (input)="calculateVentePreview()"
                     placeholder="825-850"
                     class="w-full px-4 py-2 border-2 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
              <p class="text-xs text-gray-500 mt-1">Prix d'achat : 625€ (fixe)</p>
            </div>

            <div *ngIf="ventePreview" class="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4 space-y-2">
              <h4 class="font-semibold text-gray-900 mb-2">Prévisualisation</h4>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Bénéfice total :</span>
                <span class="font-bold text-gray-900">{{ ventePreview.benefice | number:'1.0-2' }} €</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Commission vendeur (5%) :</span>
                <span class="font-bold text-purple-600">{{ ventePreview.commission | number:'1.0-2' }} €</span>
              </div>
              <div class="flex justify-between text-sm border-t border-purple-200 pt-2 mt-2">
                <span class="text-gray-700 font-medium">Bénéfice groupe :</span>
                <span class="font-bold text-green-600">{{ ventePreview.beneficeGroupe | number:'1.0-2' }} €</span>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Commentaire (optionnel)</label>
              <textarea [(ngModel)]="newVente.commentaire" name="commentaire" rows="2"
                        placeholder="Ex: Vente client X, zone Y..."
                        class="w-full px-4 py-2 border-2 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"></textarea>
            </div>

            <div class="flex gap-4 pt-2">
              <button type="submit" 
                      [disabled]="!newVente.vendeurId || !newVente.nbPochons || !newVente.prixVenteUnitaire || creatingVente"
                      [class.opacity-50]="!newVente.vendeurId || !newVente.nbPochons || !newVente.prixVenteUnitaire || creatingVente"
                      class="flex-1 bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2">
                <svg *ngIf="creatingVente" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{{ creatingVente ? 'Enregistrement...' : 'Enregistrer la vente' }}</span>
              </button>
              <button type="button" (click)="showVenteDrogueModal = false" 
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
export class ComptabiliteArgentComponent implements OnInit, OnDestroy {
  argentList: Argent[] = [];
  stats: ArgentStats | null = null;
  showAddModal = false;
  showCloseWeekModal = false;
  closingWeek = false;
  closeWeekComment = '';
  selectedPeriod: 'jour' | 'semaine' | 'mois' = 'mois';
  lastUpdate = new Date();
  private refreshSubscription?: Subscription;
  
  newOperation = {
    type: 'ajout',
    montant: 0,
    commentaire: ''
  };

  lineChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: []
  };

  lineChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          callback: function(value) {
            return value + ' €';
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  doughnutChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Ajouts', 'Retraits'],
    datasets: [{
      label: 'Montant (€)',
      data: [0, 0],
      backgroundColor: [
        'rgba(16, 185, 129, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ],
      borderColor: [
        'rgb(16, 185, 129)',
        'rgb(239, 68, 68)'
      ],
      borderWidth: 2,
      borderRadius: 8
    }]
  };

  doughnutChartOptions: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            return context.dataset.label + ': ' + context.parsed.x + ' €';
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          callback: function(value) {
            return value + ' €';
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      y: {
        grid: {
          display: false
        }
      }
    }
  };

  venteDrogueStats: VenteDrogueStats | null = null;
  showVenteDrogueModal = false;
  creatingVente = false;
  users: User[] = [];
  ventePreview: { benefice: number; commission: number; beneficeGroupe: number } | null = null;

  newVente = {
    vendeurId: null as number | null,
    nbPochons: 1,
    prixVenteUnitaire: 825,
    prixAchatUnitaire: 625,
    commentaire: ''
  };

  constructor(
    private argentService: ArgentService,
    private venteDrogueService: VenteDrogueService,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.loadVenteDrogueStats();
    this.loadUsers();
    // Rafraîchissement automatique toutes les minutes
    this.refreshSubscription = interval(60000).subscribe(() => {
      this.loadData();
      this.loadVenteDrogueStats();
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
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: 'rgb(16, 185, 129)',
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false
        },
        {
          data: retraits,
          label: 'Retraits',
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgb(239, 68, 68)',
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false
        }
      ]
    };

    // Graphique en barres horizontales
    this.doughnutChartData = {
      labels: ['Ajouts', 'Retraits'],
      datasets: [{
        label: 'Montant (€)',
        data: [Math.round(this.stats.totalAjoute), Math.round(this.stats.totalRetire)],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgb(16, 185, 129)',
          'rgb(239, 68, 68)'
        ],
        borderWidth: 2,
        borderRadius: 8
      }]
    };
  }

  calculateNewBalance(): void {
    // Cette méthode est appelée lors de la saisie pour recalculer
  }

  getNewBalance(): number {
    if (!this.stats || !this.newOperation.montant) return this.stats?.solde || 0;
    if (this.newOperation.type === 'ajout') {
      return this.stats.solde + this.newOperation.montant;
    } else {
      return this.stats.solde - this.newOperation.montant;
    }
  }

  createArgent(): void {
    this.argentService.createArgent(
      this.newOperation.type,
      this.newOperation.montant,
      this.newOperation.commentaire
    ).subscribe({
      next: () => {
        this.showAddModal = false;
        this.showSuccessMessage();
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

  closeWeek(): void {
    if (!confirm('⚠️ Êtes-vous sûr de vouloir clôturer la semaine ? Cette action est irréversible et effacera tout l\'historique.')) {
      return;
    }

    this.closingWeek = true;
    this.argentService.closeWeek(this.closeWeekComment || undefined).subscribe({
      next: (response) => {
        this.closingWeek = false;
        this.showCloseWeekModal = false;
        this.closeWeekComment = '';
        this.showSuccessCloseMessage(response.soldeArchive, response.semaine);
        this.loadData(); // Recharger les données
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

  showSuccessCloseMessage(solde: number, semaine: string): void {
    const message = document.createElement('div');
    message.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg z-50 flex items-center gap-3 max-w-md';
    message.innerHTML = `
      <svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
      <div>
        <p class="font-medium">Semaine ${semaine} clôturée avec succès !</p>
        <p class="text-sm opacity-90">Solde archivé : ${solde.toLocaleString('fr-FR')} €</p>
      </div>
    `;
    document.body.appendChild(message);
    setTimeout(() => {
      message.style.opacity = '0';
      message.style.transition = 'opacity 0.3s ease-out';
      setTimeout(() => message.remove(), 300);
    }, 5000);
  }

  loadVenteDrogueStats(): void {
    this.venteDrogueService.getStats().subscribe({
      next: (stats) => {
        this.venteDrogueStats = stats;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des stats ventes drogue', err);
      }
    });
  }

  loadUsers(): void {
    this.adminService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des utilisateurs', err);
      }
    });
  }

  calculateVentePreview(): void {
    if (!this.newVente.nbPochons || !this.newVente.prixVenteUnitaire) {
      this.ventePreview = null;
      return;
    }

    const beneficeUnitaire = this.newVente.prixVenteUnitaire - this.newVente.prixAchatUnitaire;
    const benefice = beneficeUnitaire * this.newVente.nbPochons;
    const commission = benefice * 0.05; // 5%
    const beneficeGroupe = benefice - commission;

    this.ventePreview = {
      benefice: benefice,
      commission: commission,
      beneficeGroupe: beneficeGroupe
    };
  }

  createVenteDrogue(): void {
    if (!this.newVente.vendeurId || !this.newVente.nbPochons || !this.newVente.prixVenteUnitaire) {
      return;
    }

    this.creatingVente = true;
    this.venteDrogueService.createVente({
      vendeurId: this.newVente.vendeurId,
      nbPochons: this.newVente.nbPochons,
      prixVenteUnitaire: this.newVente.prixVenteUnitaire,
      prixAchatUnitaire: this.newVente.prixAchatUnitaire,
      commentaire: this.newVente.commentaire || undefined
    }).subscribe({
      next: () => {
        this.showVenteDrogueModal = false;
        this.creatingVente = false;
        this.newVente = {
          vendeurId: null,
          nbPochons: 1,
          prixVenteUnitaire: 825,
          prixAchatUnitaire: 625,
          commentaire: ''
        };
        this.ventePreview = null;
        this.showSuccessMessage('Vente enregistrée avec succès !');
        this.loadData(); // Recharge la comptabilité argent
        this.loadVenteDrogueStats(); // Recharge les stats ventes
      },
      error: (err) => {
        this.creatingVente = false;
        console.error('Erreur lors de l\'enregistrement de la vente', err);
        if (err.status === 401) {
          alert('Votre session a expiré. Veuillez vous reconnecter.');
        } else {
          alert(err.error?.error || 'Erreur lors de l\'enregistrement de la vente');
        }
      }
    });
  }

  showSuccessMessage(text: string = 'Opération enregistrée avec succès !'): void {
    const message = document.createElement('div');
    message.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg z-50 flex items-center gap-3';
    message.innerHTML = `
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      <span class="font-medium">${text}</span>
    `;
    document.body.appendChild(message);
    setTimeout(() => {
      message.style.opacity = '0';
      message.style.transition = 'opacity 0.3s ease-out';
      setTimeout(() => message.remove(), 300);
    }, 3000);
  }
}
