import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { filter } from 'rxjs/operators';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <a href="#main-content" class="skip-link">Aller au contenu principal</a>
    <div *ngIf="showSidebar" class="flex h-screen bg-gray-100 overflow-hidden">
      <!-- Sidebar Desktop -->
      <app-sidebar class="hidden lg:flex" role="complementary" aria-label="Navigation principale"></app-sidebar>
      
      <div class="flex-1 flex flex-col overflow-hidden w-full lg:w-auto">
        <app-header (menuToggle)="toggleMobileMenu()" role="banner"></app-header>
        <main id="main-content" class="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8" role="main" tabindex="-1">
          <router-outlet></router-outlet>
        </main>
      </div>
      
      <!-- Overlay mobile -->
      <div *ngIf="mobileMenuOpen" 
           (click)="closeMobileMenu()"
           (keydown.escape)="closeMobileMenu()"
           class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
           aria-label="Fermer le menu"
           role="button"
           tabindex="0"></div>
      
      <!-- Sidebar Mobile (Drawer) -->
      <app-sidebar [showCloseButton]="true"
                   (closeMenu)="closeMobileMenu()"
                   class="lg:hidden fixed left-0 top-0 h-full z-50 transform transition-transform duration-300 ease-in-out"
                   [class.translate-x-0]="mobileMenuOpen"
                   [class.-translate-x-full]="!mobileMenuOpen"
                   role="navigation"
                   [attr.aria-hidden]="!mobileMenuOpen"
                   aria-label="Menu de navigation mobile"></app-sidebar>
    </div>
    <div *ngIf="!showSidebar">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  title = 'Los Sombras';
  showSidebar = false;
  mobileMenuOpen = false;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    // Initialiser la session au démarrage pour garder l'utilisateur connecté après refresh
    this.authService.initializeSession();
    this.updateSidebar();
    
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateSidebar();
        this.closeMobileMenu(); // Fermer le menu mobile lors de la navigation
      });
  }

  private updateSidebar(): void {
    const isLoginPage = this.router.url === '/login';
    const isAuthenticated = this.authService.isAuthenticated();
    this.showSidebar = !isLoginPage && isAuthenticated;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }
}
