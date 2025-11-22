import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Comptabilite {
  id: number;
  article: {
    id: number;
    nom: string;
    type?: string;
    unite?: string;
  };
  type: string;
  quantite: string;
  commentaire?: string;
  user?: {
    id: number;
    pseudo?: string;
    email: string;
  };
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ComptabiliteService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  getComptabilite(): Observable<Comptabilite[]> {
    return this.http.get<Comptabilite[]>(`${this.apiUrl}/comptabilite`);
  }
}
