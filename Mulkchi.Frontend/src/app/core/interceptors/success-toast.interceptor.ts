import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs';
import { UiToastService } from '../services/ui-toast.service';

/**
 * Success Toast Interceptor
 * Shows success messages for mutating operations (POST, PUT, DELETE)
 */
export const successToastInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(UiToastService);

  // Only show success toasts for mutating operations
  const isMutatingOperation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);

  // Skip auth endpoints and specific endpoints that handle their own success messages
  const skipEndpoints = [
    '/auth/login',
    '/auth/register',
    '/auth/refresh-token',
    '/auth/logout',
    '/favorites',  // Toggle operations show their own messages
    '/payments',   // Payment operations have custom flows
  ];

  const shouldSkip = skipEndpoints.some(endpoint => req.url.includes(endpoint));

  return next(req).pipe(
    tap({
      next: (response) => {
        if (isMutatingOperation && !shouldSkip) {
          const message = getSuccessMessage(req.method, req.url);
          toast.success(message);
        }
      },
    }),
  );
};

function getSuccessMessage(method: string, url: string): string {
  // Determine entity type from URL
  const entityType = getEntityTypeFromUrl(url);

  switch (method) {
    case 'POST':
      return `${entityType} muvaffaqiyatli yaratildi`;
    case 'PUT':
    case 'PATCH':
      return `${entityType} muvaffaqiyatli yangilandi`;
    case 'DELETE':
      return `${entityType} muvaffaqiyatli o'chirildi`;
    default:
      return 'Amal muvaffaqiyatli bajarildi';
  }
}

function getEntityTypeFromUrl(url: string): string {
  if (url.includes('/properties')) return 'Mulk';
  if (url.includes('/bookings')) return 'Bron';
  if (url.includes('/reviews')) return 'Sharh';
  if (url.includes('/messages')) return 'Xabar';
  if (url.includes('/users')) return 'Foydalanuvchi';
  if (url.includes('/announcements')) return 'E\'lon';
  if (url.includes('/discounts')) return 'Chegirma';
  if (url.includes('/savedsearches')) return 'Qidiruv';
  if (url.includes('/notifications')) return 'Bildirishnoma';
  if (url.includes('/rentalcontracts')) return 'Shartnoma';
  if (url.includes('/ai-recommendations')) return 'Tavsiya';
  if (url.includes('/propertyimages')) return 'Rasm';
  if (url.includes('/homerequests')) return 'So\'rov';
  return 'Ma\'lumot';
}
