import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { FavoriteService } from '../../../core/services/favorite.service';
import { ReviewService } from '../../../core/services/review.service';
import { ListingService } from '../../../core/services/listing.service';
import { ListingRecommendationService, ListingScore } from '../../../core/services/listing-recommendation.service';
import { AuthService } from '../../../core/services/auth.service';
import { DigitalPassportService } from '../../../core/services/digital-passport.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Product } from '../../../core/models/product.model';
import { Review } from '../../../core/models/review.model';
import { Listing } from '../../../core/models/listing.model';
import { DigitalPassport } from '../../../core/models/digital-passport-backend.model';
import { HeaderComponent } from '../../../shared/header/header.component';
import { FooterComponent } from '../../../shared/footer/footer.component';
import { ImageFallbackDirective } from '../../../shared/directives/image-fallback.directive';
import { StarRatingComponent } from '../../../shared/star-rating/star-rating.component';
import { AddReviewModalComponent } from '../../../shared/add-review-modal/add-review-modal.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent, FooterComponent, ImageFallbackDirective, StarRatingComponent, AddReviewModalComponent],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private favoriteService = inject(FavoriteService);
  private reviewService = inject(ReviewService);
  private listingService = inject(ListingService);
  private recommendationService = inject(ListingRecommendationService);
  private authService = inject(AuthService);
  private passportService = inject(DigitalPassportService);
  private notificationService = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  product = signal<Product | null>(null);
  listings = signal<Listing[]>([]);
  recommendedListing = signal<Listing | null>(null);
  selectedListing = signal<Listing | null>(null);
  sortedListings = signal<ListingScore[]>([]);
  showAllOffersModal = signal<boolean>(false);
  reviews = signal<Review[]>([]);
  reviewStats = signal<any>(null);
  selectedImage = signal<number>(0);
  quantity = signal<number>(1);
  isLoading = signal<boolean>(true);
  isFavorite = signal<boolean>(false);
  addingToCart = signal<boolean>(false);

  // Digital Passport
  showPassport = signal<boolean>(false);
  digitalPassport = signal<DigitalPassport | null>(null);
  loadingPassport = signal<boolean>(false);
  passportError = signal<string | null>(null);
  activePassportTab = signal<'carbon' | 'materials' | 'durability' | 'certifications' | 'recycling'>('carbon');

  // Feature Sidenav
  showFeatureSidenav = signal<boolean>(false);
  currentFeature = signal<'certified' | 'warranty' | 'return' | 'delivery' | null>(null);

  // Reviews
  showAddReviewModal = signal<boolean>(false);
  reviewsPage = signal<number>(0);
  reviewsSize = signal<number>(5);

  // Variant Selection
  selectedVariants = signal<Record<string, string>>({});

  currentUser = computed(() => this.authService.currentUser());
  
  // Vérifie si l'utilisateur connecté a déjà laissé un avis
  userHasReviewed = computed(() => {
    const user = this.currentUser();
    const reviewsList = this.reviews();
    if (!user || reviewsList.length === 0) return false;
    return reviewsList.some(review => review.userId === user.id);
  });

  // Detect variants from listings
  detectedVariants = computed(() => {
    const listingsData = this.listings();
    if (!listingsData || listingsData.length === 0) {
      return [];
    }

    // Extract variants from condition notes
    const variantMap = new Map<string, Set<string>>();
    
    listingsData.forEach(listing => {
      const condition = listing.conditionNote || '';
      
      // Detect color variants (case insensitive)
      const colorMatch = condition.match(/couleur[:\s]+([\w\s-]+)/i) || 
                        condition.match(/color[:\s]+([\w\s-]+)/i);
      if (colorMatch) {
        if (!variantMap.has('color')) {
          variantMap.set('color', new Set());
        }
        variantMap.get('color')!.add(colorMatch[1].trim());
      }

      // Detect storage variants
      const storageMatch = condition.match(/(\d+\s*(?:GB|TB|Go|To))/i);
      if (storageMatch) {
        if (!variantMap.has('storage')) {
          variantMap.set('storage', new Set());
        }
        variantMap.get('storage')!.add(storageMatch[1].toUpperCase());
      }

      // Detect size variants
      const sizeMatch = condition.match(/taille[:\s]+([\w\s-]+)/i) ||
                       condition.match(/size[:\s]+([\w\s-]+)/i);
      if (sizeMatch) {
        if (!variantMap.has('size')) {
          variantMap.set('size', new Set());
        }
        variantMap.get('size')!.add(sizeMatch[1].trim());
      }
    });

    // Convert to array format
    const variants: Array<{ type: string; label: string; values: string[] }> = [];
    
    if (variantMap.has('color') && variantMap.get('color')!.size > 1) {
      variants.push({
        type: 'color',
        label: 'Couleur',
        values: Array.from(variantMap.get('color')!)
      });
    }
    
    if (variantMap.has('storage') && variantMap.get('storage')!.size > 1) {
      variants.push({
        type: 'storage',
        label: 'Stockage',
        values: Array.from(variantMap.get('storage')!)
      });
    }
    
    if (variantMap.has('size') && variantMap.get('size')!.size > 1) {
      variants.push({
        type: 'size',
        label: 'Taille',
        values: Array.from(variantMap.get('size')!)
      });
    }

    return variants;
  });

  // Prix du listing sélectionné
  currentPrice = computed(() => {
    return this.selectedListing()?.price || 0;
  });

  // Stock disponible du listing sélectionné
  availableStock = computed(() => {
    return this.selectedListing()?.quantity || 0;
  });

  ngOnInit(): void {
    const productId = Number(this.route.snapshot.paramMap.get('id'));
    if (productId) {
      this.loadProduct(productId);
      this.loadListings(productId);
      this.loadReviews(productId);
      this.checkIfFavorite(productId);
    }
  }

  private loadProduct(id: number): void {
    this.productService.getProduct(id).subscribe({
      next: (product) => {
        this.product.set(product);
        this.selectedImage.set(0);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.router.navigate(['/products']);
      }
    });
  }

  private loadListings(productId: number): void {
    console.log('🔍 Chargement des listings pour le produit ID:', productId);
    this.listingService.getListingsByProduct(productId).subscribe({
      next: (listings) => {
        console.log('✅ Listings reçus:', listings);
        console.log('📊 Nombre de listings:', listings.length);
        this.listings.set(listings);
        
        // Obtenir le listing recommandé et la liste triée
        if (listings.length > 0) {
          const recommended = this.recommendationService.getRecommendedListing(listings);
          const sorted = this.recommendationService.getSortedListings(listings);
          
          this.recommendedListing.set(recommended);
          this.sortedListings.set(sorted);
          this.selectedListing.set(recommended);
          
          console.log('⭐ Listing recommandé:', recommended);
          console.log('📊 Listings triés par score:', sorted);
        } else {
          console.warn('⚠️ Aucun listing trouvé pour ce produit');
        }
      },
      error: (err) => {
        console.error('❌ Erreur lors du chargement des listings:', err);
        console.error('📍 URL appelée:', `/api/listings/product/${productId}`);
        console.error('📋 Détails de l\'erreur:', err.error);
      }
    });
  }

  private loadReviews(productId: number): void {
    this.reviewService.getProductReviews(productId, 0, 5).subscribe({
      next: (page) => this.reviews.set(page.content)
    });

    this.reviewService.getProductReviewStats(productId).subscribe({
      next: (stats) => this.reviewStats.set(stats)
    });
  }

  private checkIfFavorite(productId: number): void {
    const user = this.currentUser();
    if (user) {
      this.favoriteService.isFavorite(productId, user.id).subscribe({
        next: (isFav) => this.isFavorite.set(isFav)
      });
    }
  }

  getMainImage(): string {
    const prod = this.product();
    if (!prod || !prod.images || prod.images.length === 0) {
      return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop';
    }
    return prod.images[this.selectedImage()] || prod.images[0];
  }

  getThumbnailImage(index: number): string {
    const prod = this.product();
    if (!prod || !prod.images || !prod.images[index]) {
      return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop';
    }
    return prod.images[index];
  }

  selectImage(index: number): void {
    this.selectedImage.set(index);
  }

  selectListing(listing: Listing): void {
    this.selectedListing.set(listing);
    // Réinitialiser la quantité si elle dépasse le stock du nouveau listing
    if (this.quantity() > listing.quantity) {
      this.quantity.set(Math.min(1, listing.quantity));
    }
  }

  selectVariant(type: string, value: string): void {
    // Update selected variants
    const current = { ...this.selectedVariants() };
    current[type] = value;
    this.selectedVariants.set(current);

    // Find best matching listing based on selected variants
    const listingsData = this.listings();
    const matchingListing = listingsData.find(listing => {
      const condition = listing.conditionNote || '';
      let matches = true;

      // Check each selected variant
      Object.entries(current).forEach(([variantType, variantValue]) => {
        const lowerCondition = condition.toLowerCase();
        const lowerValue = variantValue.toLowerCase();

        if (variantType === 'color') {
          if (!lowerCondition.includes(lowerValue)) {
            matches = false;
          }
        } else if (variantType === 'storage') {
          if (!condition.toUpperCase().includes(variantValue.toUpperCase())) {
            matches = false;
          }
        } else if (variantType === 'size') {
          if (!lowerCondition.includes(lowerValue)) {
            matches = false;
          }
        }
      });

      return matches;
    });

    // Update selected listing if match found
    if (matchingListing) {
      this.selectListing(matchingListing);
    }
  }

  incrementQuantity(): void {
    if (this.quantity() < this.availableStock()) {
      this.quantity.update(q => q + 1);
    }
  }

  decrementQuantity(): void {
    if (this.quantity() > 1) {
      this.quantity.update(q => q - 1);
    }
  }

  addToCart(): void {
    const user = this.currentUser();
    const listing = this.selectedListing();
    
    if (!user) {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    if (!listing) {
      this.notificationService.warning('Veuillez sélectionner une offre');
      return;
    }

    if (this.quantity() > listing.quantity) {
      this.notificationService.error(`Stock insuffisant. Seulement ${listing.quantity} disponible(s)`);
      return;
    }

    this.addingToCart.set(true);

    const cartItem = {
      listingId: listing.id,
      quantity: this.quantity(),
      price: listing.price
    };

    this.cartService.addToCart(user.id, cartItem).subscribe({
      next: () => {
        this.addingToCart.set(false);
        this.notificationService.success('Produit ajouté au panier ! 🛒');
      },
      error: (err) => {
        this.addingToCart.set(false);
        console.error('Erreur:', err);
        this.notificationService.error('Erreur lors de l\'ajout au panier');
      }
    });
  }

  toggleFavorite(): void {
    const user = this.currentUser();
    const prod = this.product();
    
    if (!user) {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    if (!prod) return;

    if (this.isFavorite()) {
      this.favoriteService.removeFavorite(prod.id, user.id).subscribe({
        next: () => this.isFavorite.set(false)
      });
    } else {
      this.favoriteService.addFavorite(prod.id, user.id).subscribe({
        next: () => this.isFavorite.set(true)
      });
    }
  }

  openAllOffersModal(): void {
    this.showAllOffersModal.set(true);
  }

  closeAllOffersModal(): void {
    this.showAllOffersModal.set(false);
  }

  selectListingFromModal(listing: Listing): void {
    this.selectedListing.set(listing);
    this.closeAllOffersModal();
  }

  getConditionLabel(conditionNote: string): string {
    const level = this.recommendationService.getConditionLevel(conditionNote);
    return this.recommendationService.getConditionLabel(level);
  }

  getConditionColor(conditionNote: string): string {
    const level = this.recommendationService.getConditionLevel(conditionNote);
    return this.recommendationService.getConditionColor(level);
  }

  // Digital Passport Methods
  togglePassport(): void {
    this.showPassport.set(!this.showPassport());
    
    // Charger le passeport si pas encore chargé
    if (this.showPassport() && !this.digitalPassport() && !this.loadingPassport()) {
      this.loadPassport();
    }
  }

  loadPassport(): void {
    const productId = this.product()?.id;
    if (!productId) return;

    this.loadingPassport.set(true);
    this.passportError.set(null);

    this.passportService.getByProductId(productId).subscribe({
      next: (passport) => {
        this.digitalPassport.set(passport);
        this.loadingPassport.set(false);
      },
      error: (err) => {
        this.passportError.set('Passeport numérique non disponible pour ce produit');
        this.loadingPassport.set(false);
      }
    });
  }

  setPassportTab(tab: 'carbon' | 'materials' | 'durability' | 'certifications' | 'recycling'): void {
    this.activePassportTab.set(tab);
  }

  getScoreColor(score: string): string {
    const colors: Record<string, string> = {
      'A': '#00a550',
      'B': '#50b848',
      'C': '#ffc107',
      'D': '#ff9800',
      'E': '#f44336'
    };
    return colors[score] || '#666';
  }

  // Feature Sidenav Methods
  openFeatureSidenav(feature: 'certified' | 'warranty' | 'return' | 'delivery'): void {
    this.currentFeature.set(feature);
    this.showFeatureSidenav.set(true);
    // Prevent body scroll when sidenav is open
    document.body.style.overflow = 'hidden';
  }

  closeFeatureSidenav(): void {
    this.showFeatureSidenav.set(false);
    this.currentFeature.set(null);
    // Restore body scroll
    document.body.style.overflow = '';
  }

  getFeatureTitle(): string {
    const titles: Record<string, string> = {
      'certified': 'Produit Certifié et Testé',
      'warranty': 'Garantie 12 Mois',
      'return': 'Retour Gratuit sous 30 Jours',
      'delivery': 'Livraison 24h Offerte'
    };
    return titles[this.currentFeature() || ''] || '';
  }

  // Reviews Methods
  openAddReviewModal(): void {
    const user = this.currentUser();
    if (!user) {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    this.showAddReviewModal.set(true);
  }

  closeAddReviewModal(): void {
    this.showAddReviewModal.set(false);
  }

  onReviewAdded(): void {
    const productId = this.product()?.id;
    if (productId) {
      this.loadReviews(productId);
    }
  }

  loadMoreReviews(): void {
    const currentPage = this.reviewsPage();
    this.reviewsPage.set(currentPage + 1);
    const productId = this.product()?.id;
    if (productId) {
      this.reviewService.getProductReviews(productId, this.reviewsPage(), this.reviewsSize()).subscribe({
        next: (page) => {
          this.reviews.update(current => [...current, ...page.content]);
        }
      });
    }
  }

  // Helper pour récupérer le nombre d'avis par note (gère les clés string du backend)
  getRatingCount(level: number): number {
    const stats = this.reviewStats();
    if (!stats) return 0;
    return stats.ratingCounts[level.toString()] || 0;
  }

  // Helper pour calculer le pourcentage de chaque note
  getRatingPercentage(level: number): number {
    const stats = this.reviewStats();
    if (!stats || stats.totalReviews === 0) return 0;
    const count = this.getRatingCount(level);
    return (count / stats.totalReviews) * 100;
  }
}

