import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ListingService } from '../../../core/services/listing.service';
import { ProductAdminService } from '../../../core/services/product-admin.service';
import { ProductService } from '../../../core/services/product.service';
import { ImageService } from '../../../core/services/image.service';
import { UserService } from '../../../core/services/user.service';
import { SellerProfileService } from '../../../core/services/seller-profile.service';
import { CategoryService } from '../../../core/services/category.service';
import { DigitalPassportService } from '../../../core/services/digital-passport.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Listing } from '../../../core/models/listing.model';
import { Product } from '../../../core/models/product.model';
import { Category } from '../../../core/models/category.model';
import { HeaderComponent } from '../../../shared/header/header.component';
import { FooterComponent } from '../../../shared/footer/footer.component';

@Component({
  selector: 'app-seller-products',
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './seller-products.component.html',
  styleUrls: ['./seller-products.component.scss']
})
export class SellerProductsComponent implements OnInit {
  isLoading = signal(true);
  listings = signal<Listing[]>([]);
  categories = signal<Category[]>([]);
  
  // Modal ajout produit
  showAddModal = signal(false);
  
  // Mode de création: 'new' ou 'existing'
  creationMode: 'new' | 'existing' = 'new';
  
  // Recherche de produits existants
  searchQuery = '';
  searchResults = signal<Product[]>([]);
  isSearching = signal(false);
  selectedExistingProduct: Product | null = null;
  
  // Formulaire produit
  newProduct = {
    title: '',
    brand: '',
    model: '',
    condition: 'Excellent',
    description: '',
    categoryId: null as number | null,
    price: 0,
    quantity: 1,
    conditionNote: ''
  };

  // Upload d'images
  selectedFiles: File[] = [];
  imagePreviews: string[] = [];
  isUploading = signal(false);

  // Passeport Numérique
  addDigitalPassport = signal(false);
  digitalPassportData = {
    // Carbon Footprint
    carbonScore: 'C',
    totalEmissions: 50.0,
    manufacturing: 35.0,
    transport: 8.0,
    usage: 5.0,
    endOfLife: 2.0,
    
    // Traceability
    origin: '',
    manufacturer: '',
    manufacturingDate: '',
    supplyChain: '',
    
    // Materials
    renewableMaterials: 20,
    recycledMaterials: 15,
    recyclableMaterials: 85,
    materialsDescription: '',
    
    // Durability
    repairabilityScore: 7.5,
    spareParts: '',
    warranty: 24,
    durabilityDescription: '',
    
    // Certifications
    certifications: '',
    
    // Recycling
    recyclingInstructions: '',
    collectionPoints: ''
  };

  conditions = ['Neuf', 'Excellent', 'Très bon état', 'Bon état', 'Correct'];
  carbonScores = ['A', 'B', 'C', 'D', 'E'];

  constructor(
    private listingService: ListingService,
    private productAdminService: ProductAdminService,
    private productService: ProductService,
    private imageService: ImageService,
    private userService: UserService,
    private sellerProfileService: SellerProfileService,
    private categoryService: CategoryService,
    private digitalPassportService: DigitalPassportService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.checkSellerProfile();
  }

  /**
   * Vérifier si le profil vendeur existe
   * Si non, rediriger vers la page de setup
   */
  private checkSellerProfile() {
    this.sellerProfileService.getMyProfile().subscribe({
      next: () => {
        // Le profil existe, charger les données
        this.loadCategories();
        this.loadListings();
      },
      error: () => {
        // Le profil n'existe pas, rediriger vers setup
        this.notificationService.warning('Vous devez d\'abord créer votre profil vendeur');
        this.router.navigate(['/seller/setup']);
      }
    });
  }

  /**
   * Charger les catégories disponibles
   */
  private loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
      },
      error: (error) => {
        console.error('Erreur chargement catégories:', error);
      }
    });
  }

  private loadListings() {
    this.isLoading.set(true);
    console.log('📦 Chargement des listings vendeur...');
    this.listingService.getMyListings().subscribe({
      next: (listings) => {
        console.log('✅ Listings reçus:', listings);
        console.log('📊 Nombre:', listings?.length || 0);
        // S'assurer que listings est toujours un tableau
        this.listings.set(Array.isArray(listings) ? listings : []);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('❌ Erreur chargement listings:', error);
        console.error('📋 Détails:', error.error);
        // Initialiser avec tableau vide en cas d'erreur
        this.listings.set([]);
        this.isLoading.set(false);
      }
    });
  }

  openAddModal() {
    this.showAddModal.set(true);
    this.creationMode = 'new'; // Par défaut: nouveau produit
  }

  closeAddModal() {
    this.showAddModal.set(false);
    this.resetForm();
  }
  
  setCreationMode(mode: 'new' | 'existing') {
    this.creationMode = mode;
    if (mode === 'existing') {
      // Réinitialiser la recherche
      this.searchQuery = '';
      this.searchResults.set([]);
      this.selectedExistingProduct = null;
    }
  }

  private resetForm() {
    this.newProduct = {
      title: '',
      brand: '',
      model: '',
      condition: 'Excellent',
      description: '',
      categoryId: null,
      price: 0,
      quantity: 1,
      conditionNote: ''
    };
    this.selectedFiles = [];
    this.imagePreviews = [];
    this.searchQuery = '';
    this.searchResults.set([]);
    this.selectedExistingProduct = null;
    this.creationMode = 'new';
    this.addDigitalPassport.set(false);
    this.digitalPassportData = {
      carbonScore: 'C',
      totalEmissions: 50.0,
      manufacturing: 35.0,
      transport: 8.0,
      usage: 5.0,
      endOfLife: 2.0,
      origin: '',
      manufacturer: '',
      manufacturingDate: '',
      supplyChain: '',
      renewableMaterials: 20,
      recycledMaterials: 15,
      recyclableMaterials: 85,
      materialsDescription: '',
      repairabilityScore: 7.5,
      spareParts: '',
      warranty: 24,
      durabilityDescription: '',
      certifications: '',
      recyclingInstructions: '',
      collectionPoints: ''
    };
  }
  
  /**
   * Rechercher des produits existants
   */
  searchExistingProducts() {
    if (!this.searchQuery || this.searchQuery.length < 2) {
      this.searchResults.set([]);
      return;
    }
    
    this.isSearching.set(true);
    this.productService.searchProducts(this.searchQuery, 0, 20).subscribe({
      next: (page) => {
        this.searchResults.set(page.content);
        this.isSearching.set(false);
      },
      error: (error) => {
        console.error('Erreur recherche produits:', error);
        this.isSearching.set(false);
      }
    });
  }
  
  /**
   * Sélectionner un produit existant
   */
  selectExistingProduct(product: Product) {
    this.selectedExistingProduct = product;
    // Pré-remplir les infos de listing
    this.newProduct.conditionNote = '';
    // Garder le prix et la quantité à définir par le vendeur
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);
      this.selectedFiles = files;

      // Générer les aperçus
      this.imagePreviews = [];
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreviews.push(e.target.result);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    if (event.dataTransfer?.files) {
      const files = Array.from(event.dataTransfer.files);
      this.selectedFiles = files;

      // Générer les aperçus
      this.imagePreviews = [];
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreviews.push(e.target.result);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  removeImage(index: number) {
    this.selectedFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  async createProduct() {
    // Validation selon le mode
    if (this.creationMode === 'new') {
      if (!this.newProduct.title || !this.newProduct.brand || !this.newProduct.model) {
        this.notificationService.error('Veuillez remplir tous les champs obligatoires');
        return;
      }

      if (this.selectedFiles.length === 0) {
        this.notificationService.warning('Veuillez ajouter au moins une image');
        return;
      }
    } else {
      if (!this.selectedExistingProduct) {
        this.notificationService.warning('Veuillez sélectionner un produit existant');
        return;
      }
    }

    if (this.newProduct.price <= 0 || this.newProduct.quantity <= 0) {
      this.notificationService.error('Veuillez définir un prix et une quantité valides');
      return;
    }

    this.isUploading.set(true);

    try {
      let productId: number;

      if (this.creationMode === 'new') {
        // MODE NOUVEAU PRODUIT: Créer produit + upload images + listing
        
        // 1. Créer le produit
        const productRequest: any = {
          title: this.newProduct.title,
          brand: this.newProduct.brand,
          model: this.newProduct.model,
          condition: this.newProduct.condition,
          description: this.newProduct.description
        };

        // Ajouter categoryId seulement s'il est sélectionné
        if (this.newProduct.categoryId) {
          productRequest.categoryId = this.newProduct.categoryId;
        }

        const product = await this.productAdminService.createProduct(productRequest).toPromise();

        if (!product) {
          throw new Error('Erreur lors de la création du produit');
        }

        productId = product.id;

        // 2. Upload les images sur Cloudinary
        await this.imageService.uploadMultipleProductImages(
          product.id,
          this.selectedFiles,
          this.newProduct.title
        ).toPromise();
      } else {
        // MODE PRODUIT EXISTANT: Créer uniquement le listing
        productId = this.selectedExistingProduct!.id;
      }

      // 3. Obtenir le profil vendeur
      const profile = await this.userService.getMyProfile().toPromise();
      
      if (!profile?.sellerInfo) {
        throw new Error('Profil vendeur introuvable');
      }

      // 4. Créer le listing
      const listingRequest = {
        productId: productId,
        sellerProfileId: profile.sellerInfo.sellerId,
        price: this.newProduct.price,
        quantity: this.newProduct.quantity,
        conditionNote: this.newProduct.conditionNote
      };

      await this.listingService.createListing(listingRequest).toPromise();

      // 5. Si passeport numérique activé, le créer
      if (this.addDigitalPassport() && this.creationMode === 'new') {
        try {
          const passportData: any = {
            productId: productId,
            carbonFootprint: {
              totalCO2: this.digitalPassportData.totalEmissions,
              manufacturing: this.digitalPassportData.manufacturing,
              transportation: this.digitalPassportData.transport,
              usage: this.digitalPassportData.usage,
              endOfLife: this.digitalPassportData.endOfLife
            },
            traceability: {
              originCountry: this.digitalPassportData.origin || 'Non spécifié',
              manufacturer: this.digitalPassportData.manufacturer || 'Non spécifié',
              factory: '',
              supplyChainJourney: this.digitalPassportData.supplyChain ? 
                this.digitalPassportData.supplyChain.split(',').map(s => s.trim()) : [],
              transparencyScore: 75
            },
            materials: [
              {
                name: 'Matériaux renouvelables',
                percentage: this.digitalPassportData.renewableMaterials,
                renewable: true,
                recycled: false,
                recyclable: true
              },
              {
                name: 'Matériaux recyclés',
                percentage: this.digitalPassportData.recycledMaterials,
                renewable: false,
                recycled: true,
                recyclable: true
              }
            ],
            durability: {
              expectedLifespanYears: 5,
              repairabilityScore: this.digitalPassportData.repairabilityScore,
              sparePartsAvailable: true,
              warrantyYears: Math.floor(this.digitalPassportData.warranty / 12),
              softwareUpdates: true
            },
            certifications: this.digitalPassportData.certifications ? 
              this.digitalPassportData.certifications.split(',').map(cert => ({
                name: cert.trim(),
                issuer: 'Organisme certificateur',
                validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                type: 'QUALITY'
              })) : [],
            recyclingInfo: {
              recyclablePercentage: this.digitalPassportData.recyclableMaterials,
              instructions: this.digitalPassportData.recyclingInstructions || 'Recycler selon les normes locales',
              takeBackProgram: false,
              collectionPoints: []
            }
          };

          await this.digitalPassportService.create(passportData).toPromise();
          console.log('✅ Passeport numérique créé avec succès');
        } catch (passportError) {
          console.error('⚠️ Erreur création passeport (non bloquant):', passportError);
          // Ne pas bloquer la création du produit si le passeport échoue
        }
      }

      // 6. Recharger les listings
      this.loadListings();
      this.closeAddModal();
      
      const message = this.creationMode === 'new' 
        ? 'Produit créé et ajouté à votre catalogue avec succès !' + (this.addDigitalPassport() ? ' 🌍 Passeport numérique ajouté.' : '')
        : 'Votre offre a été ajoutée au produit existant !';
      this.notificationService.success(message);

    } catch (error: any) {
      console.error('Erreur création:', error);
      
      // Détecter l'erreur de doublon (409 ou 500 avec constraint violation)
      const errorMessage = error.error?.message || error.message || '';
      const isDuplicateListing = error.status === 409 || 
                                  errorMessage.includes('uk_listing_product_seller') ||
                                  errorMessage.includes('duplicate key');
      
      if (isDuplicateListing) {
        this.notificationService.warning('Vous avez déjà une offre pour ce produit. Modifiez votre offre existante.');
      } else if (error.status === 400) {
        this.notificationService.error('Données invalides: ' + errorMessage);
      } else if (error.status === 404) {
        this.notificationService.error('Produit ou profil vendeur introuvable.');
      } else {
        this.notificationService.error('Erreur lors de la création. Vérifiez votre connexion.');
      }
    } finally {
      this.isUploading.set(false);
    }
  }

  deleteListing(id: number) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      return;
    }

    this.listingService.deleteListing(id).subscribe({
      next: () => {
        this.loadListings();
        this.notificationService.success('Produit supprimé avec succès');
      },
      error: (error) => {
        console.error('Erreur suppression:', error);
        this.notificationService.error('Erreur lors de la suppression');
      }
    });
  }
}
