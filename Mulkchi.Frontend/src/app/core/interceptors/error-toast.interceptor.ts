import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { UiToastService } from '../services/ui-toast.service';

function toMessage(error: HttpErrorResponse): string {
  const apiMessage = error.error?.message || error.error?.title;

  if (typeof apiMessage === 'string' && apiMessage.trim()) {
    return apiMessage;
  }

  switch (error.status) {
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
      if (error.status >= 500) {
        return 'Serverda kutilmagan xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko\'ring.';
      }
      return 'Kutilmagan xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.';
  }
}

export const errorToastInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(UiToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Skip auth endpoints to avoid duplicated messages with local component handlers.
      const isAuthRequest =
        req.url.includes('/auth/login') ||
        req.url.includes('/auth/register') ||
        req.url.includes('/auth/refresh-token') ||
        req.url.includes('/auth/logout');

      if (!isAuthRequest) {
        toast.error(toMessage(error));
      }

      return throwError(() => error);
    }),
  );
};
