import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AIPriceRequest {
  region: string;
  propertyType: string;
  area: number;
  rooms: number;
  floor: number;
  listingType: 'Sale' | 'Rent';
}

export interface AIPriceResponse {
  recommendedPrice: number;
  minPrice: number;
  maxPrice: number;
  currency: string;
  marketAverage: number;
  comparisonPercentage: number;
  comparisonMessage: string;
  confidence: number;
  regionalData?: {
    region: string;
    averagePrice: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class AIService {
  private readonly apiUrl = `${environment.apiUrl}/ai-recommendations`;

  // Signals for state management
  private readonly _priceResult = signal<AIPriceResponse | null>(null);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // Public readonly signals
  readonly priceResult = () => this._priceResult();
  readonly loading = () => this._loading();
  readonly error = () => this._error();

  constructor(private http: HttpClient) {}

  predictPrice(request: AIPriceRequest): Observable<AIPriceResponse> {
    this._loading.set(true);
    this._error.set(null);

    // Map frontend model to backend model
    const backendRequest = {
      region: request.region,
      propertyType: request.propertyType,
      area: request.area,
      rooms: request.rooms,
      floor: request.floor,
      listingType: request.listingType
    };

    return this.http.post<AIPriceResponse>(`${this.apiUrl}/ai-recommendations/predict-price`, backendRequest).pipe(
      tap(result => {
        this._priceResult.set(result);
        this._loading.set(false);
      }),
      catchError(error => {
        this._loading.set(false);
        // Specific error messages based on HTTP status
        if (error.status === 404) {
          this._error.set('AI xizmati hozircha mavjud emas, tez orada ishga tushiriladi');
        } else if (error.status === 401) {
          this._error.set('Iltimos, tizimga kiring');
        } else {
          this._error.set('Xatolik yuz berdi, qayta urinib ko\'ring');
        }
        return throwError(() => error);
      })
    );
  }

  clearResult(): void {
    this._priceResult.set(null);
    this._error.set(null);
  }
}
