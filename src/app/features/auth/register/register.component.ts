import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { EmailService } from '../../../core/services/email.service';
import { NotificationService } from '../../../core/services/notification.service';
import { HeaderComponent } from '../../../shared/header/header.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HeaderComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  authService = inject(AuthService);
  emailService = inject(EmailService);
  notificationService = inject(NotificationService);
  router = inject(Router);

  credentials = {
    email: '',
    password: '',
    confirmPassword: ''
  };

  isSeller = false;
  isLoading = false;
  error = '';

  onSubmit(): void {
    if (this.credentials.password !== this.credentials.confirmPassword) {
      this.error = 'Les mots de passe ne correspondent pas';
      this.notificationService.error('Les mots de passe ne correspondent pas');
      return;
    }

    this.isLoading = true;
    this.error = '';

    this.authService.register({
      email: this.credentials.email,
      password: this.credentials.password
    }, this.isSeller).subscribe({
      next: () => {
        this.notificationService.success('Compte créé avec succès ! Bienvenue sur Infotech 🎉');
        
        // Envoi de l'email de bienvenue
        const user = this.authService.currentUser();
        if (user) {
          this.emailService.sendWelcomeEmail(user).subscribe({
            next: () => console.log('Email de bienvenue envoyé'),
            error: (err) => console.error('Erreur email bienvenue:', err)
          });
        }
        
        this.router.navigate(['/']);
      },
      error: () => {
        this.error = 'Une erreur est survenue lors de l\'inscription';
        this.notificationService.error('Erreur lors de l\'inscription. Cet email existe peut-être déjà.');
        this.isLoading = false;
      }
    });
  }
}
