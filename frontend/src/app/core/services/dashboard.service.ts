import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardData {
  stats: {
    totalArticles: number;
    totalVehicules: number;
    totalUsers: number;
  };
  dernieresOperations: Array<{
    id: number;
    article: string;
    type: string;
    quantite: string;
    user: string | null;
    createdAt: string;
  }>;
  topArticles?: Array<{
    id: number;
    nom: string;
    quantite: number;
  }>;
  alertesStock?: Array<{
    id: number;
    article: string;
    quantite: number;
    unite: string;
  }>;
  tendancesStock?: Array<{
    date: string;
    entrees: number;
    sorties: number;
  }>;
  tendancesArgent?: Array<{
    date: string;
    ajouts: number;
    retraits: number;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.apiUrl}/dashboard`);
  }
}
