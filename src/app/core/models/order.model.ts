import { SelectedInsurance } from './cart.model';

export interface Order {
  id: number;
  buyerId: number;
  createdAt: string;
  subtotal: number;
  insuranceTotal: number;
  shippingTotal: number;
  total: number;
  status: OrderStatus;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  listingId: number;
  productTitle: string;
  productBrand?: string;
  productImage?: string;
  quantity: number;
  price: number;
  conditionNote?: string;
  sellerShopName?: string;
  insurance?: SelectedInsurance;
  estimatedDeliveryMin?: string;
  estimatedDeliveryMax?: string;
}

export interface CreateOrderRequest {
  buyerId: number;
  items: OrderItemRequest[];
  paymentIntentId?: string;
  shippingAddress?: ShippingAddress;
}

export interface ShippingAddress {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface OrderItemRequest {
  listingId: number;
  quantity: number;
  insurance?: SelectedInsurance;
}

export type OrderStatus = 'CREATED' | 'PAID' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';
