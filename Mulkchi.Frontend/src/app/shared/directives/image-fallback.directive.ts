import { Directive, ElementRef, HostListener, Input, OnInit, Renderer2 } from '@angular/core';

/**
 * Image Fallback Directive
 * Rasm yuklanmasa (404) yoki xatolik yuz bersa, avtomatik placeholder rasm ko'rsatadi
 * 
 * Usage:
 * ```html
 * <img [src]="user.avatar" [appImageFallback]="'assets/placeholder-avatar.png'">
 * <img [src]="property.image" [appImageFallback]="'assets/placeholder-property.jpg'">
 * <img [src]="item.image" appImageFallback> <!-- Default placeholder ishlatiladi -->
 * ```
 */
@Directive({
  selector: '[appImageFallback]',
  standalone: true
})
export class ImageFallbackDirective implements OnInit {
  @Input('appImageFallback') fallbackUrl: string | undefined;
  @Input() placeholderType: 'avatar' | 'property' | 'general' = 'general';

  private readonly DEFAULT_PLACEHOLDERS = {
    avatar: 'assets/placeholders/avatar.svg',
    property: 'assets/placeholders/property.svg',
    general: 'assets/placeholders/general.svg'
  };

  private readonly FALLBACK_BG_COLORS = {
    avatar: 'bg-gradient-to-br from-blue-100 to-indigo-100',
    property: 'bg-gradient-to-br from-gray-100 to-slate-200',
    general: 'bg-gradient-to-br from-gray-50 to-gray-100'
  };

  private hasError = false;

  constructor(
    private el: ElementRef<HTMLImageElement>,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    // Set loading state
    this.renderer.addClass(this.el.nativeElement, 'image-loading');
    
    // Add error event listener if not already added via HostListener
    this.el.nativeElement.onerror = () => this.handleError();
    
    // Add load event listener
    this.el.nativeElement.onload = () => this.handleLoad();
  }

  @HostListener('error')
  onError(): void {
    this.handleError();
  }

  private handleError(): void {
    if (this.hasError) return; // Prevent infinite loop
    
    this.hasError = true;
    const img = this.el.nativeElement;
    
    // Get appropriate fallback URL
    const fallbackSrc = this.fallbackUrl || this.DEFAULT_PLACEHOLDERS[this.placeholderType];
    
    // If already using fallback, show placeholder div instead
    if (img.src?.includes(fallbackSrc)) {
      this.showPlaceholderDiv();
      return;
    }
    
    // Try fallback image
    this.renderer.removeClass(img, 'image-loading');
    this.renderer.addClass(img, 'image-error');
    
    // Set fallback image
    this.renderer.setAttribute(img, 'src', fallbackSrc);
    
    // Add visual feedback
    this.renderer.addClass(img, 'opacity-50');
    this.renderer.setStyle(img, 'backgroundColor', '#f3f4f6');
  }

  private handleLoad(): void {
    this.renderer.removeClass(this.el.nativeElement, 'image-loading');
    this.renderer.addClass(this.el.nativeElement, 'image-loaded');
  }

  private showPlaceholderDiv(): void {
    const img = this.el.nativeElement;
    const parent = img.parentElement;
    
    if (!parent) return;

    // Create placeholder div
    const placeholder = this.renderer.createElement('div');
    const bgClass = this.FALLBACK_BG_COLORS[this.placeholderType];
    
    this.renderer.addClass(placeholder, bgClass);
    this.renderer.addClass(placeholder, 'flex');
    this.renderer.addClass(placeholder, 'items-center');
    this.renderer.addClass(placeholder, 'justify-center');
    this.renderer.setStyle(placeholder, 'width', '100%');
    this.renderer.setStyle(placeholder, 'height', '100%');
    this.renderer.setStyle(placeholder, 'minHeight', '150px');
    this.renderer.setStyle(placeholder, 'borderRadius', 'inherit');
    
    // Add icon or text
    const iconSpan = this.renderer.createElement('span');
    iconSpan.textContent = this.getPlaceholderIcon();
    this.renderer.setStyle(iconSpan, 'fontSize', '2rem');
    this.renderer.setStyle(iconSpan, 'opacity', '0.5');
    
    this.renderer.appendChild(placeholder, iconSpan);
    
    // Hide broken image
    this.renderer.setStyle(img, 'display', 'none');
    
    // Insert placeholder before image
    this.renderer.insertBefore(parent, placeholder, img);
  }

  private getPlaceholderIcon(): string {
    switch (this.placeholderType) {
      case 'avatar':
        return '👤';
      case 'property':
        return '🏠';
      default:
        return '🖼️';
    }
  }

  /**
   * Manually trigger fallback (for programmatic use)
   */
  showFallback(): void {
    this.handleError();
  }
}
