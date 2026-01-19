import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="star-rating" [class.interactive]="interactive">
      @for (star of [1, 2, 3, 4, 5]; track star) {
        <button
          *ngIf="interactive; else staticStar"
          type="button"
          class="star"
          [class.filled]="star <= (hoverRating || rating)"
          [class.half]="!hoverRating && star === Math.ceil(rating) && rating % 1 !== 0"
          (click)="onRate(star)"
          (mouseenter)="onHover(star)"
          (mouseleave)="onHover(0)">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
          </svg>
        </button>
        <ng-template #staticStar>
          <span 
            class="star"
            [class.filled]="star <= Math.floor(rating)"
            [class.half]="star === Math.ceil(rating) && rating % 1 !== 0">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
          </span>
        </ng-template>
      }
      @if (showCount && reviewCount !== undefined) {
        <span class="rating-count">({{ reviewCount }})</span>
      }
    </div>
  `,
  styles: [`
    .star-rating {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .star {
      width: 20px;
      height: 20px;
      color: #e5e7eb;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      justify-content: center;

      &.filled {
        color: #fbbf24;
      }

      &.half {
        position: relative;
        
        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 50%;
          height: 100%;
          overflow: hidden;
          color: #fbbf24;
        }
      }

      svg {
        width: 100%;
        height: 100%;
      }
    }

    .interactive {
      .star {
        border: none;
        background: none;
        padding: 0;
        cursor: pointer;

        &:hover {
          transform: scale(1.1);
        }
      }
    }

    .rating-count {
      margin-left: 4px;
      font-size: 14px;
      color: #6b7280;
    }
  `]
})
export class StarRatingComponent {
  @Input() rating: number = 0;
  @Input() interactive: boolean = false;
  @Input() showCount: boolean = false;
  @Input() reviewCount?: number;
  @Output() ratingChange = new EventEmitter<number>();

  hoverRating: number = 0;
  Math = Math;

  onRate(rating: number): void {
    if (this.interactive) {
      this.rating = rating;
      this.ratingChange.emit(rating);
    }
  }

  onHover(rating: number): void {
    if (this.interactive) {
      this.hoverRating = rating;
    }
  }
}
