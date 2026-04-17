import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageFallbackDirective } from '../../directives/image-fallback.directive';

/**
 * Safe Avatar Component
 * SignalR xatolari va 404 rasmlarni xavfsiz ko'rsatadi
 * 
 * Usage:
 * ```html
 * <app-safe-avatar [src]="user.avatarUrl" [name]="user.name" size="md"></app-safe-avatar>
 * ```
 */
@Component({
  selector: 'app-safe-avatar',
  standalone: true,
  imports: [CommonModule, ImageFallbackDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div 
      class="avatar-container overflow-hidden rounded-full flex items-center justify-center"
      [class]="sizeClasses"
      [style.backgroundColor]="!hasValidSrc() ? generateColor(name) : 'transparent'"
    >
      @if (hasValidSrc()) {
        <img 
          [src]="src" 
          [alt]="name || 'Avatar'"
          class="w-full h-full object-cover"
          appImageFallback="assets/placeholders/avatar.svg"
          placeholderType="avatar"
          (error)="onImageError()"
        />
      } @else {
        <span class="text-white font-semibold select-none" [class]="textSizeClasses">
          {{ getInitials() }}
        </span>
      }
    </div>
  `,
  styles: [`
    .avatar-container {
      transition: all 0.2s ease-in-out;
    }
    .avatar-container:hover {
      transform: scale(1.05);
    }
  `]
})
export class SafeAvatarComponent {
  @Input() src: string | null | undefined;
  @Input() name: string | null | undefined;
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';

  private imageError = false;

  private readonly sizeClassMap: Record<string, string> = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20'
  };

  private readonly textSizeClassMap: Record<string, string> = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-2xl'
  };

  get sizeClasses(): string {
    return this.sizeClassMap[this.size] || this.sizeClassMap['md'];
  }

  get textSizeClasses(): string {
    return this.textSizeClassMap[this.size] || this.textSizeClassMap['md'];
  }

  hasValidSrc(): boolean {
    return !!this.src && !this.imageError && this.src !== '';
  }

  onImageError(): void {
    this.imageError = true;
  }

  getInitials(): string {
    if (!this.name || typeof this.name !== 'string') {
      return '?';
    }
    
    const parts = this.name.trim().split(/\s+/);
    if (parts.length === 0) return '?';
    
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  generateColor(name: string | null | undefined): string {
    if (!name) return '#6366f1';
    
    const colors = [
      '#6366f1', // Indigo
      '#8b5cf6', // Violet
      '#ec4899', // Pink
      '#f43f5e', // Rose
      '#10b981', // Emerald
      '#14b8a6', // Teal
      '#3b82f6', // Blue
      '#f59e0b', // Amber
      '#ef4444', // Red
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  }
}
