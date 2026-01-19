import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { ListingService } from '../../../core/services/listing.service';
import { SellerProfileService } from '../../../core/services/seller-profile.service';
import { HeaderComponent } from '../../../shared/header/header.component';
import { FooterComponent } from '../../../shared/footer/footer.component';

@Component({
  selector: 'app-seller-dashboard',
  imports: [CommonModule, RouterLink, HeaderComponent, FooterComponent],
  templateUrl: './seller-dashboard.component.html',
  styleUrls: ['./seller-dashboard.component.scss']
})
export class SellerDashboardComponent implements OnInit {
  isLoading = signal(true);
  stats = signal<any>({
    totalListings: 0,
    totalSales: 0,
    totalRevenue: 0,
    averageRating: 0
  });
  myListings = signal<any[]>([]);

  constructor(
    private userService: UserService,
    private listingService: ListingService,
    private sellerProfileService: SellerProfileService,
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
        this.loadSellerData();
      },
      error: () => {
        // Le profil n'existe pas, rediriger vers setup
        alert('Vous devez d\'abord créer votre profil vendeur');
        this.router.navigate(['/seller/setup']);
      }
    });
  }

  private loadSellerData() {
    this.isLoading.set(true);

    // Charger les listings du vendeur
    console.log('🔍 Chargement des listings vendeur...');
    this.listingService.getMyListings().subscribe({
      next: (listings) => {
        console.log('✅ Listings reçus:', listings);
        console.log('📊 Nombre de listings:', listings?.length);
        
        // Vérifier si listings est bien un tableau
        if (!Array.isArray(listings)) {
          console.error('❌ La réponse n\'est pas un tableau:', listings);
          this.myListings.set([]);
          this.stats.set({
            totalListings: 0,
            totalSales: 0,
            totalRevenue: 0,
            averageRating: 0
          });
        } else {
          this.myListings.set(listings);
          
          // Calculer les statistiques réelles à partir des listings
          const stats = {
            totalListings: listings.length,
            totalSales: 0, // TODO: À implémenter côté backend
            totalRevenue: 0, // TODO: À implémenter côté backend
            averageRating: 0 // TODO: À implémenter côté backend
          };
          
          this.stats.set(stats);
        }
        
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des listings:', error);
        console.error('📋 Détails de l\'erreur:', error.error);
        console.error('📍 Status:', error.status);
        
        // Initialiser avec des valeurs vides en cas d'erreur
        this.myListings.set([]);
        this.stats.set({
          totalListings: 0,
          totalSales: 0,
          totalRevenue: 0,
          averageRating: 0
        });
        this.isLoading.set(false);
      }
    });
  }
}
