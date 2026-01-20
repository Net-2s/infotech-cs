import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../models/order.model';
import { User } from '../models/user.model';

export interface EmailData {
  to: string;
  subject: string;
  htmlContent: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/emails`;

  /**
   * Envoie un email de confirmation de commande
   */
  sendOrderConfirmation(order: Order, userEmail: string, orderNumber: string): Observable<void> {
    const emailData: EmailData = {
      to: userEmail,
      subject: `Confirmation de commande ${orderNumber} - InfoTech`,
      htmlContent: this.buildOrderConfirmationEmail(order, orderNumber)
    };

    return this.http.post<void>(`${this.apiUrl}/send`, emailData);
  }

  /**
   * Envoie un email de bienvenue à un nouvel utilisateur
   */
  sendWelcomeEmail(user: User): Observable<void> {
    const emailData: EmailData = {
      to: user.email,
      subject: 'Bienvenue sur InfoTech ! 🎉',
      htmlContent: this.buildWelcomeEmail(user.displayName || 'Membre')
    };

    return this.http.post<void>(`${this.apiUrl}/send`, emailData);
  }

  /**
   * Envoie un email de réinitialisation de mot de passe
   */
  sendPasswordResetEmail(email: string, resetToken: string): Observable<void> {
    const emailData: EmailData = {
      to: email,
      subject: 'Réinitialisation de votre mot de passe - InfoTech',
      htmlContent: this.buildPasswordResetEmail(resetToken)
    };

    return this.http.post<void>(`${this.apiUrl}/send`, emailData);
  }

  /**
   * Envoie un email de notification d'expédition
   */
  sendShippingNotification(order: Order, userEmail: string, orderNumber: string, trackingNumber?: string): Observable<void> {
    const emailData: EmailData = {
      to: userEmail,
      subject: `Votre commande ${orderNumber} a été expédiée ! 📦`,
      htmlContent: this.buildShippingEmail(order, orderNumber, trackingNumber)
    };

    return this.http.post<void>(`${this.apiUrl}/send`, emailData);
  }

  /**
   * Template HTML pour email de confirmation de commande
   */
  private buildOrderConfirmationEmail(order: Order, orderNumber: string): string {
    const today = new Date();
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + 5); // Estimation J+5

    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 15px; border-bottom: 1px solid #eee;">
          <strong>${item.productTitle}</strong><br>
          <span style="color: #666; font-size: 14px;">Quantité: ${item.quantity}</span>
        </td>
        <td style="padding: 15px; border-bottom: 1px solid #eee; text-align: right;">
          ${this.formatPrice(item.price)} €
        </td>
      </tr>
    `).join('');

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmation de commande</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f7fa; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: white; font-size: 32px; font-weight: 700;">
                                ✅ Commande confirmée !
                            </h1>
                            <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                                Merci pour votre achat sur InfoTech
                            </p>
                        </td>
                    </tr>

                    <!-- Order Info -->
                    <tr>
                        <td style="padding: 30px;">
                            <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin-bottom: 30px;">
                                <p style="margin: 0 0 10px; color: #666; font-size: 14px;">Numéro de commande</p>
                                <p style="margin: 0; font-size: 24px; font-weight: 700; color: #1a1a1a;">${orderNumber}</p>
                            </div>

                            <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 20px;">Détails de la commande</h2>
                            
                            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                                ${itemsHtml}
                                <tr>
                                    <td colspan="2" style="padding: 20px 15px; text-align: right; background-color: #f8f9fa;">
                                        <span style="font-size: 16px; color: #666;">Total : </span>
                                        <strong style="font-size: 24px; color: #667eea;">${this.formatPrice(order.total)} €</strong>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Delivery Info -->
                    <tr>
                        <td style="padding: 0 30px 30px;">
                            <div style="background-color: #e8f4f8; border-radius: 8px; padding: 20px; text-align: center;">
                                <h3 style="margin: 0 0 10px; color: #1a1a1a; font-size: 18px;">📦 Livraison estimée</h3>
                                <p style="margin: 0; font-size: 16px; color: #666;">
                                    ${deliveryDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                        </td>
                    </tr>

                    <!-- CTA Button -->
                    <tr>
                        <td style="padding: 0 30px 40px; text-align: center;">
                            <a href="http://localhost:4200/orders" 
                               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                      color: white; text-decoration: none; padding: 15px 40px; 
                                      border-radius: 8px; font-weight: 600; font-size: 16px;">
                                Suivre ma commande
                            </a>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                            <p style="margin: 0 0 10px; color: #666; font-size: 14px;">
                                Besoin d'aide ? Contactez-nous à 
                                <a href="mailto:support@infotech.com" style="color: #667eea; text-decoration: none;">support@infotech.com</a>
                            </p>
                            <p style="margin: 0; color: #999; font-size: 12px;">
                                © 2025 InfoTech. Tous droits réservés.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
  }

  /**
   * Template HTML pour email de bienvenue
   */
  private buildWelcomeEmail(firstName: string): string {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenue sur InfoTech</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f7fa; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 50px 30px; text-align: center;">
                            <h1 style="margin: 0; color: white; font-size: 36px; font-weight: 700;">
                                🎉 Bienvenue ${firstName} !
                            </h1>
                            <p style="margin: 15px 0 0; color: rgba(255,255,255,0.9); font-size: 18px;">
                                Votre compte InfoTech est prêt
                            </p>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 22px;">Que pouvez-vous faire maintenant ?</h2>
                            
                            <div style="margin-bottom: 25px;">
                                <div style="display: inline-block; width: 40px; height: 40px; background-color: #e8f4f8; border-radius: 50%; text-align: center; line-height: 40px; margin-right: 15px;">🛍️</div>
                                <div style="display: inline-block; vertical-align: top; width: calc(100% - 60px);">
                                    <h3 style="margin: 0 0 5px; color: #1a1a1a; font-size: 18px;">Explorez notre marketplace</h3>
                                    <p style="margin: 0; color: #666; font-size: 14px;">Découvrez des milliers de produits high-tech reconditionnés</p>
                                </div>
                            </div>

                            <div style="margin-bottom: 25px;">
                                <div style="display: inline-block; width: 40px; height: 40px; background-color: #e8f4f8; border-radius: 50%; text-align: center; line-height: 40px; margin-right: 15px;">⭐</div>
                                <div style="display: inline-block; vertical-align: top; width: calc(100% - 60px);">
                                    <h3 style="margin: 0 0 5px; color: #1a1a1a; font-size: 18px;">Créez vos favoris</h3>
                                    <p style="margin: 0; color: #666; font-size: 14px;">Sauvegardez vos produits préférés pour plus tard</p>
                                </div>
                            </div>

                            <div style="margin-bottom: 25px;">
                                <div style="display: inline-block; width: 40px; height: 40px; background-color: #e8f4f8; border-radius: 50%; text-align: center; line-height: 40px; margin-right: 15px;">💼</div>
                                <div style="display: inline-block; vertical-align: top; width: calc(100% - 60px);">
                                    <h3 style="margin: 0 0 5px; color: #1a1a1a; font-size: 18px;">Devenez vendeur</h3>
                                    <p style="margin: 0; color: #666; font-size: 14px;">Vendez vos propres produits en quelques clics</p>
                                </div>
                            </div>
                        </td>
                    </tr>

                    <!-- CTA Button -->
                    <tr>
                        <td style="padding: 0 30px 40px; text-align: center;">
                            <a href="http://localhost:4200/products" 
                               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                      color: white; text-decoration: none; padding: 15px 40px; 
                                      border-radius: 8px; font-weight: 600; font-size: 16px;">
                                Commencer à explorer
                            </a>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                            <p style="margin: 0 0 10px; color: #666; font-size: 14px;">
                                Besoin d'aide ? Contactez-nous à 
                                <a href="mailto:support@infotech.com" style="color: #667eea; text-decoration: none;">support@infotech.com</a>
                            </p>
                            <p style="margin: 0; color: #999; font-size: 12px;">
                                © 2025 InfoTech. Tous droits réservés.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
  }

  /**
   * Template HTML pour email de réinitialisation de mot de passe
   */
  private buildPasswordResetEmail(resetToken: string): string {
    const resetLink = `http://localhost:4200/reset-password?token=${resetToken}`;

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Réinitialisation de mot de passe</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f7fa; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: white; font-size: 32px; font-weight: 700;">
                                🔒 Réinitialisation de mot de passe
                            </h1>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 20px; color: #1a1a1a; font-size: 16px;">
                                Bonjour,
                            </p>
                            <p style="margin: 0 0 20px; color: #666; font-size: 16px; line-height: 1.6;">
                                Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte InfoTech. 
                                Si vous êtes à l'origine de cette demande, cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe.
                            </p>

                            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 25px 0;">
                                <p style="margin: 0; color: #856404; font-size: 14px;">
                                    ⚠️ Ce lien expire dans <strong>1 heure</strong> pour des raisons de sécurité.
                                </p>
                            </div>
                        </td>
                    </tr>

                    <!-- CTA Button -->
                    <tr>
                        <td style="padding: 0 30px 30px; text-align: center;">
                            <a href="${resetLink}" 
                               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                      color: white; text-decoration: none; padding: 15px 40px; 
                                      border-radius: 8px; font-weight: 600; font-size: 16px;">
                                Réinitialiser mon mot de passe
                            </a>
                        </td>
                    </tr>

                    <!-- Alternative link -->
                    <tr>
                        <td style="padding: 0 30px 40px;">
                            <p style="margin: 0 0 10px; color: #666; font-size: 14px; text-align: center;">
                                Ou copiez ce lien dans votre navigateur :
                            </p>
                            <p style="margin: 0; color: #667eea; font-size: 12px; word-break: break-all; text-align: center;">
                                ${resetLink}
                            </p>
                        </td>
                    </tr>

                    <!-- Security notice -->
                    <tr>
                        <td style="padding: 0 30px 40px;">
                            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px;">
                                <p style="margin: 0 0 10px; color: #1a1a1a; font-size: 14px; font-weight: 600;">
                                    Vous n'avez pas demandé cette réinitialisation ?
                                </p>
                                <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.5;">
                                    Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email. 
                                    Votre mot de passe restera inchangé.
                                </p>
                            </div>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                            <p style="margin: 0 0 10px; color: #666; font-size: 14px;">
                                Besoin d'aide ? Contactez-nous à 
                                <a href="mailto:support@infotech.com" style="color: #667eea; text-decoration: none;">support@infotech.com</a>
                            </p>
                            <p style="margin: 0; color: #999; font-size: 12px;">
                                © 2025 InfoTech. Tous droits réservés.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
  }

  /**
   * Template HTML pour email de notification d'expédition
   */
  private buildShippingEmail(order: Order, orderNumber: string, trackingNumber?: string): string {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Commande expédiée</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f7fa; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: white; font-size: 32px; font-weight: 700;">
                                📦 Votre colis est en route !
                            </h1>
                            <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                                Commande ${orderNumber}
                            </p>
                        </td>
                    </tr>

                    <!-- Tracking Info -->
                    ${trackingNumber ? `
                    <tr>
                        <td style="padding: 30px;">
                            <div style="background-color: #e8f4f8; border-left: 4px solid #28a745; padding: 20px; text-align: center;">
                                <p style="margin: 0 0 10px; color: #666; font-size: 14px;">Numéro de suivi</p>
                                <p style="margin: 0; font-size: 24px; font-weight: 700; color: #1a1a1a;">${trackingNumber}</p>
                            </div>
                        </td>
                    </tr>
                    ` : ''}

                    <!-- Content -->
                    <tr>
                        <td style="padding: ${trackingNumber ? '0' : '30px'} 30px 30px;">
                            <p style="margin: 0 0 20px; color: #1a1a1a; font-size: 16px; text-align: center;">
                                Bonne nouvelle ! Votre commande a été expédiée et sera bientôt chez vous.
                            </p>
                            
                            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-top: 20px;">
                                <h3 style="margin: 0 0 15px; color: #1a1a1a; font-size: 18px;">Articles expédiés</h3>
                                ${order.items.map(item => `
                                    <div style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                                        <p style="margin: 0; color: #1a1a1a; font-weight: 600;">${item.productTitle}</p>
                                        <p style="margin: 5px 0 0; color: #666; font-size: 14px;">Quantité: ${item.quantity}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </td>
                    </tr>

                    <!-- CTA Buttons -->
                    <tr>
                        <td style="padding: 0 30px 40px; text-align: center;">
                            ${trackingNumber ? `
                            <a href="https://www.laposte.fr/outils/suivre-vos-envois?code=${trackingNumber}" 
                               style="display: inline-block; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); 
                                      color: white; text-decoration: none; padding: 15px 40px; 
                                      border-radius: 8px; font-weight: 600; font-size: 16px; margin-right: 10px;">
                                Suivre mon colis
                            </a>
                            ` : ''}
                            <a href="http://localhost:4200/orders" 
                               style="display: inline-block; background: #667eea; 
                                      color: white; text-decoration: none; padding: 15px 40px; 
                                      border-radius: 8px; font-weight: 600; font-size: 16px;">
                                Voir ma commande
                            </a>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                            <p style="margin: 0 0 10px; color: #666; font-size: 14px;">
                                Besoin d'aide ? Contactez-nous à 
                                <a href="mailto:support@infotech.com" style="color: #667eea; text-decoration: none;">support@infotech.com</a>
                            </p>
                            <p style="margin: 0; color: #999; font-size: 12px;">
                                © 2025 InfoTech. Tous droits réservés.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
  }

  /**
   * Formatte un prix avec 2 décimales
   */
  private formatPrice(price: number): string {
    return price.toFixed(2);
  }
}
