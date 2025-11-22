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
    <header class="bg-white shadow-sm border-b border-gray-200 px-4 md:px-6 py-3 md:py-4">
      <div class="flex items-center justify-between gap-2 md:gap-4">
        <!-- Menu Burger Mobile -->
        <button 
          (click)="toggleMenu()"
          (keydown.enter)="toggleMenu()"
          (keydown.space)="toggleMenu(); $event.preventDefault()"
          class="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition"
          aria-label="Ouvrir le menu de navigation"
          [attr.aria-expanded]="showMobileMenu"
          aria-controls="mobile-menu">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
        
        <!-- Recherche -->
        <div class="flex-1 max-w-xl">
          <div class="relative">
            <label for="global-search" class="sr-only">Rechercher</label>
            <input 
              id="global-search"
              type="search" 
              [(ngModel)]="searchQuery"
              (input)="onSearch()"
              placeholder="Rechercher..."
              aria-label="Rechercher dans le site"
              autocomplete="off"
              class="w-full pl-8 md:pl-10 pr-3 md:pr-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <svg class="absolute left-2 md:left-3 top-2.5 h-4 w-4 md:h-5 md:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>
        
        <div class="flex items-center gap-2 md:gap-4">
          <!-- Page actuelle (desktop) -->
          <span class="hidden md:inline-block text-sm text-gray-500">{{ currentPage }}</span>
          
          <!-- Bouton de notification -->
          <div class="relative" data-notification-panel>
            <button 
              (click)="toggleNotifications($event)"
              (keydown.enter)="toggleNotifications($event)"
              data-notification-button
              class="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition"
              aria-label="Notifications d'alerte de stock"
              [attr.aria-expanded]="showNotifications"
              [attr.aria-live]="showNotifications ? 'polite' : 'off'"
              aria-haspopup="true">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
              </svg>
              <span *ngIf="alertesCount > 0" 
                    class="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full"
                    [attr.aria-label]="alertesCount + ' alertes de stock'">
                {{ alertesCount }}
              </span>
            </button>
            
            <!-- Popup de notifications -->
            <div *ngIf="showNotifications" 
                 class="absolute right-0 mt-2 w-72 md:w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto"
                 data-notification-panel
                 role="dialog"
                 aria-labelledby="notifications-title"
                 aria-modal="false">
              <div class="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 id="notifications-title" class="text-lg font-semibold text-gray-800">Alertes de stock</h3>
                <button (click)="showNotifications = false" 
                        (keydown.escape)="showNotifications = false"
                        class="text-gray-400 hover:text-gray-600"
                        aria-label="Fermer les notifications">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <div *ngIf="alertes && alertes.length > 0" class="p-2" role="list" aria-label="Liste des alertes">
                <div *ngFor="let alerte of alertes; let i = index" 
                     class="p-3 mb-2 bg-red-50 border-l-4 border-red-500 rounded hover:bg-red-100 transition relative"
                     [class.animate-pulse]="alerte?.isNew"
                     role="listitem">
                  <div class="flex items-start">
                    <svg class="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                    <div class="flex-1">
                      <div class="flex items-center gap-2">
                        <p class="text-sm font-medium text-red-800">{{ alerte?.article || 'N/A' }}</p>
                        <span *ngIf="alerte?.isNew" 
                              class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-600 text-white"
                              aria-label="Nouvelle alerte">
                          Nouveau
                        </span>
                      </div>
                      <p class="text-xs text-red-600 mt-1">
                        <span class="sr-only">Stock restant: </span>
                        Stock: {{ (alerte?.quantite || 0) | number:'1.0-0' }} {{ alerte?.unite || '' }}
                      </p>
                    </div>
                    <button 
                      (click)="dismissAlerte(alerte?.id || 0)"
                      (keydown.enter)="dismissAlerte(alerte?.id || 0)"
                      class="ml-2 text-gray-400 hover:text-red-600 transition p-1"
                      [attr.aria-label]="'Fermer la notification pour ' + (alerte?.article || 'cet article')">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                <div class="mt-2 pt-2 border-t border-gray-200">
                  <button 
                    (click)="dismissAllAlertes()"
                    (keydown.enter)="dismissAllAlertes()"
                    class="w-full text-xs text-gray-500 hover:text-gray-700 text-center py-2"
                    aria-label="Fermer toutes les notifications">
                    Tout fermer
                  </button>
                </div>
              </div>
              
              <div *ngIf="!alertes || alertes.length === 0" class="p-8 text-center text-gray-500" role="status">
                <svg class="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p class="text-sm">Aucune alerte</p>
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

