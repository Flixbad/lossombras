import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PariBoxe {
  id: number;
  groupe?: {
    id: number;
    pseudo?: string;
    email: string;
  } | null;
  nomGroupe?: string;
  montantMise: string;
  combatId: string;
  combatTitre: string;
  combatantParie: string;
  statut: 'en_attente' | 'gagne' | 'perdu' | 'annule';
  gainCalcule?: string;
  commissionOrganisateur?: string;
  commentaire?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PariBoxeStats {
  totalParis: number;
  montantTotal: number;
  totalCommissions: number;
  parCombatant: Array<{
    nom: string;
    nbParis: number;
    montantTotal: number;
  }>;
  parStatut: {
    en_attente: number;
    gagne: number;
    perdu: number;
    annule: number;
  };
}

export interface CreatePariBoxeRequest {
  groupeId?: number;
  nomGroupe?: string;
  montantMise: number;
  combatId: string;
  combatTitre: string;
  combatantParie: string;
  commentaire?: string;
}

export interface ResoudreCombatRequest {
  combatId: string;
  combatantGagnant: string;
}

export interface CombatBoxe {
  id: string;
  titre: string;
  nbParis?: number;
  createdAt: string;
}

export interface CreateCombatRequest {
  nom: string;
}

@Injectable({
  providedIn: 'root'
})
export class PariBoxeService {
  private apiUrl = '/api/pari-boxe';

  constructor(private http: HttpClient) {}

  getParis(combatId?: string, statut?: string): Observable<PariBoxe[]> {
    let url = this.apiUrl;
    const params: string[] = [];
    if (combatId) params.push(`combatId=${combatId}`);
    if (statut) params.push(`statut=${statut}`);
    if (params.length > 0) url += '?' + params.join('&');
    return this.http.get<PariBoxe[]>(url);
  }

  getStats(combatId: string): Observable<PariBoxeStats> {
    return this.http.get<PariBoxeStats>(`${this.apiUrl}/stats/${combatId}`);
  }

  createPari(pari: CreatePariBoxeRequest): Observable<PariBoxe> {
    return this.http.post<PariBoxe>(this.apiUrl, pari);
  }

  deletePari(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  resoudreCombat(request: ResoudreCombatRequest): Observable<{ message: string; stats: any }> {
    return this.http.post<{ message: string; stats: any }>(`${this.apiUrl}/resoudre`, request);
  }

  deleteCombat(combatId: string): Observable<{ message: string; combatId: string; nbParisSupprimes: number }> {
    return this.http.delete<{ message: string; combatId: string; nbParisSupprimes: number }>(`${this.apiUrl}/combat/${combatId}`);
  }

  getCombats(): Observable<CombatBoxe[]> {
    return this.http.get<CombatBoxe[]>(`${this.apiUrl}/combats`);
  }

  createCombat(combat: CreateCombatRequest): Observable<CombatBoxe> {
    return this.http.post<CombatBoxe>(`${this.apiUrl}/combats`, combat);
  }
}

