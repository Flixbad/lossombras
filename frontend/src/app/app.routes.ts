import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { capitanGuard } from './core/guards/capitan.guard';
import { adminGuard } from './core/guards/admin.guard';
import { drogueGuard } from './core/guards/drogue.guard';

export const routes: Routes = [
  { 
    path: 'login', 
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent), 
    canActivate: [authGuard] 
  },
  { 
    path: 'stock', 
    loadComponent: () => import('./pages/stock/stock.component').then(m => m.StockComponent), 
    canActivate: [authGuard] 
  },
  { 
    path: 'stock-drogue', 
    loadComponent: () => import('./pages/stock-drogue/stock-drogue.component').then(m => m.StockDrogueComponent), 
    canActivate: [authGuard, drogueGuard] 
  },
  { 
    path: 'vehicules', 
    loadComponent: () => import('./pages/vehicules/vehicules.component').then(m => m.VehiculesComponent), 
    canActivate: [authGuard] 
  },
  { 
    path: 'comptabilite', 
    loadComponent: () => import('./pages/comptabilite/comptabilite.component').then(m => m.ComptabiliteComponent), 
    canActivate: [authGuard] 
  },
  { 
    path: 'comptabilite-argent', 
    loadComponent: () => import('./pages/comptabilite-argent/comptabilite-argent.component').then(m => m.ComptabiliteArgentComponent), 
    canActivate: [authGuard, capitanGuard] 
  },
  { 
    path: 'armes', 
    loadComponent: () => import('./pages/armes/armes.component').then(m => m.ArmesComponent), 
    canActivate: [authGuard, adminGuard] 
  },
  { 
    path: 'admin', 
    loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent), 
    canActivate: [authGuard, adminGuard] 
  },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }
];
