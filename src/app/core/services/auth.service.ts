import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthRequest, AuthResponse, User } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'infotech_token';
  private readonly USER_KEY = 'infotech_user';

  currentUser = signal<User | null>(this.getUserFromStorage());
  isAuthenticated = signal<boolean>(!!this.getToken());

  constructor(private http: HttpClient) {}

  register(credentials: AuthRequest, isSeller: boolean = false): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register?seller=${isSeller}`, credentials)
      .pipe(tap(response => this.handleAuthSuccess(response)));
  }

  login(credentials: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials)
      .pipe(tap(response => this.handleAuthSuccess(response)));
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    
    // Vider le panier en mémoire (le backend gère son propre panier par utilisateur)
    // On émet un événement pour que le CartService puisse réagir
    window.dispatchEvent(new CustomEvent('user-logout'));
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUserId(): number | null {
    const user = this.currentUser();
    return user ? user.id : null;
  }

  private handleAuthSuccess(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    this.isAuthenticated.set(true);
    
    // Decode JWT to get user info (simple implementation)
    const payload = this.decodeToken(response.token);
    if (payload) {
      const user: User = {
        id: payload.userId,
        email: payload.sub,
        displayName: payload.sub.split('@')[0],
        roles: payload.roles || [],
        createdAt: new Date().toISOString()
      };
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      this.currentUser.set(user);
    }
  }

  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  }
}
