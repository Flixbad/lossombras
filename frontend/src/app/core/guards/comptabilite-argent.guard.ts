import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const comptabiliteArgentGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  const user = authService.getCurrentUser();
  if (!user) {
    console.warn('[comptabiliteArgentGuard] Aucun utilisateur trouvé');
    router.navigate(['/login']);
    return false;
  }

  if (!user.roles || !Array.isArray(user.roles)) {
    console.warn('[comptabiliteArgentGuard] Utilisateur sans rôles ou rôles invalides', user);
    router.navigate(['/dashboard']);
    return false;
  }

  // Rôles autorisés : Jefe, Segundo Commandanté, Alférez, et Contador uniquement
  const authorizedRoles = [
    'ROLE_JEFE',
    'ROLE_SEGUNDO',
    'ROLE_ALFERES',
    'ROLE_CONTADOR'
  ];

  const hasAccess = user.roles.some(role => authorizedRoles.includes(role));

  if (!hasAccess) {
    console.warn('[comptabiliteArgentGuard] Accès refusé. Rôles de l\'utilisateur:', user.roles, 'Rôles autorisés:', authorizedRoles);
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};

