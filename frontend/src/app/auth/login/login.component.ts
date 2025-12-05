import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h2 class="text-3xl font-bold text-center mb-8 text-gray-800">Los Sombras</h2>
        
        <form (ngSubmit)="onSubmit()" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input type="email" [(ngModel)]="email" name="email" required
                   class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
            <input type="password" [(ngModel)]="password" name="password" required
                   class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          </div>
          
          <div *ngIf="error" class="text-red-600 text-sm">{{ error }}</div>
          
          <button type="submit" [disabled]="loading"
                  class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition">
            {{ loading ? 'Connexion...' : 'Se connecter' }}
          </button>
        </form>
        
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Pas encore de compte ? 
            <a (click)="showRegister = !showRegister" class="text-blue-600 hover:underline cursor-pointer">
              S'inscrire
            </a>
          </p>
        </div>
        
        <div *ngIf="showRegister" class="mt-6 pt-6 border-t border-gray-200">
          <h3 class="text-xl font-semibold mb-4">Inscription</h3>
          <form (ngSubmit)="onRegister()" class="space-y-4">
            <input type="email" [(ngModel)]="registerData.email" name="registerEmail" placeholder="Email" required
                   class="w-full px-4 py-2 border border-gray-300 rounded-md">
            <input type="password" [(ngModel)]="registerData.password" name="registerPassword" placeholder="Mot de passe" required
                   class="w-full px-4 py-2 border border-gray-300 rounded-md">
            <input type="text" [(ngModel)]="registerData.pseudo" name="pseudo" placeholder="Pseudo"
                   class="w-full px-4 py-2 border border-gray-300 rounded-md">
            <input type="text" [(ngModel)]="registerData.prenom" name="prenom" placeholder="Prénom"
                   class="w-full px-4 py-2 border border-gray-300 rounded-md">
            <input type="text" [(ngModel)]="registerData.nom" name="nom" placeholder="Nom"
                   class="w-full px-4 py-2 border border-gray-300 rounded-md">
            <input type="number" [(ngModel)]="registerData.age" name="age" placeholder="Âge"
                   class="w-full px-4 py-2 border border-gray-300 rounded-md">
            <input type="text" [(ngModel)]="registerData.telephone" name="telephone" placeholder="Téléphone"
                   class="w-full px-4 py-2 border border-gray-300 rounded-md">
            
            <button type="submit" [disabled]="loading"
                    class="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 transition">
              S'inscrire
            </button>
          </form>
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
