import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { HeaderComponent } from '../../shared/header/header.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { InsuranceOption, SelectedInsurance } from '../../core/models/cart.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent, FooterComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit {
  cartService = inject(CartService); // Public pour utilisation dans le template
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(true);
  cartSummary = computed(() => this.cartService.cartSummary());
  currentUser = computed(() => this.authService.currentUser());

  ngOnInit(): void {
    const user = this.currentUser();
    if (!user) {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/cart' } });
      return;
    }

    this.cartService.loadCart().subscribe({
      next: () => this.isLoading.set(false),
      error: () => this.isLoading.set(false)
    });
  }

  updateQuantity(itemId: number, quantity: number): void {
    if (quantity > 0) {
      this.cartService.updateQuantity(itemId, quantity).subscribe();
    }
  }

  onQuantityChange(itemId: number, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const quantity = parseInt(select.value, 10);
    if (quantity > 0) {
      this.cartService.updateQuantity(itemId, quantity).subscribe();
    }
  }

  removeItem(itemId: number): void {
    this.cartService.removeFromCart(itemId).subscribe();
  }

  clearCart(): void {
    if (confirm('Voulez-vous vraiment vider le panier ?')) {
      this.cartService.clearCart().subscribe();
    }
  }

  selectInsurance(cartItemId: number, option: InsuranceOption): void {
    const currentItem = this.cartSummary().items.find(item => item.id === cartItemId);
    
    // Si l'option est déjà sélectionnée, on la désélectionne
    if (currentItem?.insurance?.optionId === option.id) {
      this.cartService.removeItemInsurance(cartItemId);
      return;
    }

    const selectedInsurance: SelectedInsurance = {
      optionId: option.id,
      type: option.type,
      name: option.name,
      price: option.price
    };
    
    this.cartService.setItemInsurance(cartItemId, selectedInsurance);
  }

  removeInsurance(cartItemId: number, event: Event): void {
    event.stopPropagation();
    this.cartService.removeItemInsurance(cartItemId);
  }

  proceedToCheckout(): void {
    this.router.navigate(['/checkout']);
  }
}
