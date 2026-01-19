import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Address {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface CreateAddressRequest {
  userId: number;
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/addresses`;

  getUserAddresses(userId: number): Observable<Address[]> {
    return this.http.get<Address[]>(`${this.API_URL}/user/${userId}`);
  }

  createAddress(address: CreateAddressRequest): Observable<Address> {
    return this.http.post<Address>(this.API_URL, address);
  }

  updateAddress(id: number, address: Partial<Address>): Observable<Address> {
    return this.http.put<Address>(`${this.API_URL}/${id}`, address);
  }

  deleteAddress(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  setDefaultAddress(id: number, userId: number): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${id}/set-default`, { userId });
  }
}
