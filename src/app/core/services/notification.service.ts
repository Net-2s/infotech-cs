import { Injectable, signal } from '@angular/core';
import { Notification } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = signal<Notification[]>([]);
  
  // Exposer les notifications en lecture seule
  readonly notifications$ = this.notifications.asReadonly();

  /**
   * Afficher une notification de succès
   */
  success(message: string, duration = 5000): void {
    this.show('success', message, duration);
  }

  /**
   * Afficher une notification d'erreur
   */
  error(message: string, duration = 7000): void {
    this.show('error', message, duration);
  }

  /**
   * Afficher un avertissement
   */
  warning(message: string, duration = 6000): void {
    this.show('warning', message, duration);
  }

  /**
   * Afficher une information
   */
  info(message: string, duration = 5000): void {
    this.show('info', message, duration);
  }

  /**
   * Afficher une notification personnalisée
   */
  private show(type: Notification['type'], message: string, duration: number): void {
    const notification: Notification = {
      id: this.generateId(),
      type,
      message,
      duration
    };

    // Ajouter la notification
    this.notifications.update(current => [...current, notification]);

    // Auto-suppression après duration
    if (duration > 0) {
      setTimeout(() => {
        this.remove(notification.id);
      }, duration);
    }
  }

  /**
   * Supprimer une notification
   */
  remove(id: string): void {
    this.notifications.update(current => 
      current.filter(n => n.id !== id)
    );
  }

  /**
   * Supprimer toutes les notifications
   */
  clear(): void {
    this.notifications.set([]);
  }

  /**
   * Générer un ID unique
   */
  private generateId(): string {
    return `notification-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}
