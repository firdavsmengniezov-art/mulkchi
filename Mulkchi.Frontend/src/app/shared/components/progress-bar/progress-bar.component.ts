import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { ProgressBarService } from '../../../core/services/progress-bar.service';

/**
 * Global Progress Bar Component
 * Shows loading indicator during route navigation
 */
@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule],
  template: `
    @if (progressService.isLoading()) {
      <div class="progress-bar-container fixed top-0 left-0 right-0 z-[9999]">
        <mat-progress-bar
          mode="determinate"
          [value]="progressService.progress()"
          class="progress-bar"
          color="accent">
        </mat-progress-bar>
      </div>
    }
  `,
  styles: [`
    .progress-bar-container {
      pointer-events: none;
    }

    .progress-bar {
      height: 3px;
      transition: opacity 0.3s ease;
    }

    ::ng-deep .progress-bar .mat-progress-bar-fill::after {
      background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
    }
  `]
})
export class ProgressBarComponent {
  protected progressService = inject(ProgressBarService);
  private router = inject(Router);

  constructor() {
    this.setupRouterEvents();
  }

  private setupRouterEvents(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.progressService.startLoading();
      }

      if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.progressService.completeLoading();
      }
    });
  }
}
