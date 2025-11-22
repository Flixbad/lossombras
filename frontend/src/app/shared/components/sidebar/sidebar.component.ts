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
    <aside class="w-64 bg-gray-900 text-white h-full flex flex-col">
      <div class="p-4 md:p-6 flex-1 overflow-y-auto">
        <div class="flex items-center justify-between mb-6 lg:mb-8">
          <h1 class="text-xl md:text-2xl font-bold">Los Sombras</h1>
          <button *ngIf="showCloseButton" 
                  (click)="onCloseMenu()"
                  class="lg:hidden text-gray-400 hover:text-white p-2">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <nav class="space-y-1 md:space-y-2" role="navigation" aria-label="Navigation principale">
          <a routerLink="/dashboard" 
             routerLinkActive="bg-gray-800" 
             [attr.aria-current]="router.url === '/dashboard' ? 'page' : null"
             (click)="closeMenuOnNavigation()"
             class="flex items-center px-4 py-2 rounded hover:bg-gray-800 transition text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900">
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            Dashboard
          </a>
          <a routerLink="/stock" 
             routerLinkActive="bg-gray-800"
             [attr.aria-current]="router.url === '/stock' ? 'page' : null"
             (click)="closeMenuOnNavigation()"
             class="flex items-center px-4 py-2 rounded hover:bg-gray-800 transition text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900">
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
            </svg>
            Stock
          </a>
          <a routerLink="/vehicules" 
             routerLinkActive="bg-gray-800"
             [attr.aria-current]="router.url === '/vehicules' ? 'page' : null"
             (click)="closeMenuOnNavigation()"
             class="flex items-center px-4 py-2 rounded hover:bg-gray-800 transition text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900">
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path>
            </svg>
            Véhicules
          </a>
          <a routerLink="/comptabilite" 
             routerLinkActive="bg-gray-800"
             [attr.aria-current]="router.url === '/comptabilite' ? 'page' : null"
             (click)="closeMenuOnNavigation()"
             class="flex items-center px-4 py-2 rounded hover:bg-gray-800 transition text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900">
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
            </svg>
            Comptabilité Produits
          </a>
          <a *ngIf="isCapitanOrAbove()" 
             routerLink="/comptabilite-argent" 
             routerLinkActive="bg-gray-800"
             [attr.aria-current]="router.url === '/comptabilite-argent' ? 'page' : null"
             (click)="closeMenuOnNavigation()"
             class="flex items-center px-4 py-2 rounded hover:bg-gray-800 transition text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900">
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Comptabilité Argent
          </a>
          <a *ngIf="isAdmin()" 
             routerLink="/armes" 
             routerLinkActive="bg-gray-800"
             [attr.aria-current]="router.url === '/armes' ? 'page' : null"
             (click)="closeMenuOnNavigation()"
             class="flex items-center px-4 py-2 rounded hover:bg-gray-800 transition text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900">
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
            Gestion des Armes
          </a>
          <a *ngIf="isAdmin()" 
             routerLink="/admin" 
             routerLinkActive="bg-gray-800"
             [attr.aria-current]="router.url === '/admin' ? 'page' : null"
             (click)="closeMenuOnNavigation()"
             class="flex items-center px-4 py-2 rounded hover:bg-gray-800 transition text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900">
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            Administration
          </a>
        </nav>
      </div>
      <div class="p-4 md:p-6 border-t border-gray-800">
        <div class="mb-4">
          <p class="text-xs md:text-sm text-gray-400">Connecté en tant que</p>
          <p class="font-semibold text-sm md:text-base truncate">{{ currentUser?.pseudo || currentUser?.email }}</p>
        </div>
        <button (click)="logout()" 
                class="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition text-sm md:text-base">
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
      role === 'ROLE_CAPITAN'
    );
  }

  isCapitanOrAbove(): boolean {
    const user = this.currentUser;
    if (!user) return false;
    return user.roles.some(role => 
      role === 'ROLE_CAPITAN' ||
      role === 'ROLE_ALFERES' ||
      role === 'ROLE_COMANDANTE' ||
      role === 'ROLE_SEGUNDO' ||
      role === 'ROLE_JEFE'
    );
  }

  logout(): void {
    this.authService.logout();
  }
}
