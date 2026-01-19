import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { CartItem, CartSummary, SelectedInsurance, DEFAULT_INSURANCE_OPTIONS } from '../models/cart.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly API_URL = `${environment.apiUrl}/user/cart`;

  private cartItems = signal<CartItem[]>([]);
  
  // Options d'assurance disponibles
  readonly insuranceOptions = DEFAULT_INSURANCE_OPTIONS;
  
  cartSummary = computed<CartSummary>(() => {
    const items = this.cartItems();
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const insuranceTotal = items.reduce((sum, item) => {
      if (item.insurance) {
        return sum + item.insurance.price;
      }
      return sum;
    }, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    
    return {
      items,
      subtotal,
      insuranceTotal,
      shippingTotal: 0, // Livraison gratuite pour l'instant
      total: subtotal + insuranceTotal,
      itemCount
    };
  });

  constructor(private http: HttpClient) {
    // Écouter l'événement de déconnexion pour vider le panier
    window.addEventListener('user-logout', () => {
      this.cartItems.set([]);
    });
  }

  loadCart(): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(this.API_URL)
      .pipe(tap(items => this.cartItems.set(items)));
  }

  addToCart(userId: number, item: Partial<CartItem>): Observable<CartItem> {
    return this.http.post<CartItem>(this.API_URL, item)
      .pipe(tap(() => this.loadCart().subscribe()));
  }

  updateQuantity(cartItemId: number, quantity: number): Observable<CartItem> {
    const params = new HttpParams().set('quantity', quantity.toString());
    return this.http.put<CartItem>(`${this.API_URL}/${cartItemId}/quantity`, null, { params })
      .pipe(tap(() => this.loadCart().subscribe()));
  }

  removeFromCart(cartItemId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${cartItemId}`)
      .pipe(tap(() => this.loadCart().subscribe()));
  }

  clearCart(): Observable<void> {
    return this.http.delete<void>(this.API_URL)
      .pipe(tap(() => this.cartItems.set([])));
  }

  /**
   * Ajoute ou met à jour l'assurance pour un article du panier
   */
  setItemInsurance(cartItemId: number, insurance: SelectedInsurance | null): void {
    const items = this.cartItems();
    const updatedItems = items.map(item => {
      if (item.id === cartItemId) {
        return {
          ...item,
          insurance: insurance ?? undefined
        };
      }
      return item;
    });
    this.cartItems.set(updatedItems);
    
    // Optionnel: Persister côté serveur
    // this.http.put(`${this.API_URL}/${cartItemId}/insurance`, { insurance }).subscribe();
  }

  /**
   * Supprime l'assurance d'un article du panier
   */
  removeItemInsurance(cartItemId: number): void {
    this.setItemInsurance(cartItemId, null);
  }

  getCartItems() {
    return this.cartItems();
  }
}
