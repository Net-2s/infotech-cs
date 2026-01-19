import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Listing, CreateListingRequest } from '../models/listing.model';
import { Page } from '../models/page.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ListingService {
  private readonly API_URL = `${environment.apiUrl}/listings`;
  private readonly ADMIN_API_URL = `${environment.apiUrl}/admin/listings`;
  private readonly SELLER_API_URL = `${environment.apiUrl}/seller/listings`;

  constructor(private http: HttpClient) {}

  /**
   * Récupérer les listings publics (avec pagination)
   */
  getListings(page: number = 0, size: number = 12, search?: string): Observable<Page<Listing>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<Page<Listing>>(this.API_URL, { params });
  }

  /**
   * Récupérer un listing par son ID
   */
  getListing(id: number): Observable<Listing> {
    return this.http.get<Listing>(`${this.API_URL}/${id}`);
  }

  /**
   * Récupérer tous les listings actifs d'un produit
   */
  getListingsByProduct(productId: number): Observable<Listing[]> {
    return this.http.get<Page<Listing> | Listing[]>(`${this.API_URL}/by-product/${productId}`).pipe(
      map(response => {
        // Si c'est un tableau direct, le retourner
        if (Array.isArray(response)) {
          return response;
        }
        // Si c'est une page, extraire content
        if (response && 'content' in response) {
          return response.content || [];
        }
        // Sinon retourner tableau vide
        return [];
      }),
      catchError(error => {
        console.error('Erreur getListingsByProduct:', error);
        return of([]);
      })
    );
  }

  /**
   * Récupérer mes listings (vendeur connecté)
   */
  getMyListings(): Observable<Listing[]> {
    return this.http.get<Page<Listing> | Listing[]>(this.SELLER_API_URL).pipe(
      map(response => {
        console.log('📦 Réponse getMyListings:', response);
        // Si c'est un tableau direct, le retourner
        if (Array.isArray(response)) {
          console.log('✅ Format tableau direct, longueur:', response.length);
          return response;
        }
        // Si c'est une page, extraire content
        if (response && 'content' in response) {
          console.log('✅ Format paginé, content longueur:', response.content?.length);
          return response.content || [];
        }
        // Sinon retourner tableau vide
        console.warn('⚠️ Format inconnu, retour tableau vide');
        return [];
      }),
      catchError(error => {
        console.error('❌ Erreur getMyListings:', error);
        return of([]);
      })
    );
  }

  /**
   * Créer un nouveau listing (vendeur)
   */
  createListing(request: CreateListingRequest): Observable<Listing> {
    return this.http.post<Listing>(this.SELLER_API_URL, request);
  }

  /**
   * Supprimer mon listing (vendeur)
   */
  deleteListing(id: number): Observable<void> {
    return this.http.delete<void>(`${this.SELLER_API_URL}/${id}`);
  }

  /**
   * [ADMIN ONLY] Récupérer tous les listings
   */
  getAllListingsAsAdmin(): Observable<Listing[]> {
    return this.http.get<Page<Listing> | Listing[]>(this.ADMIN_API_URL).pipe(
      map(response => {
        // Si c'est un tableau direct, le retourner
        if (Array.isArray(response)) {
          return response;
        }
        // Si c'est une page, extraire content
        if (response && 'content' in response) {
          return response.content || [];
        }
        // Sinon retourner tableau vide
        return [];
      }),
      catchError(error => {
        console.error('Erreur getAllListingsAsAdmin:', error);
        return of([]);
      })
    );
  }

  /**
   * [ADMIN ONLY] Créer un listing en tant qu'admin
   */
  createListingAsAdmin(request: CreateListingRequest): Observable<Listing> {
    return this.http.post<Listing>(this.ADMIN_API_URL, request);
  }

  /**
   * [ADMIN ONLY] Supprimer n'importe quel listing
   */
  deleteListingAsAdmin(id: number): Observable<void> {
    return this.http.delete<void>(`${this.ADMIN_API_URL}/${id}`);
  }
}
