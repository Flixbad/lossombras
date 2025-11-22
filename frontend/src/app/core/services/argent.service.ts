import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Argent {
  id: number;
  type: string;
  montant: string;
  commentaire?: string;
  user?: {
    id: number;
    pseudo?: string;
    email: string;
  };
  createdAt: string;
}

export interface ArgentStats {
  totalAjoute: number;
  totalRetire: number;
  solde: number;
  parMois: { [key: string]: { ajout: number; retrait: number } };
  parSemaine?: { [key: string]: { ajout: number; retrait: number } };
  parJour?: { [key: string]: { ajout: number; retrait: number } };
  parUser: Array<{
    user: {
      id: number;
      pseudo?: string;
      email: string;
    };
    ajout: number;
    retrait: number;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class ArgentService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getArgent(): Observable<Argent[]> {
    return this.http.get<Argent[]>(`${this.apiUrl}/argent`);
  }

  getStats(period: 'jour' | 'semaine' | 'mois' = 'mois'): Observable<ArgentStats> {
    return this.http.get<ArgentStats>(`${this.apiUrl}/argent/stats?period=${period}`);
  }

  createArgent(type: string, montant: number, commentaire?: string): Observable<Argent> {
    return this.http.post<Argent>(`${this.apiUrl}/argent`, {
      type,
      montant,
      commentaire
    });
  }

  deleteArgent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/argent/${id}`);
  }
}

