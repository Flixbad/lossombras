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
    router.navigate(['/login']);
    return false;
  }

  // Rôles autorisés : Capitan et au-dessus
  const authorizedRoles = [
    'ROLE_CAPITAN',
    'ROLE_ALFERES',
    'ROLE_COMANDANTE',
    'ROLE_SEGUNDO',
    'ROLE_JEFE'
  ];

  const hasAccess = user.roles.some(role => authorizedRoles.includes(role));

  if (!hasAccess) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};

