import { Component, OnInit, inject, HostListener, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { Product, ProductFilters } from '../../../core/models/product.model';
import { Category } from '../../../core/models/category.model';
import { ProductCardComponent } from '../../../shared/product-card/product-card.component';
import { HeaderComponent } from '../../../shared/header/header.component';
import { FooterComponent } from '../../../shared/footer/footer.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ProductCardComponent, HeaderComponent, FooterComponent],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit {
  productService = inject(ProductService);
  categoryService = inject(CategoryService);
  route = inject(ActivatedRoute);

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  brands = signal<string[]>([]);
  conditions = signal<string[]>([]);
  
  // Filtres
  selectedCategories = signal<number[]>([]);
  selectedBrands = signal<string[]>([]);
  selectedConditions = signal<string[]>([]);
  minPrice = signal<number>(0);
  maxPrice = signal<number>(5000);
  priceRange = signal<{ min: number; max: number }>({ min: 0, max: 5000 });
  searchQuery = signal<string>('');
  sortBy = signal<string>('');

  totalPages = signal<number>(0);
  totalElements = signal<number>(0);
  currentPage = signal<number>(0);
  pageSize = 12;
  
  isLoading = signal<boolean>(true);
  showFilters = signal<boolean>(true); // Afficher les filtres par défaut sur desktop
  showBackToTop = signal<boolean>(false);
  
  // Collapse states pour les sections de filtres
  showPriceFilter = signal<boolean>(true);
  showCategoriesFilter = signal<boolean>(false);
  showBrandsFilter = signal<boolean>(false);
  showConditionsFilter = signal<boolean>(false);

  // Nombre de filtres actifs
  activeFiltersCount = computed(() => {
    let count = 0;
    if (this.selectedCategories().length > 0) count++;
    if (this.selectedBrands().length > 0) count++;
    if (this.selectedConditions().length > 0) count++;
    if (this.priceRange().min > 0 || this.priceRange().max < 5000) count++;
    if (this.searchQuery()) count++;
    if (this.sortBy()) count++;
    return count;
  });

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.showBackToTop.set(window.pageYOffset > 300);
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadBrands();
    this.loadConditions();
    
    this.route.queryParams.subscribe(params => {
      if (params['categoryId']) {
        this.selectedCategories.set([+params['categoryId']]);
      }
      if (params['search']) {
        this.searchQuery.set(params['search']);
      }
      this.loadProducts();
    });
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  loadProducts(): void {
    this.isLoading.set(true);
    
    const filters: ProductFilters = {
      page: this.currentPage(),
      size: this.pageSize,
      search: this.searchQuery() || undefined,
      categoryId: this.selectedCategories().length === 1 ? this.selectedCategories()[0] : undefined,
      brand: this.selectedBrands().length === 1 ? this.selectedBrands()[0] : undefined,
      condition: this.selectedConditions().length === 1 ? this.selectedConditions()[0] : undefined,
      minPrice: this.priceRange().min > 0 ? this.priceRange().min : undefined,
      maxPrice: this.priceRange().max < 5000 ? this.priceRange().max : undefined,
      sort: this.sortBy() || undefined
    };

    this.productService.getProducts(filters).subscribe({
      next: (data) => {
        this.products.set(data.content);
        this.totalPages.set(data.totalPages);
        this.totalElements.set(data.totalElements);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (data) => this.categories.set(data)
    });
  }

  loadBrands(): void {
    this.productService.getBrands().subscribe({
      next: (data) => this.brands.set(data)
    });
  }

  loadConditions(): void {
    this.productService.getConditions().subscribe({
      next: (data) => this.conditions.set(data)
    });
  }

  // Gestion des filtres
  toggleCategory(categoryId: number): void {
    const current = this.selectedCategories();
    if (current.includes(categoryId)) {
      this.selectedCategories.set(current.filter(id => id !== categoryId));
    } else {
      this.selectedCategories.set([...current, categoryId]);
    }
    this.onFilterChange();
  }

  toggleBrand(brand: string): void {
    const current = this.selectedBrands();
    if (current.includes(brand)) {
      this.selectedBrands.set(current.filter(b => b !== brand));
    } else {
      this.selectedBrands.set([...current, brand]);
    }
    this.onFilterChange();
  }

  toggleCondition(condition: string): void {
    const current = this.selectedConditions();
    if (current.includes(condition)) {
      this.selectedConditions.set(current.filter(c => c !== condition));
    } else {
      this.selectedConditions.set([...current, condition]);
    }
    this.onFilterChange();
  }

  onPriceRangeChange(min: number, max: number): void {
    this.priceRange.set({ min, max });
    this.onFilterChange();
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.onFilterChange();
  }

  onSortChange(sort: string): void {
    this.sortBy.set(sort);
    this.onFilterChange();
  }

  onFilterChange(): void {
    this.currentPage.set(0);
    this.loadProducts();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  clearFilters(): void {
    this.selectedCategories.set([]);
    this.selectedBrands.set([]);
    this.selectedConditions.set([]);
    this.priceRange.set({ min: 0, max: 5000 });
    this.searchQuery.set('');
    this.sortBy.set('');
    this.currentPage.set(0);
    this.loadProducts();
  }

  toggleFilters(): void {
    this.showFilters.update(show => !show);
  }

  // Toggle collapse des sections de filtres
  togglePriceFilter(): void {
    this.showPriceFilter.update(show => !show);
  }

  toggleCategoriesFilter(): void {
    this.showCategoriesFilter.update(show => !show);
  }

  toggleBrandsFilter(): void {
    this.showBrandsFilter.update(show => !show);
  }

  toggleConditionsFilter(): void {
    this.showConditionsFilter.update(show => !show);
  }
}
