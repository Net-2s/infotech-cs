import { Component, OnInit, OnDestroy, signal, computed, inject, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { EmailService } from '../../core/services/email.service';
import { AddressService, Address, CreateAddressRequest } from '../../core/services/address.service';
import { StripeService } from '../../core/services/stripe.service';
import { NotificationService } from '../../core/services/notification.service';
import { HeaderComponent } from '../../shared/header/header.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { CreateOrderRequest } from '../../core/models/order.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, HeaderComponent, FooterComponent],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('stripeCard') stripeCard!: ElementRef;

  private fb = inject(FormBuilder);
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private emailService = inject(EmailService);
  private addressService = inject(AddressService);
  private stripeService = inject(StripeService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  currentStep = signal<1 | 2 | 3>(1); // 1: Livraison, 2: Paiement, 3: Confirmation
  isProcessing = signal(false);
  orderCompleted = signal(false);
  orderNumber = signal<string>('');
  
  // Adresses
  savedAddresses = signal<Address[]>([]);
  selectedAddressId = signal<number | null>(null);
  showNewAddressForm = signal(false);
  
  // Modes de paiement
  paymentMethod = signal<'card' | 'paypal' | 'bank-transfer'>('card');
  stripeReady = signal(false);

  currentUser = computed(() => this.authService.currentUser());
  cartSummary = computed(() => this.cartService.cartSummary());
  
  selectedAddress = computed(() => {
    const id = this.selectedAddressId();
    return this.savedAddresses().find(addr => addr.id === id) || null;
  });

  shippingForm: FormGroup;
  newAddressForm: FormGroup;
  paymentForm: FormGroup;

  constructor() {
    this.shippingForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      postalCode: ['', Validators.required],
      country: ['France', Validators.required]
    });

    this.newAddressForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phone: ['', Validators.required],
      street: ['', Validators.required],
      city: ['', Validators.required],
      postalCode: ['', Validators.required],
      country: ['France', Validators.required],
      isDefault: [false]
    });

    this.paymentForm = this.fb.group({
      cardholderName: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const user = this.currentUser();
    if (!user) {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }

    // Pré-remplir avec les données utilisateur si disponibles
    if (user.email) {
      this.shippingForm.patchValue({
        email: user.email,
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ')[1] || ''
      });
    }

    // Charger les adresses sauvegardées
    this.loadSavedAddresses();

    // Charger le panier
    this.cartService.loadCart().subscribe();

    // Vérifier que le panier n'est pas vide
    if (this.cartSummary().itemCount === 0) {
      this.router.navigate(['/cart']);
    }
  }

  ngAfterViewInit() {
    // Stripe sera initialisé quand on arrive à l'étape 2
  }

  ngOnDestroy() {
    this.stripeService.destroy();
  }

  async loadSavedAddresses() {
    const user = this.currentUser();
    if (!user?.id) return;

    this.addressService.getUserAddresses(user.id).subscribe({
      next: (addresses) => {
        this.savedAddresses.set(addresses);
        
        // Sélectionner l'adresse par défaut
        const defaultAddr = addresses.find(addr => addr.isDefault);
        if (defaultAddr) {
          this.selectedAddressId.set(defaultAddr.id);
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des adresses:', err);
      }
    });
  }

  selectAddress(addressId: number) {
    this.selectedAddressId.set(addressId);
    this.showNewAddressForm.set(false);
  }

  toggleNewAddressForm() {
    this.showNewAddressForm.update(show => !show);
    if (this.showNewAddressForm()) {
      this.selectedAddressId.set(null);
    }
  }

  async saveNewAddress() {
    if (this.newAddressForm.invalid) {
      this.newAddressForm.markAllAsTouched();
      return;
    }

    const user = this.currentUser();
    if (!user?.id) return;

    const addressData: CreateAddressRequest = {
      userId: user.id,
      ...this.newAddressForm.value
    };

    this.addressService.createAddress(addressData).subscribe({
      next: (newAddress) => {
        this.savedAddresses.update(addrs => [...addrs, newAddress]);
        this.selectedAddressId.set(newAddress.id);
        this.showNewAddressForm.set(false);
        this.newAddressForm.reset({ country: 'France', isDefault: false });
        this.notificationService.success('Adresse ajoutée avec succès');
      },
      error: (err) => {
        this.notificationService.error('Erreur lors de l\'ajout de l\'adresse');
        console.error(err);
      }
    });
  }

  selectPaymentMethod(method: 'card' | 'paypal' | 'bank-transfer') {
    this.paymentMethod.set(method);
  }

  async initializeStripe() {
    try {
      await this.stripeService.initializeElements();
      const cardElement = this.stripeService.getCardElement();
      
      if (cardElement && this.stripeCard?.nativeElement) {
        cardElement.mount(this.stripeCard.nativeElement);
        this.stripeReady.set(true);
      }
    } catch (error) {
      console.error('Erreur Stripe:', error);
      this.notificationService.error('Erreur lors de l\'initialisation du paiement');
    }
  }

  goToStep(step: 1 | 2 | 3): void {
    // Validation avant de passer à l'étape paiement
    if (step === 2) {
      if (!this.selectedAddressId() && !this.showNewAddressForm()) {
        this.notificationService.error('Veuillez sélectionner une adresse de livraison');
        return;
      }
      
      if (this.showNewAddressForm() && !this.newAddressForm.valid) {
        this.newAddressForm.markAllAsTouched();
        this.notificationService.error('Veuillez remplir tous les champs de l\'adresse');
        return;
      }
    }
    
    this.currentStep.set(step);

    // Initialiser Stripe quand on arrive sur l'étape paiement
    if (step === 2 && !this.stripeReady()) {
      setTimeout(() => this.initializeStripe(), 100);
    }
  }

  async submitOrder(): Promise<void> {
    if (this.paymentMethod() === 'card' && !this.paymentForm.valid) {
      this.paymentForm.markAllAsTouched();
      this.notificationService.error('Veuillez renseigner le nom du titulaire de la carte');
      return;
    }

    const user = this.currentUser();
    if (!user) return;

    this.isProcessing.set(true);

    try {
      // 1. Créer le PaymentIntent côté backend
      const amount = this.cartSummary().total * 100; // Convertir en centimes
      const token = this.authService.getToken();
      
      if (!token) {
        throw new Error('Vous devez être connecté pour effectuer un paiement');
      }

      const paymentIntentResponse = await fetch(`${environment.apiUrl}/orders/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount })
      }).then(res => res.json());

      if (!paymentIntentResponse.clientSecret) {
        throw new Error('Erreur lors de la création du paiement');
      }

      let paymentIntentId = paymentIntentResponse.paymentIntentId;

      // 2. Confirmer le paiement avec Stripe (si mode carte)
      if (this.paymentMethod() === 'card') {
        const paymentResult = await this.stripeService.confirmPayment(
          paymentIntentResponse.clientSecret
        );

        if (paymentResult.error) {
          throw new Error(paymentResult.error || 'Erreur de paiement');
        }
      }

      // 3. Créer la commande avec le paymentIntentId
      const cartItems = this.cartSummary().items;
      const selectedAddr = this.selectedAddress();

      const orderRequest: CreateOrderRequest = {
        buyerId: user.id,
        items: cartItems.map(item => ({
          listingId: item.listingId,
          quantity: item.quantity
        })),
        paymentIntentId: paymentIntentId,
        shippingAddress: selectedAddr ? {
          street: selectedAddr.street,
          city: selectedAddr.city,
          postalCode: selectedAddr.postalCode,
          country: selectedAddr.country,
          phone: selectedAddr.phone
        } : undefined
      };

      this.orderService.createOrder(orderRequest).subscribe({
        next: (order) => {
          this.isProcessing.set(false);
          this.orderCompleted.set(true);
          
          // Générer le numéro de commande
          const timestamp = new Date().getTime();
          const formattedOrderNumber = `INF-${timestamp.toString().slice(-6)}-${order.id.toString().padStart(4, '0')}`;
          this.orderNumber.set(formattedOrderNumber);
          
          // Envoyer l'email de confirmation
          const userEmail = user.email;
          if (userEmail) {
            this.emailService.sendOrderConfirmation(order, userEmail, formattedOrderNumber).subscribe({
              next: () => console.log('Email de confirmation envoyé'),
              error: (err) => console.error('Erreur lors de l\'envoi de l\'email:', err)
            });
          }

          // Vider le panier
          this.cartService.clearCart().subscribe();

          // Aller à l'étape de confirmation
          this.currentStep.set(3);
        },
        error: (error) => {
          this.isProcessing.set(false);
          console.error('Erreur lors de la création de la commande:', error);
          this.notificationService.error('Une erreur est survenue lors de la création de la commande');
        }
      });

    } catch (error: any) {
      this.isProcessing.set(false);
      console.error('Erreur lors du paiement:', error);
      this.notificationService.error(error.message || 'Erreur lors du traitement du paiement');
    }
  }

  continueShopping(): void {
    this.router.navigate(['/products']);
  }

  viewOrders(): void {
    this.router.navigate(['/orders']);
  }
}
