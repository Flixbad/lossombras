import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
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

  // Rôles admin : Jefe, Segundo, Comandante, Alferez, Capitan
  const adminRoles = [
    'ROLE_JEFE',
    'ROLE_SEGUNDO',
    'ROLE_COMANDANTE',
    'ROLE_ALFERES',
    'ROLE_CAPITAN'
  ];

  const isAdmin = user.roles.some(role => adminRoles.includes(role));

  if (!isAdmin) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};

