import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  id: number;
  email: string;
  prenom?: string;
  nom?: string;
  age?: number | null;
  telephone?: string;
  pseudo?: string;
  roles: string[];
}

export interface LoginResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Toujours charger l'utilisateur au démarrage si token présent
    const token = localStorage.getItem('token');
    if (token) {
      this.loadCurrentUser();
    }
  }
  
  // Initialiser la session au démarrage de l'app
  initializeSession(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.loadCurrentUser();
    }
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        this.loadCurrentUser();
      })
    );
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  loadCurrentUser(): void {
    // Charger d'abord depuis le cache pour un affichage immédiat
    const cachedUser = localStorage.getItem('currentUser');
    if (cachedUser) {
      try {
        const user = JSON.parse(cachedUser);
        this.currentUserSubject.next(user);
      } catch (e) {
        // Ignorer les erreurs de parsing
      }
    }

    // Ensuite, charger depuis l'API pour mettre à jour
    this.http.get<User>(`${this.apiUrl}/me`).subscribe({
      next: (user) => {
        this.currentUserSubject.next(user);
        // Sauvegarder l'utilisateur dans localStorage pour persistance
        if (user) {
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
      },
      error: (err) => {
        // Si erreur 401, garder l'utilisateur en cache si disponible
        if (err.status === 401) {
          const cachedUser = localStorage.getItem('currentUser');
          if (!cachedUser) {
            // Pas de cache, déconnecter seulement si vraiment nécessaire
            this.logout();
          } else {
            // Garder l'utilisateur en cache même en cas d'erreur API
            console.warn('Session en cache conservée');
          }
        } else {
          // Pour les autres erreurs (réseau, etc.), garder l'utilisateur en cache
          console.warn('Erreur réseau, utilisation du cache');
        }
      }
    });
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    // Vérifier aussi si on a un utilisateur en cache
    const cachedUser = localStorage.getItem('currentUser');
    return !!token || !!cachedUser;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
