import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService, User } from '../../../core/services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="w-64 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-900 text-white h-full flex flex-col shadow-2xl border-r border-gray-800">
      <div class="p-5 md:p-6 flex-1 overflow-y-auto">
        <div class="flex items-center justify-between mb-8">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span class="text-white font-bold text-lg">LS</span>
            </div>
            <div>
              <h1 class="text-lg font-bold text-white">Los Sombras</h1>
              <p class="text-xs text-gray-400">Gestion</p>
            </div>
          </div>
          <button *ngIf="showCloseButton" 
                  (click)="onCloseMenu()"
                  class="lg:hidden text-gray-400 hover:text-white hover:bg-gray-800 p-2 rounded-lg transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <nav class="space-y-1" role="navigation" aria-label="Navigation principale">
          <a routerLink="/dashboard" 
             routerLinkActive="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg" 
             [routerLinkActiveOptions]="{exact: false}"
             [attr.aria-current]="router.url === '/dashboard' ? 'page' : null"
             (click)="closeMenuOnNavigation()"
             class="flex items-center px-4 py-3 rounded-xl hover:bg-gray-800/50 transition-all duration-200 text-white hover:text-white text-sm font-medium group relative overflow-hidden no-underline hover:no-underline">
             <span class="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-r-full"></span>
            <svg class="w-5 h-5 mr-3 relative z-10 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            <span class="relative z-10">Dashboard</span>
          </a>
          <a routerLink="/stock" 
             routerLinkActive="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg"
             [attr.aria-current]="router.url === '/stock' ? 'page' : null"
             (click)="closeMenuOnNavigation()"
             class="flex items-center px-4 py-3 rounded-xl hover:bg-gray-800/50 transition-all duration-200 text-white hover:text-white text-sm font-medium group relative overflow-hidden no-underline hover:no-underline">
             <span class="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-r-full"></span>
            <svg class="w-5 h-5 mr-3 relative z-10 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
            </svg>
            <span class="relative z-10">Stock</span>
          </a>
          <a routerLink="/stock-drogue" 
             routerLinkActive="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg"
             [attr.aria-current]="router.url === '/stock-drogue' ? 'page' : null"
             (click)="closeMenuOnNavigation()"
             class="flex items-center px-4 py-3 rounded-xl hover:bg-gray-800/50 transition-all duration-200 text-white hover:text-white text-sm font-medium group relative overflow-hidden no-underline hover:no-underline">
             <span class="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-r-full"></span>
            <svg class="w-5 h-5 mr-3 relative z-10 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
            <span class="relative z-10">Stock Drogue</span>
          </a>
          <a routerLink="/vehicules" 
             routerLinkActive="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg"
             [attr.aria-current]="router.url === '/vehicules' ? 'page' : null"
             (click)="closeMenuOnNavigation()"
             class="flex items-center px-4 py-3 rounded-xl hover:bg-gray-800/50 transition-all duration-200 text-white hover:text-white text-sm font-medium group relative overflow-hidden no-underline hover:no-underline">
             <span class="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-r-full"></span>
            <svg class="w-5 h-5 mr-3 relative z-10 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path>
            </svg>
            <span class="relative z-10">Véhicules</span>
          </a>
          <a routerLink="/comptabilite" 
             routerLinkActive="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg"
             [attr.aria-current]="router.url === '/comptabilite' ? 'page' : null"
             (click)="closeMenuOnNavigation()"
             class="flex items-center px-4 py-3 rounded-xl hover:bg-gray-800/50 transition-all duration-200 text-white hover:text-white text-sm font-medium group relative overflow-hidden no-underline hover:no-underline">
             <span class="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-r-full"></span>
            <svg class="w-5 h-5 mr-3 relative z-10 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
            </svg>
            <span class="relative z-10">Comptabilité Produits</span>
          </a>
          <a *ngIf="isCapitanOrAbove()" 
             routerLink="/comptabilite-argent" 
             routerLinkActive="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg"
             [attr.aria-current]="router.url === '/comptabilite-argent' ? 'page' : null"
             (click)="closeMenuOnNavigation()"
             class="flex items-center px-4 py-3 rounded-xl hover:bg-gray-800/50 transition-all duration-200 text-white hover:text-white text-sm font-medium group relative overflow-hidden no-underline hover:no-underline">
             <span class="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-r-full"></span>
            <svg class="w-5 h-5 mr-3 relative z-10 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span class="relative z-10">Comptabilité Argent</span>
          </a>
          <a *ngIf="isAdmin()" 
             routerLink="/armes" 
             routerLinkActive="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg"
             [attr.aria-current]="router.url === '/armes' ? 'page' : null"
             (click)="closeMenuOnNavigation()"
             class="flex items-center px-4 py-3 rounded-xl hover:bg-gray-800/50 transition-all duration-200 text-white hover:text-white text-sm font-medium group relative overflow-hidden no-underline hover:no-underline">
             <span class="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-r-full"></span>
            <svg class="w-5 h-5 mr-3 relative z-10 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
            <span class="relative z-10">Gestion des Armes</span>
          </a>
          <a *ngIf="isAdmin()" 
             routerLink="/admin" 
             routerLinkActive="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg"
             [attr.aria-current]="router.url === '/admin' ? 'page' : null"
             (click)="closeMenuOnNavigation()"
             class="flex items-center px-4 py-3 rounded-xl hover:bg-gray-800/50 transition-all duration-200 text-white hover:text-white text-sm font-medium group relative overflow-hidden no-underline hover:no-underline">
             <span class="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-r-full"></span>
            <svg class="w-5 h-5 mr-3 relative z-10 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            <span class="relative z-10">Administration</span>
          </a>
        </nav>
      </div>
      <div class="p-5 md:p-6 border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div class="mb-4 p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
          <p class="text-xs text-gray-400 mb-1">Connecté en tant que</p>
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span class="text-white font-bold text-xs">{{ (currentUser?.pseudo || currentUser?.email || 'U')[0].toUpperCase() }}</span>
            </div>
            <p class="font-semibold text-sm truncate text-white">{{ currentUser?.pseudo || currentUser?.email }}</p>
          </div>
        </div>
        <button (click)="logout()" 
                class="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl transition-all duration-200 text-sm font-medium text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          Déconnexion
        </button>
      </div>
    </aside>
  `,
  styles: []
})
export class SidebarComponent implements OnInit {
  @Input() showCloseButton: boolean = false;
  @Output() closeMenu = new EventEmitter<void>();
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    public router: Router
  ) {}

  ngOnInit(): void {
    // Charger l'utilisateur immédiatement
    this.currentUser = this.authService.getCurrentUser();
    
    // S'abonner aux changements
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    
    // Fermer le menu mobile lors de la navigation
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.closeMenuOnNavigation();
      });
  }

  onCloseMenu(): void {
    this.closeMenu.emit();
  }

  closeMenuOnNavigation(): void {
    if (this.showCloseButton) {
      this.closeMenu.emit();
    }
  }

  isAdmin(): boolean {
    const user = this.currentUser;
    if (!user) return false;
    return user.roles.some(role => 
      role === 'ROLE_JEFE' || 
      role === 'ROLE_SEGUNDO' || 
      role === 'ROLE_COMANDANTE' ||
      role === 'ROLE_ALFERES' ||
      role === 'ROLE_CAPITAN' ||
      role === 'ROLE_ARMADA'
    );
  }

  isCapitanOrAbove(): boolean {
    // Essayer d'obtenir l'utilisateur actuel
    let user = this.currentUser;
    if (!user) {
      user = this.authService.getCurrentUser();
      if (user) {
        this.currentUser = user; // Mettre à jour pour éviter de le recharger
      }
    }
    if (!user || !user.roles || !Array.isArray(user.roles)) {
      console.warn('[Sidebar] isCapitanOrAbove: Pas d\'utilisateur ou rôles invalides', user);
      return false;
    }
    const authorizedRoles = [
      'ROLE_CAPITAN',
      'ROLE_ALFERES',
      'ROLE_COMANDANTE',
      'ROLE_SEGUNDO',
      'ROLE_JEFE',
      'ROLE_CONTADOR'
    ];
    const hasAccess = user.roles.some(role => authorizedRoles.includes(role));
    if (!hasAccess) {
      console.debug('[Sidebar] isCapitanOrAbove: Accès refusé. Rôles:', user.roles);
    }
    return hasAccess;
  }

  hasDrogueAccess(): boolean {
    const user = this.currentUser;
    if (!user) return false;
    const allowedRoles = [
      'ROLE_GESTION_DROGUE',
      'ROLE_JEFE',
      'ROLE_SEGUNDO',
      'ROLE_COMANDANTE',
      'ROLE_ALFERES',
      'ROLE_CAPITAN'
    ];
    return user.roles.some(role => allowedRoles.includes(role));
  }

  logout(): void {
    this.authService.logout();
  }
}
