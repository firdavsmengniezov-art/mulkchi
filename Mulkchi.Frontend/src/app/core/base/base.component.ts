import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Base Component
 * Barcha komponentlar uchun bazaviy klass.
 * Avtomatik unsubscription va boshqa utility metodlarni taqdim etadi.
 * 
 * Usage:
 * ```typescript
 * export class MyComponent extends BaseComponent implements OnInit {
 *   ngOnInit() {
 *     this.service.getData()
 *       .pipe(takeUntil(this.destroy$))
 *       .subscribe(data => this.data = data);
 *   }
 * }
 * ```
 */
@Component({ template: '' })
export abstract class BaseComponent implements OnDestroy {
  /**
   * Unsubscription uchun Subject
   * Komponent o'chirilganda barcha subscription'larni tozalaydi
   */
  protected destroy$ = new Subject<void>();

  /**
   * Komponent o'chirilganda chaqiriladi
   * Barcha subscription'larni tozalaydi
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
