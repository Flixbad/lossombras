import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { AuthService, User } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 md:space-y-8">
      <div>
        <h1 class="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-800 bg-clip-text text-transparent mb-2">Administration</h1>
        <p class="text-gray-600 text-sm md:text-base">Gestion des utilisateurs et des permissions</p>
      </div>
      
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-gray-100/50">
        <div class="p-5 md:p-7 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-900">Gestion des utilisateurs</h2>
              <p class="text-xs text-gray-500">Liste complète des membres</p>
            </div>
          </div>
        </div>
        
        <!-- Tableau desktop (visible sur md et plus) -->
        <div class="hidden md:block overflow-x-auto">
          <table class="min-w-full">
            <thead>
              <tr class="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                <th class="px-4 lg:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Pseudo</th>
                <th class="px-4 lg:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
                <th class="px-4 lg:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden lg:table-cell">Prénom</th>
                <th class="px-4 lg:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden lg:table-cell">Nom</th>
                <th class="px-4 lg:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden xl:table-cell">Âge</th>
                <th class="px-4 lg:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden xl:table-cell">Téléphone</th>
                <th class="px-4 lg:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Rôle</th>
                <th class="px-4 lg:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr *ngFor="let user of users" class="hover:bg-gray-50/50 transition-colors">
                <td class="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  {{ user.pseudo || '-' }}
                </td>
                <td class="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-600 truncate max-w-[150px] lg:max-w-none">{{ user.email }}</td>
                <td class="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden lg:table-cell">{{ user.prenom || '-' }}</td>
                <td class="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden lg:table-cell">{{ user.nom || '-' }}</td>
                <td class="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden xl:table-cell">{{ user.age || '-' }}</td>
                <td class="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden xl:table-cell">{{ user.telephone || '-' }}</td>
                <td class="px-4 lg:px-6 py-4 whitespace-nowrap">
                  <div class="flex flex-wrap gap-1">
                    <span *ngFor="let role of user.roles || []" 
                          class="px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold">
                      {{ role.replace('ROLE_', '') }}
                    </span>
                  </div>
                </td>
                <td class="px-4 lg:px-6 py-4 whitespace-nowrap text-sm">
                  <div class="flex gap-2">
                    <button (click)="openEditModal(user)" 
                            class="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-semibold transition-colors text-xs whitespace-nowrap">Modifier</button>
                    <button (click)="deleteUser(user.id)" 
                            class="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-semibold transition-colors text-xs whitespace-nowrap">Supprimer</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Vue mobile (visible sur petits écrans) -->
        <div class="md:hidden divide-y divide-gray-100">
          <div *ngFor="let user of users" class="p-4 hover:bg-gray-50/50 transition-colors">
            <div class="flex items-start justify-between gap-3 mb-3">
              <div class="flex-1 min-w-0">
                <h3 class="text-sm font-semibold text-gray-900 truncate">{{ user.pseudo || 'Sans pseudo' }}</h3>
                <p class="text-xs text-gray-600 truncate">{{ user.email }}</p>
              </div>
              <div class="flex gap-2 flex-shrink-0">
                <button (click)="openEditModal(user)" 
                        class="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-semibold transition-colors text-xs whitespace-nowrap">Modifier</button>
                <button (click)="deleteUser(user.id)" 
                        class="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-semibold transition-colors text-xs whitespace-nowrap">Supprimer</button>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
              <div *ngIf="user.prenom">
                <span class="font-medium">Prénom:</span> {{ user.prenom }}
              </div>
              <div *ngIf="user.nom">
                <span class="font-medium">Nom:</span> {{ user.nom }}
              </div>
              <div *ngIf="user.age">
                <span class="font-medium">Âge:</span> {{ user.age }}
              </div>
              <div *ngIf="user.telephone">
                <span class="font-medium">Tél:</span> {{ user.telephone }}
              </div>
            </div>
            
            <div class="flex flex-wrap gap-1">
              <span *ngFor="let role of user.roles || []" 
                    class="px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold">
                {{ role.replace('ROLE_', '') }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div *ngIf="showEditModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
        <div class="bg-white rounded-2xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 animate-in slide-in-from-bottom-4 duration-300">
          <div class="mb-6">
            <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Modifier l'utilisateur</h2>
            <p class="text-sm text-gray-500">Mise à jour des informations et permissions</p>
          </div>
          <form (ngSubmit)="updateUser()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">Pseudo</label>
              <input type="text" [(ngModel)]="editUserData.pseudo" name="pseudo"
                     class="w-full px-4 py-2 border rounded-md">
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Prénom</label>
              <input type="text" [(ngModel)]="editUserData.prenom" name="prenom"
                     class="w-full px-4 py-2 border rounded-md">
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Nom</label>
              <input type="text" [(ngModel)]="editUserData.nom" name="nom"
                     class="w-full px-4 py-2 border rounded-md">
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Âge</label>
              <input type="number" [(ngModel)]="editUserData.age" name="age"
                     class="w-full px-4 py-2 border rounded-md">
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Téléphone</label>
              <input type="text" [(ngModel)]="editUserData.telephone" name="telephone"
                     class="w-full px-4 py-2 border rounded-md">
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Rôles</label>
              <p class="text-xs text-gray-500 mb-3">Vous pouvez sélectionner plusieurs rôles</p>
              <div class="space-y-2 border rounded-md p-3 max-h-64 overflow-y-auto">
                <label class="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input type="checkbox" 
                         [(ngModel)]="selectedRoles['ROLE_NUEVOS']"
                         (change)="onRoleCheckChange()"
                         name="role_nuevos"
                         class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500">
                  <span class="text-sm">Nuevos</span>
                </label>
                <label class="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input type="checkbox" 
                         [(ngModel)]="selectedRoles['ROLE_SOLDADO']"
                         (change)="onRoleCheckChange()"
                         name="role_soldado"
                         class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500">
                  <span class="text-sm">Soldado</span>
                </label>
                <label class="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input type="checkbox" 
                         [(ngModel)]="selectedRoles['ROLE_SICARIO']"
                         (change)="onRoleCheckChange()"
                         name="role_sicario"
                         class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500">
                  <span class="text-sm">Sicario</span>
                </label>
                <label class="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input type="checkbox" 
                         [(ngModel)]="selectedRoles['ROLE_CAPITAN']"
                         (change)="onRoleCheckChange()"
                         name="role_capitan"
                         class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500">
                  <span class="text-sm">Capitan</span>
                </label>
                <label class="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input type="checkbox" 
                         [(ngModel)]="selectedRoles['ROLE_ALFERES']"
                         (change)="onRoleCheckChange()"
                         name="role_alfères"
                         class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500">
                  <span class="text-sm">Alfères</span>
                </label>
                <label class="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input type="checkbox" 
                         [(ngModel)]="selectedRoles['ROLE_COMANDANTE']"
                         (change)="onRoleCheckChange()"
                         name="role_comandante"
                         class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500">
                  <span class="text-sm">Comandante</span>
                </label>
                <label class="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input type="checkbox" 
                         [(ngModel)]="selectedRoles['ROLE_SEGUNDO']"
                         (change)="onRoleCheckChange()"
                         name="role_segundo"
                         class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500">
                  <span class="text-sm">Segundo</span>
                </label>
                <label class="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input type="checkbox" 
                         [(ngModel)]="selectedRoles['ROLE_JEFE']"
                         (change)="onRoleCheckChange()"
                         name="role_jefe"
                         class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500">
                  <span class="text-sm">Jefe</span>
                </label>
                <label class="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded border-t pt-2 mt-2">
                  <input type="checkbox" 
                         [(ngModel)]="selectedRoles['ROLE_GESTION_DROGUE']"
                         (change)="onRoleCheckChange()"
                         name="role_gestion_drogue"
                         class="w-4 h-4 text-purple-600 rounded focus:ring-purple-500">
                  <span class="text-sm font-medium text-purple-700">Gestion Drogue</span>
                </label>
                <label class="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded border-t pt-2 mt-2">
                  <input type="checkbox" 
                         [(ngModel)]="selectedRoles['ROLE_CONTADOR']"
                         (change)="onRoleCheckChange()"
                         name="role_contador"
                         class="w-4 h-4 text-green-600 rounded focus:ring-green-500">
                  <span class="text-sm font-medium text-green-700">Contador</span>
                </label>
                <label class="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded border-t pt-2 mt-2">
                  <input type="checkbox" 
                         [(ngModel)]="selectedRoles['ROLE_ARMADA']"
                         (change)="onRoleCheckChange()"
                         name="role_armada"
                         class="w-4 h-4 text-orange-600 rounded focus:ring-orange-500">
                  <span class="text-sm font-medium text-orange-700">Armada</span>
                </label>
              </div>
            </div>
            <div class="flex gap-4">
              <button type="submit" class="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                Modifier
              </button>
              <button type="button" (click)="showEditModal = false" 
                      class="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400">
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AdminComponent implements OnInit {
  users: User[] = [];
  showEditModal = false;
  selectedUser: User | null = null;
  selectedRoles: { [key: string]: boolean } = {};
  
  editUserData = {
    pseudo: '',
    prenom: '',
    nom: '',
    age: undefined as number | undefined,
    telephone: '',
    roles: [] as string[]
  };

  rolesMap: { [key: string]: string } = {
    'ROLE_NUEVOS': 'Nuevos',
    'ROLE_SOLDADO': 'Soldado',
    'ROLE_SICARIO': 'Sicario',
    'ROLE_CAPITAN': 'Capitan',
    'ROLE_ALFERES': 'Alfères',
    'ROLE_COMANDANTE': 'Comandante',
    'ROLE_SEGUNDO': 'Segundo',
    'ROLE_JEFE': 'Jefe',
    'ROLE_GESTION_DROGUE': 'Gestion Drogue',
    'ROLE_CONTADOR': 'Contador',
    'ROLE_ARMADA': 'Armada'
  };

  constructor(
    private adminService: AdminService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.adminService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des utilisateurs', err);
      }
    });
  }

  openEditModal(user: User): void {
    this.selectedUser = user;
    
    // Initialiser les checkboxes avec les rôles actuels de l'utilisateur
    this.selectedRoles = {
      'ROLE_NUEVOS': false,
      'ROLE_SOLDADO': false,
      'ROLE_SICARIO': false,
      'ROLE_CAPITAN': false,
      'ROLE_ALFERES': false,
      'ROLE_COMANDANTE': false,
      'ROLE_SEGUNDO': false,
      'ROLE_JEFE': false,
      'ROLE_GESTION_DROGUE': false,
      'ROLE_CONTADOR': false,
      'ROLE_ARMADA': false
    };
    
    // Cocher les rôles existants (en excluant ROLE_USER qui est automatique)
    user.roles.forEach(role => {
      if (role !== 'ROLE_USER' && this.selectedRoles.hasOwnProperty(role)) {
        this.selectedRoles[role] = true;
      }
    });
    
    // S'assurer qu'au moins un rôle hiérarchique est sélectionné ou un rôle spécial
    const specialRoles = ['ROLE_GESTION_DROGUE', 'ROLE_CONTADOR', 'ROLE_ARMADA'];
    const hasHierarchicalRole = Object.keys(this.selectedRoles).some(
      key => this.selectedRoles[key] && !specialRoles.includes(key)
    );
    const hasSpecialRole = specialRoles.some(role => this.selectedRoles[role]);
    if (!hasHierarchicalRole && !hasSpecialRole) {
      this.selectedRoles['ROLE_NUEVOS'] = true;
    }
    
    this.updateRolesFromCheckboxes();
    
    this.editUserData = {
      pseudo: user.pseudo || '',
      prenom: user.prenom || '',
      nom: user.nom || '',
      age: user.age || undefined,
      telephone: user.telephone || '',
      roles: this.editUserData.roles
    };
    this.showEditModal = true;
  }

  onRoleCheckChange(): void {
    this.updateRolesFromCheckboxes();
  }

  updateRolesFromCheckboxes(): void {
    const selectedRoleKeys = Object.keys(this.selectedRoles).filter(
      key => this.selectedRoles[key]
    );
    
    // Si aucun rôle hiérarchique n'est sélectionné, mais un rôle spécial l'est,
    // on garde au moins ROLE_NUEVOS pour la hiérarchie
    const hierarchicalRoles = ['ROLE_NUEVOS', 'ROLE_SOLDADO', 'ROLE_SICARIO', 
                               'ROLE_CAPITAN', 'ROLE_ALFERES', 'ROLE_COMANDANTE', 
                               'ROLE_SEGUNDO', 'ROLE_JEFE'];
    const specialRoles = ['ROLE_GESTION_DROGUE', 'ROLE_CONTADOR', 'ROLE_ARMADA'];
    const hasHierarchicalRole = selectedRoleKeys.some(
      key => hierarchicalRoles.includes(key)
    );
    const hasSpecialRole = specialRoles.some(role => selectedRoleKeys.includes(role));
    
    if (!hasHierarchicalRole && hasSpecialRole) {
      this.selectedRoles['ROLE_NUEVOS'] = true;
      selectedRoleKeys.push('ROLE_NUEVOS');
    }
    
    this.editUserData.roles = selectedRoleKeys;
  }

  updateUser(): void {
    if (!this.selectedUser || !this.selectedUser.id) return;
    
    this.adminService.updateUser(this.selectedUser.id, this.editUserData).subscribe({
      next: () => {
        this.showEditModal = false;
        this.loadUsers();
        
        // Si l'utilisateur modifie ses propres rôles, recharger sa session
        const currentUser = this.authService.getCurrentUser();
        if (currentUser && currentUser.id === this.selectedUser?.id) {
          console.log('[Admin] Rechargement de la session utilisateur après modification des rôles');
          this.authService.reloadUser();
        }
      },
      error: () => {
        alert('Erreur lors de la modification de l\'utilisateur');
      }
    });
  }

  deleteUser(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      this.adminService.deleteUser(id).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: () => {
          alert('Erreur lors de la suppression de l\'utilisateur');
        }
      });
    }
  }

  getRoleDisplay(roles: string[]): string {
    const relevantRoles = roles.filter(r => r.startsWith('ROLE_') && r !== 'ROLE_USER');
    if (relevantRoles.length === 0) {
      return 'Nuevos';
    }
    if (relevantRoles.length === 1) {
      return this.rolesMap[relevantRoles[0]] || relevantRoles[0];
    }
    // Afficher les rôles séparés par des virgules
    return relevantRoles.map(r => this.rolesMap[r] || r).join(', ');
  }
}
