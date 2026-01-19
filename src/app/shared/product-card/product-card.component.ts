import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../core/models/product.model';
import { FavoriteService } from '../../core/services/favorite.service';
import { AuthService } from '../../core/services/auth.service';
import { ImageFallbackDirective } from '../directives/image-fallback.directive';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink, ImageFallbackDirective],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Input() price?: number;
  
  favoriteService = inject(FavoriteService);
  authService = inject(AuthService);

  isFavorite = false;

  ngOnInit(): void {
    this.checkFavorite();
  }

  checkFavorite(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.favoriteService.isFavorite(this.product.id, userId).subscribe(
        result => this.isFavorite = result
      );
    }
  }

  toggleFavorite(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    const userId = this.authService.getUserId();
    if (!userId) {
      return;
    }

    if (this.isFavorite) {
      this.favoriteService.removeFavorite(this.product.id, userId).subscribe(
        () => this.isFavorite = false
      );
    } else {
      this.favoriteService.addFavorite(this.product.id, userId).subscribe(
        () => this.isFavorite = true
      );
    }
  }

  getProductImage(): string {
    // Récupérer l'image depuis la base de données (Cloudinary)
    if (this.product.images && this.product.images.length > 0) {
      return this.product.images[0];
    }
    // Fallback si aucune image : Unsplash placeholder
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop';
  }

  getConditionBadgeClass(): string {
    switch (this.product.condition?.toLowerCase()) {
      case 'new':
      case 'neuf':
        return 'badge-success';
      case 'like new':
      case 'comme neuf':
        return 'badge-primary';
      case 'refurbished':
      case 'reconditionné':
        return 'badge-warning';
      default:
        return 'badge-gray';
    }
  }
}
