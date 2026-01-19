import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { Product } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';
import { HeaderComponent } from '../../shared/header/header.component';
import { FooterComponent } from '../../shared/footer/footer.component';

interface CarouselSlide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  badge?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ProductCardComponent, HeaderComponent, FooterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private router = inject(Router);

  featuredProducts: Product[] = [];
  filteredProducts: Product[] = [];
  categories: Category[] = [];
  isLoading = true;

  // Search
  searchQuery = '';
  showSuggestions = false;
  searchSuggestions: string[] = [];

  // Filter
  selectedCategoryId: number | null = null;

  // Carousel
  currentSlide = signal(0);
  private carouselInterval: ReturnType<typeof setInterval> | null = null;
  
  carouselSlides: CarouselSlide[] = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1200',
      title: 'iPhone 15 Pro',
      subtitle: 'Reconditionné Premium',
      description: 'Le dernier flagship Apple à prix réduit. Garanti 24 mois avec passeport numérique.',
      ctaText: 'Découvrir',
      ctaLink: '/products',
      badge: '-30%'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200',
      title: 'MacBook Pro M3',
      subtitle: 'Performance Pro',
      description: 'La puissance de la puce M3 dans un MacBook reconditionné certifié.',
      ctaText: 'Explorer',
      ctaLink: '/products',
      badge: 'Nouveau'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=1200',
      title: 'Galaxy Watch 6',
      subtitle: 'Connecté & Éco',
      description: 'La montre connectée Samsung reconditionnée avec garantie étendue.',
      ctaText: 'Voir les offres',
      ctaLink: '/products',
      badge: 'Populaire'
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1200',
      title: 'iPad Pro 2024',
      subtitle: 'Créativité Sans Limite',
      description: 'La tablette ultime pour les créatifs, reconditionnée avec soin.',
      ctaText: 'Commander',
      ctaLink: '/products',
      badge: '-25%'
    }
  ];

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.loadData();
    this.startCarousel();
  }

  ngOnDestroy(): void {
    this.stopCarousel();
  }

  // Carousel Methods
  startCarousel(): void {
    this.carouselInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  stopCarousel(): void {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
      this.carouselInterval = null;
    }
  }

  nextSlide(): void {
    this.currentSlide.update(current => 
      current >= this.carouselSlides.length - 1 ? 0 : current + 1
    );
  }

  prevSlide(): void {
    this.currentSlide.update(current => 
      current <= 0 ? this.carouselSlides.length - 1 : current - 1
    );
  }

  goToSlide(index: number): void {
    this.currentSlide.set(index);
    this.stopCarousel();
    this.startCarousel();
  }

  onCarouselKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') {
      this.prevSlide();
    } else if (event.key === 'ArrowRight') {
      this.nextSlide();
    }
  }

  loadData(): void {
    this.productService.getProducts({ page: 0, size: 20 }).subscribe({
      next: (data) => {
        this.featuredProducts = data.content;
        this.filteredProducts = data.content;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });

    this.categoryService.getCategories().subscribe({
      next: (data) => this.categories = data
    });
  }

  // Search Methods
  onSearchInput(): void {
    if (this.searchQuery.length >= 2) {
      this.showSuggestions = true;
      this.generateSuggestions();
    } else {
      this.showSuggestions = false;
    }
  }

  generateSuggestions(): void {
    // Générer des suggestions basées sur les produits
    const query = this.searchQuery.toLowerCase();
    const suggestions = new Set<string>();

    this.featuredProducts.forEach(product => {
      if (product.title.toLowerCase().includes(query)) {
        suggestions.add(product.title);
      }
      if (product.brand?.toLowerCase().includes(query)) {
        suggestions.add(product.brand);
      }
    });

    this.searchSuggestions = Array.from(suggestions).slice(0, 5);
  }

  selectSuggestion(suggestion: string): void {
    this.searchQuery = suggestion;
    this.showSuggestions = false;
    this.searchProducts();
  }

  searchProducts(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/products'], {
        queryParams: { search: this.searchQuery }
      });
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.showSuggestions = false;
    this.filteredProducts = this.featuredProducts;
  }

  // Category Filter
  filterByCategory(categoryId: number): void {
    this.selectedCategoryId = categoryId;
    this.router.navigate(['/products'], {
      queryParams: { categoryId: categoryId }
    });
  }

  resetCategory(): void {
    this.selectedCategoryId = null;
    this.filteredProducts = this.featuredProducts;
  }

  getSelectedCategoryName(): string {
    const category = this.categories.find(c => c.id === this.selectedCategoryId);
    return category?.name || '';
  }

  getCategoryEmoji(categoryName: string): string {
    const emojis: Record<string, string> = {
      'Smartphones': '📱',
      'Ordinateurs': '💻',
      'Tablettes': '📱',
      'Audio': '🎧',
      'Photo': '📷',
      'Gaming': '🎮',
      'Montres': '⌚',
      'Télévision': '📺',
      'Accessoires': '🔌'
    };
    return emojis[categoryName] || '📦';
  }
}
