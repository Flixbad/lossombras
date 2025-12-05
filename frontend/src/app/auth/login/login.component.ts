import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50/30 to-purple-50/20 p-4 relative overflow-hidden">
      <!-- Décoration de fond -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div class="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      </div>
      
      <div class="max-w-md w-full relative z-10">
        <!-- Carte principale -->
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-100/50 overflow-hidden">
          <!-- Header avec logo -->
          <div class="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 p-8 text-center relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
            <div class="relative z-10">
              <div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl transform hover:scale-110 transition-transform">
                <span class="text-white font-bold text-3xl">LS</span>
              </div>
              <h2 class="text-3xl md:text-4xl font-bold text-white mb-2">Los Sombras</h2>
              <p class="text-blue-200 text-sm">Système de gestion</p>
            </div>
          </div>
          
          <div class="p-6 md:p-8">
            <!-- Formulaire de connexion -->
            <form *ngIf="!showRegister" (ngSubmit)="onSubmit()" class="space-y-5">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
                    </svg>
                  </div>
                  <input type="email" 
                         [(ngModel)]="email" 
                         name="email" 
                         required
                         placeholder="votre.email@exemple.com"
                         autocomplete="email"
                         class="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/50">
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Mot de passe</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                  </div>
                  <input type="password" 
                         [(ngModel)]="password" 
                         name="password" 
                         required
                         placeholder="••••••••"
                         autocomplete="current-password"
                         class="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/50">
                </div>
              </div>
              
              <div *ngIf="error" class="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <p class="text-sm text-red-600 font-medium">{{ error }}</p>
                </div>
              </div>
              
              <button type="submit" 
                      [disabled]="loading"
                      class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] font-semibold flex items-center justify-center gap-2">
                <svg *ngIf="loading" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{{ loading ? 'Connexion...' : 'Se connecter' }}</span>
              </button>
            </form>
            
            <!-- Formulaire d'inscription -->
            <form *ngIf="showRegister" (ngSubmit)="onRegister()" class="space-y-4">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-900">Inscription</h3>
                <button type="button" 
                        (click)="showRegister = false"
                        class="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1">Email *</label>
                  <input type="email" 
                         [(ngModel)]="registerData.email" 
                         name="registerEmail" 
                         placeholder="Email" 
                         required
                         class="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/50 text-sm">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1">Mot de passe *</label>
                  <input type="password" 
                         [(ngModel)]="registerData.password" 
                         name="registerPassword" 
                         placeholder="Mot de passe" 
                         required
                         class="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/50 text-sm">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1">Pseudo</label>
                  <input type="text" 
                         [(ngModel)]="registerData.pseudo" 
                         name="pseudo" 
                         placeholder="Pseudo"
                         class="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/50 text-sm">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1">Prénom</label>
                  <input type="text" 
                         [(ngModel)]="registerData.prenom" 
                         name="prenom" 
                         placeholder="Prénom"
                         class="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/50 text-sm">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1">Nom</label>
                  <input type="text" 
                         [(ngModel)]="registerData.nom" 
                         name="nom" 
                         placeholder="Nom"
                         class="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/50 text-sm">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1">Âge</label>
                  <input type="number" 
                         [(ngModel)]="registerData.age" 
                         name="age" 
                         placeholder="Âge"
                         class="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/50 text-sm">
                </div>
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1">Téléphone</label>
                <input type="text" 
                       [(ngModel)]="registerData.telephone" 
                       name="telephone" 
                       placeholder="Téléphone"
                       class="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/50 text-sm">
              </div>
              
              <button type="submit" 
                      [disabled]="loading"
                      class="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] font-semibold flex items-center justify-center gap-2">
                <svg *ngIf="loading" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{{ loading ? 'Inscription...' : 'S\'inscrire' }}</span>
              </button>
            </form>
            
            <!-- Liens de navigation -->
            <div *ngIf="!showRegister" class="mt-6 space-y-3 text-center pt-6 border-t border-gray-200">
              <p class="text-sm text-gray-600">
                Pas encore de compte ? 
                <a (click)="showRegister = !showRegister" 
                   class="text-blue-600 hover:text-blue-800 cursor-pointer font-semibold transition-colors">
                  S'inscrire
                </a>
              </p>
              <p class="text-sm text-gray-600">
                Mot de passe oublié ? 
                <a routerLink="/reset-password" 
                   class="text-orange-600 hover:text-orange-800 cursor-pointer font-semibold transition-colors flex items-center justify-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                  </svg>
                  Réinitialiser
                </a>
              </p>
            </div>
            
            <div *ngIf="showRegister" class="mt-6 text-center pt-6 border-t border-gray-200">
              <p class="text-sm text-gray-600">
                Déjà un compte ? 
                <a (click)="showRegister = false" 
                   class="text-blue-600 hover:text-blue-800 cursor-pointer font-semibold transition-colors">
                  Se connecter
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  loading = false;
  showRegister = false;
  
  registerData = {
    email: '',
    password: '',
    pseudo: '',
    prenom: '',
    nom: '',
    age: null as number | null,
    telephone: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.loading = true;
    this.error = '';
    
    if (!this.email || !this.password) {
      this.error = 'Veuillez remplir tous les champs';
      this.loading = false;
      return;
    }
    
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Erreur de connexion:', err);
        this.loading = false;
        if (err.status === 401) {
          this.error = 'Email ou mot de passe incorrect';
        } else if (err.status === 0) {
          this.error = 'Impossible de joindre le serveur. Vérifiez que le backend est démarré.';
        } else if (err.error?.message) {
          this.error = err.error.message;
        } else {
          this.error = 'Erreur lors de la connexion. Veuillez réessayer.';
        }
      }
    });
  }

  onRegister(): void {
    this.loading = true;
    this.error = '';
    
    if (!this.registerData.email || !this.registerData.password) {
      this.error = 'L\'email et le mot de passe sont obligatoires';
      this.loading = false;
      return;
    }
    
    this.authService.register(this.registerData).subscribe({
      next: (response) => {
        this.loading = false;
        this.error = 'Inscription réussie ! Vous pouvez maintenant vous connecter.';
        this.showRegister = false;
        // Réinitialiser le formulaire
        this.registerData = {
          email: '',
          password: '',
          pseudo: '',
          prenom: '',
          nom: '',
          age: null,
          telephone: ''
        };
      },
      error: (err) => {
        console.error('Erreur d\'inscription:', err);
        this.loading = false;
        if (err.status === 0) {
          this.error = 'Impossible de joindre le serveur. Vérifiez que le backend est démarré.';
        } else if (err.error?.errors) {
          // Erreurs de validation Symfony
          const errors = typeof err.error.errors === 'string' 
            ? err.error.errors 
            : JSON.stringify(err.error.errors);
          this.error = 'Erreurs de validation : ' + errors;
        } else if (err.error?.message) {
          this.error = err.error.message;
        } else {
          this.error = 'Erreur lors de l\'inscription. Veuillez vérifier vos informations.';
        }
      }
    });
  }
}
