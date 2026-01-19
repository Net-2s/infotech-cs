import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Routes publiques
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'products',
    loadComponent: () => import('./features/products/product-list/product-list.component').then(m => m.ProductListComponent)
  },
  {
    path: 'products/:id/passport',
    loadComponent: () => import('./features/products/digital-passport/digital-passport.component').then(m => m.DigitalPassportComponent)
  },
  {
    path: 'products/:id',
    loadComponent: () => import('./features/products/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },

  // Routes protégées - Connexion requise
  {
    path: 'cart',
    loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent),
    canActivate: [authGuard]
  },
  {
    path: 'checkout',
    loadComponent: () => import('./features/checkout/checkout.component').then(m => m.CheckoutComponent),
    canActivate: [authGuard]
  },
  {
    path: 'favorites',
    loadComponent: () => import('./features/favorites/favorites.component').then(m => m.FavoritesComponent),
    canActivate: [authGuard]
  },
  {
    path: 'orders',
    loadComponent: () => import('./features/orders/order-list/order-list.component').then(m => m.OrderListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'orders/confirmation',
    loadComponent: () => import('./features/orders/order-confirmation/order-confirmation.component').then(m => m.OrderConfirmationComponent),
    canActivate: [authGuard]
  },
  {
    path: 'orders/:id',
    loadComponent: () => import('./features/orders/order-detail/order-detail.component').then(m => m.OrderDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },

  // Routes ADMIN - Rôle ADMIN requis
  {
    path: 'admin/dashboard',
    loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [roleGuard],
    data: { roles: ['ROLE_ADMIN'] }
  },
  {
    path: 'admin/users',
    loadComponent: () => import('./features/admin/users-management/users-management.component').then(m => m.UsersManagementComponent),
    canActivate: [roleGuard],
    data: { roles: ['ROLE_ADMIN'] }
  },

  // Routes SELLER - Connexion requise (rôle sera vérifié dans le composant)
  {
    path: 'seller/setup',
    loadComponent: () => import('./features/seller/setup/seller-setup.component').then(m => m.SellerSetupComponent),
    canActivate: [authGuard]
  },
  {
    path: 'seller/dashboard',
    loadComponent: () => import('./features/seller/dashboard/seller-dashboard.component').then(m => m.SellerDashboardComponent),
    canActivate: [roleGuard],
    data: { roles: ['ROLE_SELLER', 'ROLE_ADMIN'] }
  },
  {
    path: 'seller/products',
    loadComponent: () => import('./features/seller/products/seller-products.component').then(m => m.SellerProductsComponent),
    canActivate: [roleGuard],
    data: { roles: ['ROLE_SELLER', 'ROLE_ADMIN'] }
  },
  {
    path: 'seller/listings',
    loadComponent: () => import('./features/seller/my-listings/my-listings.component').then(m => m.MyListingsComponent),
    canActivate: [roleGuard],
    data: { roles: ['ROLE_SELLER', 'ROLE_ADMIN'] }
  },
  {
    path: 'seller/listings/create',
    loadComponent: () => import('./features/seller/create-listing/create-listing.component').then(m => m.CreateListingComponent),
    canActivate: [roleGuard],
    data: { roles: ['ROLE_SELLER', 'ROLE_ADMIN'] }
  },
  {
    path: 'seller/orders',
    loadComponent: () => import('./features/seller/orders/seller-orders.component').then(m => m.SellerOrdersComponent),
    canActivate: [roleGuard],
    data: { roles: ['ROLE_SELLER', 'ROLE_ADMIN'] }
  },

  // Fallback
  {
    path: '**',
    redirectTo: ''
  }
];
