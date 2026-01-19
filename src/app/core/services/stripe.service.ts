import { Injectable } from '@angular/core';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private stripePromise: Promise<Stripe | null>;
  private elements: StripeElements | null = null;
  private cardElement: StripeCardElement | null = null;

  constructor() {
    // Clé publique Stripe (à configurer dans environment)
    const stripeKey = environment.stripePublicKey || 'pk_test_YOUR_KEY_HERE';
    this.stripePromise = loadStripe(stripeKey);
  }

  async initializeElements(): Promise<void> {
    const stripe = await this.stripePromise;
    if (!stripe) {
      throw new Error('Stripe failed to load');
    }

    this.elements = stripe.elements();
    this.cardElement = this.elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#1f2937',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          '::placeholder': {
            color: '#9ca3af',
          },
        },
        invalid: {
          color: '#ef4444',
          iconColor: '#ef4444',
        },
      },
    });
  }

  getCardElement(): StripeCardElement | null {
    return this.cardElement;
  }

  async createPaymentMethod(billingDetails: any): Promise<{ paymentMethodId: string } | { error: string }> {
    const stripe = await this.stripePromise;
    if (!stripe || !this.cardElement) {
      return { error: 'Stripe not initialized' };
    }

    const { paymentMethod, error } = await stripe.createPaymentMethod({
      type: 'card',
      card: this.cardElement,
      billing_details: billingDetails,
    });

    if (error) {
      return { error: error.message || 'Payment method creation failed' };
    }

    return { paymentMethodId: paymentMethod!.id };
  }

  async confirmPayment(clientSecret: string): Promise<{ success: boolean; error?: string }> {
    const stripe = await this.stripePromise;
    if (!stripe || !this.cardElement) {
      return { success: false, error: 'Stripe not initialized' };
    }

    const { error } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: this.cardElement,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  destroy(): void {
    if (this.cardElement) {
      this.cardElement.destroy();
      this.cardElement = null;
    }
    this.elements = null;
  }
}
