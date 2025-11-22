import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Arme {
  id: number;
  nom: string;
  type?: string;
  description?: string;
  sortiePar?: {
    id: number;
    pseudo?: string;
    email: string;
  };
  dateSortie?: string;
  commentaireSortie?: string;
  enSortie: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ArmeService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getArmes(): Observable<Arme[]> {
    return this.http.get<Arme[]>(`${this.apiUrl}/armes`);
  }

  createArme(nom: string, type?: string, description?: string): Observable<Arme> {
    return this.http.post<Arme>(`${this.apiUrl}/armes`, {
      nom,
      type,
      description
    });
  }

  updateArme(id: number, data: Partial<Arme>): Observable<Arme> {
    return this.http.put<Arme>(`${this.apiUrl}/armes/${id}`, data);
  }

  deleteArme(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/armes/${id}`);
  }

  sortieArme(id: number, userId: number, commentaire?: string): Observable<Arme> {
    return this.http.post<Arme>(`${this.apiUrl}/armes/${id}/sortie`, {
      userId,
      commentaire
    });
  }

  retourArme(id: number): Observable<Arme> {
    return this.http.post<Arme>(`${this.apiUrl}/armes/${id}/retour`, {});
  }

  resetAll(): Observable<{ message: string; count: number }> {
    return this.http.post<{ message: string; count: number }>(`${this.apiUrl}/armes/reset`, {});
  }
}

