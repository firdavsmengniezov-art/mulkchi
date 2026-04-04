import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly STORAGE_KEY = 'selectedLanguage';
  readonly languages = [
    { code: 'uz', label: "O'zbek", flag: '🇺🇿' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
    { code: 'en', label: 'English', flag: '🇬🇧' }
  ];

  constructor(private translate: TranslateService) {}

  init(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY) || 'uz';
    this.translate.setDefaultLang('uz');
    this.translate.use(saved);
  }

  setLanguage(code: string): void {
    this.translate.use(code);
    localStorage.setItem(this.STORAGE_KEY, code);
  }

  getCurrentLang(): string {
    return this.translate.currentLang || 'uz';
  }

  getCurrentLangObj() {
    const code = this.getCurrentLang();
    return this.languages.find(l => l.code === code) || this.languages[0];
  }
}
