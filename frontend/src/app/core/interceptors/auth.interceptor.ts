import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Gérer les erreurs 401 (Unauthorized) sans déconnecter immédiatement
      if (error.status === 401) {
        // Si c'est une erreur sur /api/me, on ne fait rien (l'utilisateur sera déconnecté seulement s'il essaie d'accéder à une page)
        if (req.url.includes('/api/me')) {
          return throwError(() => error);
        }
        // Pour les autres erreurs 401, on essaye de recharger l'utilisateur une fois
        if (!req.url.includes('/api/login')) {
          console.warn('Token peut-être expiré, mais on reste connecté');
          // Ne pas déconnecter automatiquement, laisser l'utilisateur continuer
        }
      }
      return throwError(() => error);
    })
  );
};
