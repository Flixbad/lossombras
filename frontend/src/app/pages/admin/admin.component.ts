import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { User } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8">
      <h1 class="text-3xl font-bold text-gray-800">Administration - Gestion des utilisateurs</h1>
      
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pseudo</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prénom</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Âge</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Téléphone</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let user of users">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ user.pseudo || '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.email }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.prenom || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.nom || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.age || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.telephone || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ getRoleDisplay(user.roles) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <button (click)="openEditModal(user)" 
                        class="text-blue-600 hover:text-blue-800 mr-3">Modifier</button>
                <button (click)="deleteUser(user.id)" 
                        class="text-red-600 hover:text-red-800">Supprimer</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div *ngIf="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <h2 class="text-2xl font-bold mb-4">Modifier l'utilisateur</h2>
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
              <label class="block text-sm font-medium mb-2">Rôle</label>
              <select [(ngModel)]="selectedRole" (change)="onRoleChange()" name="roles" required
                      class="w-full px-4 py-2 border rounded-md">
                <option value="ROLE_NUEVOS">Nuevos</option>
                <option value="ROLE_SOLDADO">Soldado</option>
                <option value="ROLE_SICARIO">Sicario</option>
                <option value="ROLE_CAPITAN">Capitan</option>
                <option value="ROLE_ALFERES">Alfères</option>
                <option value="ROLE_COMANDANTE">Comandante</option>
                <option value="ROLE_SEGUNDO">Segundo</option>
                <option value="ROLE_JEFE">Jefe</option>
              </select>
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
  selectedRole = 'ROLE_NUEVOS';
  
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
    'ROLE_JEFE': 'Jefe'
  };

  constructor(private adminService: AdminService) {}

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
    const role = user.roles.find(r => r.startsWith('ROLE_') && r !== 'ROLE_USER');
    this.selectedRole = role || 'ROLE_NUEVOS';
    this.editUserData = {
      pseudo: user.pseudo || '',
      prenom: user.prenom || '',
      nom: user.nom || '',
      age: user.age || undefined,
      telephone: user.telephone || '',
      roles: [this.selectedRole]
    };
    this.showEditModal = true;
  }

  onRoleChange(): void {
    this.editUserData.roles = [this.selectedRole];
  }

  updateUser(): void {
    if (!this.selectedUser || !this.selectedUser.id) return;
    
    this.adminService.updateUser(this.selectedUser.id, this.editUserData).subscribe({
      next: () => {
        this.showEditModal = false;
        this.loadUsers();
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
    const role = roles.find(r => r.startsWith('ROLE_') && r !== 'ROLE_USER');
    return role ? (this.rolesMap[role] || role) : 'Nuevos';
  }
}
