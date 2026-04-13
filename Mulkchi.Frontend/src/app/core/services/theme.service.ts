import { Injectable, signal, effect, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'mulkchi-theme';
  private isBrowser: boolean;

  // Signals
  theme = signal<Theme>('system');
  isDark = signal<boolean>(false);

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);

    // Load saved theme
    if (this.isBrowser) {
      const savedTheme = localStorage.getItem(this.STORAGE_KEY) as Theme;
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        this.theme.set(savedTheme);
      }
    }

    // Update dark mode based on theme
    effect(() => {
      const currentTheme = this.theme();
      const isDarkMode = this.calculateIsDark(currentTheme);
      this.isDark.set(isDarkMode);

      if (this.isBrowser) {
        this.applyTheme(isDarkMode);
        localStorage.setItem(this.STORAGE_KEY, currentTheme);
      }
    });

    // Listen for system theme changes
    if (this.isBrowser && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', () => {
        if (this.theme() === 'system') {
          this.isDark.set(mediaQuery.matches);
          this.applyTheme(mediaQuery.matches);
        }
      });
    }
  }

  private calculateIsDark(theme: Theme): boolean {
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    
    // System preference
    if (this.isBrowser && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  }

  private applyTheme(isDark: boolean): void {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }

  setTheme(newTheme: Theme): void {
    this.theme.set(newTheme);
  }

  toggle(): void {
    const current = this.theme();
    if (current === 'dark') {
      this.setTheme('light');
    } else {
      this.setTheme('dark');
    }
  }

  isDarkMode(): boolean {
    return this.isDark();
  }
}
