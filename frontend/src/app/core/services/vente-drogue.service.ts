import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface VenteDrogue {
  id: number;
  typeDrogue?: string;
  vendeur: {
    id: number;
    pseudo?: string;
    email: string;
  };
  montantVenteTotal: string;
  prixAchatUnitaire: string;
  coutAchatTotal?: string;
  nbPochonsApproximatif?: number;
  benefice: string;
  commission: string;
  beneficeGroupe: string;
  commentaire?: string;
  createdAt: string;
}

export interface VenteDrogueStats {
  global: {
    totalVentes: number;
    totalRecette: string;
    totalPochonsApproximatif?: number;
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
    totalRecette: number;
    totalPochonsApproximatif?: number;
    totalCommission: number;
    totalBeneficeGroupe: number;
  }>;
}

export interface CreateVenteDrogueRequest {
  vendeurId: number;
  typeDrogue?: string;
  montantVenteTotal: number;
  prixAchatUnitaire?: number;
  commentaire?: string;
}

export interface DrogueType {
  nom: string;
  unite: string;
  prixAchatUnitaire: number;
  prixVenteUnitaire: number;
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

  getTypes(): Observable<{ [key: string]: DrogueType }> {
    return this.http.get<{ [key: string]: DrogueType }>(`${this.apiUrl}/types`);
  }
}

