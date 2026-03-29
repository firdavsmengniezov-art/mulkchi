import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LoggingService {

  log(message: string, data?: unknown): void {
    if (!environment.production) {
      console.log(`[Mulkchi] ${message}`, data ?? '');
    }
  }

  error(message: string, error?: unknown): void {
    if (!environment.production) {
      console.error(`[Mulkchi ERROR] ${message}`, error ?? '');
    }
    // Production da bu yerga Sentry yoki boshqa tool
  }

  warn(message: string, data?: unknown): void {
    if (!environment.production) {
      console.warn(`[Mulkchi WARN] ${message}`, data ?? '');
    }
  }

  info(message: string, data?: unknown): void {
    if (!environment.production) {
      console.info(`[Mulkchi INFO] ${message}`, data ?? '');
    }
  }

  debug(message: string, data?: unknown): void {
    if (!environment.production) {
      console.debug(`[Mulkchi DEBUG] ${message}`, data ?? '');
    }
  }
}
