import {
  ChangeDetectorRef,
  inject,
  OnDestroy,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../core/services/language.service';

@Pipe({ name: 'translate', standalone: true, pure: false })
export class TranslatePipe implements PipeTransform, OnDestroy {
  private readonly langService = inject(LanguageService);
  private readonly cdr = inject(ChangeDetectorRef);
  private sub: Subscription;

  constructor() {
    this.sub = this.langService.currentLang$.subscribe(() =>
      this.cdr.markForCheck(),
    );
  }

  transform(key: string): string {
    return this.langService.t(key);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
