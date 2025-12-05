import { Component, OnInit, OnDestroy, HostListener, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NotificationService, StockAlerte } from '../../../core/services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="bg-gradient-to-r from-gray-50 to-white shadow-md border-b border-gray-200/50 backdrop-blur-sm sticky top-0 z-30">
      <div class="px-4 md:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between gap-3 md:gap-6">
          <!-- Logo + Menu Burger Mobile -->
          <div class="flex items-center gap-3">
            <button 
              (click)="toggleMenu()"
              (keydown.enter)="toggleMenu()"
              (keydown.space)="toggleMenu(); $event.preventDefault()"
              class="lg:hidden p-2.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 active:scale-95"
              aria-label="Ouvrir le menu de navigation"
              [attr.aria-expanded]="showMobileMenu"
              aria-controls="mobile-menu">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
            
            <!-- Logo / Titre -->
            <div class="hidden sm:flex items-center gap-2">
              <div class="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                <span class="text-white font-bold text-sm">LS</span>
              </div>
              <div>
                <h1 class="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Los Sombras</h1>
                <p class="text-xs text-gray-500 hidden lg:block">Gestion de stock</p>
              </div>
            </div>
          </div>
          
          <!-- Recherche (centrée sur desktop) -->
          <div class="hidden md:flex flex-1 max-w-2xl mx-8">
            <div class="relative w-full group">
              <label for="global-search" class="sr-only">Rechercher</label>
              <input 
                id="global-search"
                type="search" 
                [(ngModel)]="searchQuery"
                (input)="onSearch()"
                placeholder="Rechercher un article, stock, véhicule..."
                aria-label="Rechercher dans le site"
                autocomplete="off"
                class="w-full pl-11 pr-4 py-2.5 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder:text-gray-400 shadow-sm hover:shadow-md">
              <svg class="absolute left-3.5 top-3 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
          
          <!-- Recherche Mobile -->
          <div class="md:hidden flex-1">
            <div class="relative">
              <label for="global-search-mobile" class="sr-only">Rechercher</label>
              <input 
                id="global-search-mobile"
                type="search" 
                [(ngModel)]="searchQuery"
                (input)="onSearch()"
                placeholder="Rechercher..."
                aria-label="Rechercher dans le site"
                autocomplete="off"
                class="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <svg class="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
        
          <div class="flex items-center gap-2 md:gap-3">
            <!-- Page actuelle (desktop) -->
            <div class="hidden xl:flex items-center gap-2 px-4 py-2 bg-white/80 rounded-lg border border-gray-200/50">
              <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span class="text-sm font-medium text-gray-700">{{ currentPage }}</span>
            </div>
          
            <!-- Bouton de notification -->
            <div class="relative" data-notification-panel>
              <button 
                (click)="toggleNotifications($event)"
                (keydown.enter)="toggleNotifications($event)"
                data-notification-button
                class="relative p-2.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200 active:scale-95 group"
                aria-label="Notifications d'alerte de stock"
                [attr.aria-expanded]="showNotifications"
                [attr.aria-live]="showNotifications ? 'polite' : 'off'"
                aria-haspopup="true">
                <svg class="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
                <span *ngIf="alertesCount > 0" 
                      class="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold leading-none text-white transform bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-lg ring-2 ring-white"
                      [attr.aria-label]="alertesCount + ' alertes de stock'">
                  {{ alertesCount > 99 ? '99+' : alertesCount }}
                </span>
              </button>
            
              <!-- Popup de notifications -->
              <div *ngIf="showNotifications" 
                   class="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200/50 z-50 max-h-96 overflow-hidden backdrop-blur-sm animate-in slide-in-from-top-2 duration-200"
                   data-notification-panel
                   role="dialog"
                   aria-labelledby="notifications-title"
                   aria-modal="false">
                <div class="p-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200/50 flex items-center justify-between sticky top-0">
                  <div class="flex items-center gap-2">
                    <div class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <h3 id="notifications-title" class="text-lg font-bold text-gray-900">Alertes de stock</h3>
                    <span *ngIf="alertesCount > 0" class="px-2 py-0.5 text-xs font-semibold text-white bg-red-500 rounded-full">
                      {{ alertesCount }}
                    </span>
                  </div>
                  <button (click)="showNotifications = false" 
                          (keydown.escape)="showNotifications = false"
                          class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          aria-label="Fermer les notifications">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              
                <div *ngIf="alertes && alertes.length > 0" class="p-3 overflow-y-auto max-h-[320px]" role="list" aria-label="Liste des alertes">
                  <div *ngFor="let alerte of alertes; let i = index" 
                       class="p-4 mb-2 bg-gradient-to-r from-red-50 to-red-50/50 border-l-4 border-red-500 rounded-xl hover:from-red-100 hover:to-red-50 transition-all duration-200 shadow-sm hover:shadow-md relative group"
                       [class.ring-2]="alerte?.isNew"
                       [class.ring-red-200]="alerte?.isNew"
                       role="listitem">
                    <div class="flex items-start gap-3">
                      <div class="flex-shrink-0 mt-0.5">
                        <div class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                          <svg class="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                          </svg>
                        </div>
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                          <p class="text-sm font-semibold text-gray-900 truncate">{{ alerte?.article || 'N/A' }}</p>
                          <span *ngIf="alerte?.isNew" 
                                class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-red-600 text-white shadow-sm"
                                aria-label="Nouvelle alerte">
                            Nouveau
                          </span>
                        </div>
                        <div class="flex items-center gap-2">
                          <p class="text-xs text-red-700 font-medium">
                            <span class="sr-only">Stock restant: </span>
                            Stock: {{ (alerte?.quantite || 0) | number:'1.0-0' }} {{ alerte?.unite || '' }}
                          </p>
                        </div>
                      </div>
                      <button 
                        (click)="dismissAlerte(alerte?.id || 0)"
                        (keydown.enter)="dismissAlerte(alerte?.id || 0)"
                        class="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        [attr.aria-label]="'Fermer la notification pour ' + (alerte?.article || 'cet article')">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div class="mt-3 pt-3 border-t border-gray-200">
                    <button 
                      (click)="dismissAllAlertes()"
                      (keydown.enter)="dismissAllAlertes()"
                      class="w-full text-xs font-medium text-gray-600 hover:text-gray-900 text-center py-2 px-3 hover:bg-gray-50 rounded-lg transition-colors"
                      aria-label="Fermer toutes les notifications">
                      Tout fermer
                    </button>
                  </div>
                </div>
                
                <div *ngIf="!alertes || alertes.length === 0" class="p-12 text-center" role="status">
                  <div class="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                    <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <p class="text-sm font-medium text-gray-600">Aucune alerte</p>
                  <p class="text-xs text-gray-500 mt-1">Tout est en ordre !</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: []
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Output() menuToggle = new EventEmitter<void>();
  searchQuery: string = '';
  currentPage: string = '';
  showNotifications: boolean = false;
  showMobileMenu: boolean = false;
  alertes: StockAlerte[] = [];
  alertesCount: number = 0;
  private alertesSubscription?: Subscription;

  constructor(
    private router: Router,
    private notificationService: NotificationService
  ) {}
  
  toggleMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
    this.menuToggle.emit();
  }

  ngOnInit(): void {
    this.updateCurrentPage();
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateCurrentPage();
        this.showNotifications = false; // Fermer les notifications lors de la navigation
      });
    
    // Écouter les alertes
    this.alertesSubscription = this.notificationService.alertes$.subscribe(alertes => {
      this.alertes = alertes || [];
      this.alertesCount = alertes?.length || 0;
    });
  }

  ngOnDestroy(): void {
    if (this.alertesSubscription) {
      this.alertesSubscription.unsubscribe();
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    const notificationButton = target.closest('[data-notification-button]');
    const notificationPanel = target.closest('[data-notification-panel]');
    
    if (!notificationButton && !notificationPanel) {
      this.showNotifications = false;
    }
  }

  toggleNotifications(event: Event): void {
    event.stopPropagation();
    this.showNotifications = !this.showNotifications;
    // Marquer toutes les alertes comme lues quand on ouvre la bulle
    if (this.showNotifications) {
      this.alertes.forEach(alerte => {
        if (alerte && alerte.isNew && alerte.id) {
          this.notificationService.markAsRead(alerte.id);
        }
      });
    }
  }

  dismissAlerte(id: number): void {
    if (id) {
      this.notificationService.dismissAlerte(id);
    }
  }

  dismissAllAlertes(): void {
    this.notificationService.dismissAllAlertes();
  }

  updateCurrentPage(): void {
    const route = this.router.url;
    const pageMap: { [key: string]: string } = {
      '/dashboard': 'Dashboard',
      '/stock': 'Stock',
      '/vehicules': 'Véhicules',
      '/comptabilite': 'Comptabilité Produits',
      '/comptabilite-argent': 'Comptabilité Argent',
      '/armes': 'Gestion des Armes',
      '/admin': 'Administration'
    };
    this.currentPage = pageMap[route] || 'Los Sombras';
  }

  onSearch(): void {
    // Émet un événement personnalisé pour que les composants puissent écouter
    const event = new CustomEvent('globalSearch', { 
      detail: { query: this.searchQuery } 
    });
    window.dispatchEvent(event);
  }
}

