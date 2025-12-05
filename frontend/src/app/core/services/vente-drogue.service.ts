import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface VenteDrogue {
  id: number;
  vendeur: {
    id: number;
    pseudo?: string;
    email: string;
  };
  nbPochons: number;
  prixVenteUnitaire: string;
  prixAchatUnitaire: string;
  benefice: string;
  commission: string;
  beneficeGroupe: string;
  commentaire?: string;
  createdAt: string;
}

export interface VenteDrogueStats {
  global: {
    totalVentes: number;
    totalPochons: number;
    totalCommissions: string;
    totalBeneficeGroupe: string;
  };
  parVendeur: Array<{
    vendeur: {
      id: number;
      pseudo?: string;
      email: string;
    };
    nbVentes: number;
    totalPochons: number;
    totalCommission: number;
    totalBeneficeGroupe: number;
  }>;
}

export interface CreateVenteDrogueRequest {
  vendeurId: number;
  nbPochons: number;
  prixVenteUnitaire: number;
  prixAchatUnitaire?: number;
  commentaire?: string;
}

@Injectable({
  providedIn: 'root'
})
export class VenteDrogueService {
  private apiUrl = '/api/vente-drogue';

  constructor(private http: HttpClient) {}

  getVentes(): Observable<VenteDrogue[]> {
    return this.http.get<VenteDrogue[]>(this.apiUrl);
  }

  getStats(): Observable<VenteDrogueStats> {
    return this.http.get<VenteDrogueStats>(`${this.apiUrl}/stats`);
  }

  createVente(vente: CreateVenteDrogueRequest): Observable<VenteDrogue> {
    return this.http.post<VenteDrogue>(this.apiUrl, vente);
  }

  deleteVente(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}

