import { Directive, ElementRef, HostListener, Input } from '@angular/core';

/**
 * Directive pour gérer les erreurs de chargement d'images
 * Usage: <img [src]="imageUrl" appImageFallback>
 * ou avec URL personnalisée: <img [src]="imageUrl" appImageFallback="/assets/custom-fallback.svg">
 */
@Directive({
  selector: 'img[appImageFallback]',
  standalone: true
})
export class ImageFallbackDirective {
  @Input() appImageFallback = '/assets/placeholder.svg';
  
  private hasError = false;

  constructor(private el: ElementRef<HTMLImageElement>) {}

  @HostListener('error')
  onError(): void {
    if (!this.hasError) {
      this.hasError = true;
      const img = this.el.nativeElement;
      img.src = this.appImageFallback;
    }
  }

  @HostListener('load')
  onLoad(): void {
    // Réinitialiser le flag si l'image se charge avec succès
    this.hasError = false;
  }
}
