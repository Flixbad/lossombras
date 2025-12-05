import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const capitanGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  const user = authService.getCurrentUser();
  if (!user) {
    console.warn('[capitanGuard] Aucun utilisateur trouvé');
    router.navigate(['/login']);
    return false;
  }

  if (!user.roles || !Array.isArray(user.roles)) {
    console.warn('[capitanGuard] Utilisateur sans rôles ou rôles invalides', user);
    router.navigate(['/dashboard']);
    return false;
  }

  // Rôles autorisés : Capitan et au-dessus, ou Contador
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
    console.warn('[capitanGuard] Accès refusé. Rôles de l\'utilisateur:', user.roles, 'Rôles autorisés:', authorizedRoles);
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};

