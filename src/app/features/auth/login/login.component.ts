import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { HeaderComponent } from '../../../shared/header/header.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HeaderComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  authService = inject(AuthService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  notificationService = inject(NotificationService);

  credentials = {
    email: '',
    password: ''
  };

  isLoading = false;
  error = '';

  onSubmit(): void {
    this.isLoading = true;
    this.error = '';

    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.notificationService.success('Connexion réussie ! Bienvenue 👋');
        
        // Récupérer l'URL de retour ou rediriger vers home
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
        this.router.navigate([returnUrl]);
      },
      error: (err) => {
        this.error = 'Email ou mot de passe incorrect';
        this.notificationService.error('Échec de la connexion. Vérifiez vos identifiants.');
        this.isLoading = false;
      }
    });
  }
}
