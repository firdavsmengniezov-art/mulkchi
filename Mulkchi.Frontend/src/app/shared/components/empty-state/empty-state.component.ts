import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/**
 * Empty State Types
 */
export type EmptyStateType =
  | 'messages'
  | 'notifications'
  | 'properties'
  | 'bookings'
  | 'favorites'
  | 'search'
  | 'payments'
  | 'reviews'
  | 'users'
  | 'error'
  | 'custom';

/**
 * Empty State Configuration
 */
export interface EmptyStateConfig {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  showAction?: boolean;
}

/**
 * Predefined empty state configurations
 */
const EMPTY_STATE_CONFIGS: Record<EmptyStateType, EmptyStateConfig> = {
  messages: {
    icon: 'chat_bubble_outline',
    title: 'Hali xabarlar yo\'q',
    description: 'Suhbatlaringiz shu yerda paydo bo\'ladi',
    actionLabel: 'Mulk qidirish',
    showAction: true
  },
  notifications: {
    icon: 'notifications_none',
    title: 'Bildirishnomalar yo\'q',
    description: 'Yangi bildirishnomalar kelganda shu yerda ko\'rinadi',
    showAction: false
  },
  properties: {
    icon: 'home_outlined',
    title: 'Mulklar topilmadi',
    description: 'Filtrlarni o\'zgartiring yoki boshqa qidiruv so\'zini kiriting',
    actionLabel: 'Filtrlarni tozalash',
    showAction: true
  },
  bookings: {
    icon: 'calendar_today',
    title: 'Bronlar yo\'q',
    description: 'Siz hali hech qanday mulk bron qilmagansiz',
    actionLabel: 'Mulk qidirish',
    showAction: true
  },
  favorites: {
    icon: 'favorite_border',
    title: 'Sevimlilar bo\'sh',
    description: 'Yoqqan mulklaringizni saqlab qo\'ying',
    actionLabel: 'Mulk ko\'rish',
    showAction: true
  },
  search: {
    icon: 'search',
    title: 'Natijalar topilmadi',
    description: 'Boshqa qidiruv so\'zini kiriting yoki filtrlarni o\'zgartiring',
    actionLabel: 'Qidiruvni tozalash',
    showAction: true
  },
  payments: {
    icon: 'payment',
    title: 'To\'lovlar yo\'q',
    description: 'Siz hali hech qanday to\'lov amalga oshirmagansiz',
    showAction: false
  },
  reviews: {
    icon: 'rate_review',
    title: 'Sharhlar yo\'q',
    description: 'Siz hali hech qanday sharh qoldirmagansiz',
    actionLabel: 'Mulk ko\'rish',
    showAction: true
  },
  users: {
    icon: 'people_outline',
    title: 'Foydalanuvchilar yo\'q',
    description: 'Hech qanday foydalanuvchi topilmadi',
    showAction: false
  },
  error: {
    icon: 'error_outline',
    title: 'Xatolik yuz berdi',
    description: 'Ma\'lumotlarni yuklashda muammo yuz berdi',
    actionLabel: 'Qayta yuklash',
    showAction: true
  },
  custom: {
    title: 'Ma\'lumotlar yo\'q',
    showAction: false
  }
};

/**
 * Empty State Component
 * Shows a friendly message when there's no data to display
 */
@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="empty-state flex flex-col items-center justify-center py-16 px-4 text-center">
      <!-- Icon -->
      @if (icon()) {
        <div class="icon-container mb-6">
          <mat-icon class="empty-icon text-6xl w-24 h-24 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-500">
            {{ icon() }}
          </mat-icon>
        </div>
      }

      <!-- Title -->
      <h3 class="text-xl font-bold text-gray-800 mb-2">
        {{ title() }}
      </h3>

      <!-- Description -->
      @if (description()) {
        <p class="text-gray-500 max-w-md mb-6">
          {{ description() }}
        </p>
      }

      <!-- Action Button -->
      @if (showAction() && actionLabel()) {
        <button
          mat-raised-button
          color="primary"
          class="rounded-full px-6"
          (click)="onActionClick()">
          {{ actionLabel() }}
        </button>
      }
    </div>
  `,
  styles: [`
    .empty-state {
      min-height: 300px;
    }

    .icon-container {
      animation: float 3s ease-in-out infinite;
    }

    .empty-icon {
      font-size: 48px;
      line-height: 1;
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-10px);
      }
    }
  `]
})
export class EmptyStateComponent {
  // Inputs
  type = input<EmptyStateType>('custom');
  customIcon = input<string>('');
  customTitle = input<string>('');
  customDescription = input<string>('');
  customActionLabel = input<string>('');
  showAction = input<boolean>(true);

  // Outputs
  actionClick = output<void>();

  // Computed values based on type
  icon = () => this.customIcon() || EMPTY_STATE_CONFIGS[this.type()].icon;
  title = () => this.customTitle() || EMPTY_STATE_CONFIGS[this.type()].title;
  description = () => this.customDescription() || EMPTY_STATE_CONFIGS[this.type()].description;
  actionLabel = () => this.customActionLabel() || EMPTY_STATE_CONFIGS[this.type()].actionLabel;

  onActionClick(): void {
    this.actionClick.emit();
  }
}
