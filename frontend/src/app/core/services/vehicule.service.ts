import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ContenuVehicule {
  id: number;
  article: {
    id: number;
    nom: string;
    type?: string;
    unite?: string;
  };
  quantite: string;
}

export interface Vehicule {
  id: number;
  plaque: string;
  modele: string;
  couleur?: string;
  proprietaire?: string;
  emplacement?: string;
  contenus: ContenuVehicule[];
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class VehiculeService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getVehicules(): Observable<Vehicule[]> {
    return this.http.get<Vehicule[]>(`${this.apiUrl}/vehicules`);
  }

  createVehicule(vehicule: Partial<Vehicule>): Observable<Vehicule> {
    return this.http.post<Vehicule>(`${this.apiUrl}/vehicules`, vehicule);
  }

  updateVehicule(id: number, vehicule: Partial<Vehicule>): Observable<Vehicule> {
    return this.http.put<Vehicule>(`${this.apiUrl}/vehicules/${id}`, vehicule);
  }

  deleteVehicule(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/vehicules/${id}`);
  }
}
