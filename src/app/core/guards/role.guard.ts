import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard pour protéger les routes nécessitant un rôle spécifique
 * Utilisation: canActivate: [roleGuard], data: { roles: ['ROLE_ADMIN'] }
 */
export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentUser = authService.currentUser();
  const requiredRoles = route.data['roles'] as string[];

  // Vérifier si connecté
  if (!currentUser) {
    router.navigate(['/auth/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }

  // Vérifier le rôle
  const hasRole = requiredRoles.some(role => 
    currentUser.roles.some(userRole => userRole === role)
  );

  if (!hasRole) {
    // Pas le bon rôle, rediriger vers home
    router.navigate(['/']);
    return false;
  }

  return true;
};
