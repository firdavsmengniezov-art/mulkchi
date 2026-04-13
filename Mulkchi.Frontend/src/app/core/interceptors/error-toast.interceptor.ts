import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { UiToastService } from '../services/ui-toast.service';

function toMessage(error: HttpErrorResponse): string {
  const apiMessage = error.error?.message || error.error?.title;

  if (typeof apiMessage === 'string' && apiMessage.trim()) {
    return apiMessage;
  }

  if (error.status === 0) {
    return 'Server bilan ulanishda muammo. Internet yoki backend holatini tekshiring.';
  }

  if (error.status >= 500) {
    return "Serverda xatolik yuz berdi. Keyinroq qayta urinib ko'ring.";
  }

  if (error.status === 404) {
    return "So'ralgan resurs topilmadi.";
  }

  if (error.status === 403) {
    return "Bu amal uchun ruxsat yo'q.";
  }

  return "So'rovni bajarishda xatolik yuz berdi.";
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
