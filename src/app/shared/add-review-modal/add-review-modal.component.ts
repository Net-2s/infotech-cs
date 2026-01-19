import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewService } from '../../core/services/review.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { StarRatingComponent } from '../star-rating/star-rating.component';

@Component({
  selector: 'app-add-review-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, StarRatingComponent],
  templateUrl: './add-review-modal.component.html',
  styleUrl: './add-review-modal.component.scss'
})
export class AddReviewModalComponent {
  @Input() productId!: number;
  @Input() productTitle!: string;
  @Output() close = new EventEmitter<void>();
  @Output() reviewAdded = new EventEmitter<void>();

  private reviewService = inject(ReviewService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  rating = signal<number>(5);
  title = signal<string>('');
  comment = signal<string>('');
  isSubmitting = signal<boolean>(false);

  currentUser = this.authService.currentUser;

  onRatingChange(newRating: number): void {
    this.rating.set(newRating);
  }

  onSubmit(): void {
    if (this.rating() === 0) {
      this.notificationService.warning('Veuillez donner une note');
      return;
    }

    if (!this.comment().trim()) {
      this.notificationService.warning('Veuillez ajouter un commentaire');
      return;
    }

    const user = this.currentUser();
    if (!user) {
      this.notificationService.error('Vous devez être connecté pour laisser un avis');
      return;
    }

    this.isSubmitting.set(true);

    const review = {
      productId: this.productId,
      userId: user.id,
      rating: this.rating(),
      title: this.title(),
      comment: this.comment()
    };

    this.reviewService.createReview(review).subscribe({
      next: () => {
        this.notificationService.success('Votre avis a été publié avec succès ! ⭐');
        this.reviewAdded.emit();
        this.closeModal();
      },
      error: (err) => {
        console.error('Erreur création avis:', err);
        
        // Message spécifique si l'utilisateur a déjà laissé un avis
        if (err.error?.message?.includes('already reviewed')) {
          this.notificationService.error('Vous avez déjà laissé un avis pour ce produit');
        } else {
          this.notificationService.error('Erreur lors de la publication de votre avis');
        }
        
        this.isSubmitting.set(false);
      }
    });
  }

  closeModal(): void {
    this.close.emit();
  }
}
