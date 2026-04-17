import { Injectable, signal } from '@angular/core';

/**
 * Progress Bar Service
 * Manages global loading progress indicator
 */
@Injectable({ providedIn: 'root' })
export class ProgressBarService {
  // Loading progress signal (0-100)
  private readonly _progress = signal<number>(0);
  // Whether progress bar is visible
  private readonly _isLoading = signal<boolean>(false);

  readonly progress = this._progress.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  private progressInterval: ReturnType<typeof setInterval> | null = null;

  /**
   * Start loading progress
   */
  startLoading(): void {
    this._isLoading.set(true);
    this._progress.set(0);

    // Simulate progress increasing
    this.progressInterval = setInterval(() => {
      this._progress.update(current => {
        if (current >= 90) {
          return current; // Hold at 90% until complete
        }
        // Random increment between 5-15%
        return Math.min(current + Math.random() * 10 + 5, 90);
      });
    }, 200);
  }

  /**
   * Complete loading progress
   */
  completeLoading(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }

    this._progress.set(100);

    // Hide after a short delay
    setTimeout(() => {
      this._isLoading.set(false);
      this._progress.set(0);
    }, 300);
  }

  /**
   * Reset progress without animation
   */
  reset(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
    this._isLoading.set(false);
    this._progress.set(0);
  }
}
