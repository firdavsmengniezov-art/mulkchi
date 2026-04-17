import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LoggingService } from '../services/logging.service';
import { ApiError, HttpErrorResponse as ApiHttpError } from '../models/api-response.model';

/**
 * Global Error Interceptor
 * Barcha HTTP xatoliklarini ushlaydi va foydalanuvchiga tushunarli xabarlar ko'rsatadi
 */
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private loggingService: LoggingService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = this.getErrorMessage(error);
        
        // Log error
        this.loggingService.error('HTTP Error:', {
          url: req.url,
          method: req.method,
          status: error.status,
          message: errorMessage,
          error: error.error,
        });

        // Show user-friendly error notification
        this.showErrorNotification(errorMessage, error.status);

        return throwError(() => this.transformError(error));
      })
    );
  }

  /**
   * HTTP status code asosida foydalanuvchiga tushunarli xabar yaratadi
   */
  private getErrorMessage(error: HttpErrorResponse): string {
    const status = error.status;
    const serverMessage = error.error?.message || error.error?.title;

    // Avval serverdan kelgan xabarni tekshirish
    if (serverMessage && typeof serverMessage === 'string') {
      return serverMessage;
    }

    // Standart xabarlar
    switch (status) {
      case 0:
        return 'Server bilan aloqa yo\'q. Internet ulanganligini tekshiring.';
      case 400:
        return 'So\'rov noto\'g\'ri formatda. Iltimos, ma\'lumotlarni tekshiring.';
      case 401:
        return 'Sessiya muddati tugagan. Iltimos, qayta kiring.';
      case 403:
        return 'Bu amalni bajarish uchun huquqingiz yetarli emas.';
      case 404:
        return 'So\'ralgan ma\'lumot topilmadi.';
      case 409:
        return 'Bu amalni bajarish mumkin emas. Ma\'lumotlar to\'qnashuvi.';
      case 422:
        return 'Kiritilgan ma\'lumotlar noto\'g\'ri. Iltimos, tekshiring.';
      case 429:
        return 'Juda ko\'p so\'rov yuborildi. Iltimos, biroz kuting.';
      case 500:
        return 'Serverda xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko\'ring.';
      case 502:
        return 'Server vaqtinchalik ishlamayapti. Iltimos, keyinroq urinib ko\'ring.';
      case 503:
        return 'Xizmat vaqtinchalik mavjud emas. Iltimos, keyinroq urinib ko\'ring.';
      default:
        if (status >= 500) {
          return 'Serverda kutilmagan xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko\'ring.';
        }
        return 'Kutilmagan xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.';
    }
  }

  /**
   * Xatolikni tizimli formatga o'tkazadi
   */
  private transformError(error: HttpErrorResponse): ApiHttpError {
    return {
      status: error.status,
      statusText: error.statusText,
      error: {
        message: this.getErrorMessage(error),
        errors: error.error?.errors || [],
        code: error.error?.code || `HTTP_${error.status}`,
      },
    };
  }

  /**
   * Foydalanuvchiga toast notification ko'rsatadi
   */
  private showErrorNotification(message: string, status: number): void {
    // Toast element yaratish
    const toast = document.createElement('div');
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');
    
    const bgColor = status >= 500 ? '#dc2626' : status === 401 ? '#f59e0b' : '#dc2626';
    const icon = status >= 500 ? '⚠️' : status === 401 ? '🔒' : '❌';
    
    toast.style.cssText = `
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: ${bgColor};
      color: white;
      padding: 1rem 1.25rem;
      border-radius: 0.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      font-size: 0.875rem;
      font-weight: 500;
      max-width: 400px;
      animation: slideIn 0.3s ease-out;
    `;

    toast.innerHTML = `
      <span style="font-size: 1.25rem;">${icon}</span>
      <span>${message}</span>
      <button 
        onclick="this.parentElement.remove()"
        style="
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          margin-left: 0.5rem;
        "
      >×</button>
    `;

    // Animation styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(toast);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      toast.style.animation = 'slideIn 0.3s ease-out reverse forwards';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 5000);
  }
}
