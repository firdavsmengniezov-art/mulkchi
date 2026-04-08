import { HttpClient, HttpEventType, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoggingService } from './logging.service';

import {
  CreatePropertyImageRequest,
  PropertyImage,
  PropertyImageUploadRequest,
  UpdatePropertyImageRequest,
} from '../models/property-image.model';

@Injectable({
  providedIn: 'root',
})
export class PropertyImageService {
  private readonly apiUrl = `${environment.apiUrl}/property-images`;

  constructor(private http: HttpClient,
    private logger: LoggingService) {}

  // Basic CRUD operations
  getPropertyImages(propertyId: string): Observable<PropertyImage[]> {
    return this.http
      .get<PropertyImage[]>(`${this.apiUrl}?propertyId=${propertyId}`)
      .pipe(catchError(this.handleError));
  }

  getPropertyImageById(id: string): Observable<PropertyImage> {
    return this.http.get<PropertyImage>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError));
  }

  createPropertyImage(request: CreatePropertyImageRequest): Observable<PropertyImage> {
    return this.http.post<PropertyImage>(this.apiUrl, request).pipe(catchError(this.handleError));
  }

  updatePropertyImage(request: UpdatePropertyImageRequest): Observable<PropertyImage> {
    return this.http.put<PropertyImage>(this.apiUrl, request).pipe(catchError(this.handleError));
  }

  deletePropertyImage(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError));
  }

  // File upload with progress tracking
  uploadPropertyImages(
    request: PropertyImageUploadRequest,
  ): Observable<{ progress: number; images?: PropertyImage[] }> {
    const formData = new FormData();

    // Add files
    request.files.forEach((file, index) => {
      formData.append('files', file);

      // Add metadata if provided
      if (request.imageTitles && request.imageTitles[index]) {
        formData.append(`imageTitles[${index}]`, request.imageTitles[index]);
      }
      if (request.imageDescriptions && request.imageDescriptions[index]) {
        formData.append(`imageDescriptions[${index}]`, request.imageDescriptions[index]);
      }
    });

    formData.append('propertyId', request.propertyId);

    const uploadReq = new HttpRequest(
      'POST',
      `${environment.apiUrl}/property-images-upload`,
      formData,
      {
        reportProgress: true,
      },
    );

    return this.http.request(uploadReq).pipe(
      map((event) => {
        if (event.type === HttpEventType.UploadProgress) {
          const progress = Math.round((100 * event.loaded) / event.total!);
          return { progress };
        } else if (event.type === HttpEventType.Response) {
          return { progress: 100, images: event.body as PropertyImage[] };
        }
        return { progress: 0 };
      }),
      catchError(this.handleError),
    );
  }

  // Utility methods
  setPrimaryImage(imageId: string): Observable<PropertyImage> {
    return this.updatePropertyImage({
      id: imageId,
      isPrimary: true,
    });
  }

  reorderImages(imageOrders: { id: string; displayOrder: number }[]): Observable<PropertyImage[]> {
    return this.http
      .put<PropertyImage[]>(`${this.apiUrl}/reorder`, imageOrders)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any): Observable<never> {
    this.logger.error('PropertyImageService error:', error);
    let errorMessage = 'An error occurred with property images';

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 413) {
      errorMessage = 'File size too large. Please select smaller images.';
    } else if (error.status === 415) {
      errorMessage = 'Invalid file type. Please select image files.';
    }

    return throwError(() => errorMessage);
  }
}
