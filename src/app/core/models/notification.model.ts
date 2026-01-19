export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number; // en millisecondes (défaut: 5000)
}

export type NotificationType = Notification['type'];
