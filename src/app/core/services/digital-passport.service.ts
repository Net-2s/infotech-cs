import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DigitalPassport, CreateDigitalPassportRequest } from '../models/digital-passport-backend.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DigitalPassportService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/digital-passports`;

  /**
   * Récupère le passeport numérique d'un produit
   */
  getByProductId(productId: number): Observable<DigitalPassport> {
    return this.http.get<DigitalPassport>(`${this.apiUrl}/product/${productId}`);
  }

  /**
   * Récupère un passeport par son ID
   */
  getById(id: number): Observable<DigitalPassport> {
    return this.http.get<DigitalPassport>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crée un nouveau passeport numérique
   */
  create(request: CreateDigitalPassportRequest): Observable<DigitalPassport> {
    return this.http.post<DigitalPassport>(this.apiUrl, request);
  }

  /**
   * Met à jour un passeport numérique
   */
  update(id: number, request: CreateDigitalPassportRequest): Observable<DigitalPassport> {
    return this.http.put<DigitalPassport>(`${this.apiUrl}/${id}`, request);
  }

  /**
   * Supprime un passeport numérique
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Calcule le score carbone basé sur le total CO2
   */
  calculateCarbonScore(totalCO2: number): 'A' | 'B' | 'C' | 'D' | 'E' {
    if (totalCO2 < 10) return 'A';
    if (totalCO2 < 25) return 'B';
    if (totalCO2 < 50) return 'C';
    if (totalCO2 < 100) return 'D';
    return 'E';
  }

  /**
   * Calcule l'indice de réparabilité
   */
  calculateRepairabilityIndex(score: number): 'A' | 'B' | 'C' | 'D' | 'E' {
    if (score >= 8) return 'A';
    if (score >= 6) return 'B';
    if (score >= 4) return 'C';
    if (score >= 2) return 'D';
    return 'E';
  }

  /**
   * Calcule l'équivalent en km de voiture
   */
  calculateCarKmEquivalent(co2Kg: number): number {
    // Moyenne: 120g CO2/km pour une voiture essence
    return Math.round((co2Kg * 1000) / 120);
  }

  /**
   * Calcule le nombre d'arbres nécessaires pour compenser
   */
  calculateTreesEquivalent(co2Kg: number): number {
    // Un arbre absorbe environ 25kg de CO2 par an
    return Math.ceil(co2Kg / 25);
  }
}
