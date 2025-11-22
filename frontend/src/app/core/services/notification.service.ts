import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface StockAlerte {
  id: number;
  article: string;
  quantite: number;
  unite: string;
  isNew?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private alertesSubject = new BehaviorSubject<StockAlerte[]>([]);
  public alertes$ = this.alertesSubject.asObservable();
  private previousAlertesIds: Set<number> = new Set();

  constructor() {
    // Charger les alertes précédentes depuis le localStorage
    const storedAlertes = localStorage.getItem('dismissedAlertes');
    if (storedAlertes) {
      try {
        const dismissedIds = JSON.parse(storedAlertes);
        this.previousAlertesIds = new Set(dismissedIds);
      } catch (e) {
        // Ignorer les erreurs de parsing
      }
    }
  }

  setAlertes(alertes: StockAlerte[]): void {
    const currentAlertes = this.alertesSubject.value;
    const currentIds = new Set(currentAlertes.map(a => a.id));
    
    // Marquer les nouvelles alertes
    const alertesWithNew = alertes
      .filter(alerte => !this.previousAlertesIds.has(alerte.id)) // Exclure celles déjà fermées
      .map(alerte => ({
        ...alerte,
        isNew: !currentIds.has(alerte.id) // Nouvelle si elle n'était pas dans la liste précédente
      }));
    
    this.alertesSubject.next(alertesWithNew);
  }

  getAlertes(): StockAlerte[] {
    return this.alertesSubject.value;
  }

  getAlertesCount(): number {
    return this.alertesSubject.value.length;
  }

  dismissAlerte(id: number): void {
    const currentAlertes = this.alertesSubject.value.filter(a => a.id !== id);
    this.alertesSubject.next(currentAlertes);
    
    // Sauvegarder l'ID de l'alerte fermée
    this.previousAlertesIds.add(id);
    localStorage.setItem('dismissedAlertes', JSON.stringify(Array.from(this.previousAlertesIds)));
  }

  dismissAllAlertes(): void {
    const currentIds = this.alertesSubject.value.map(a => a.id);
    currentIds.forEach(id => this.previousAlertesIds.add(id));
    localStorage.setItem('dismissedAlertes', JSON.stringify(Array.from(this.previousAlertesIds)));
    this.alertesSubject.next([]);
  }

  markAsRead(id: number): void {
    const currentAlertes = this.alertesSubject.value.map(alerte => 
      alerte.id === id ? { ...alerte, isNew: false } : alerte
    );
    this.alertesSubject.next(currentAlertes);
  }
}

