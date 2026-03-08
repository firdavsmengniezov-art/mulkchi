import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagedResult } from '../models/property.models';
import { RentalContract } from '../models/rental-contract.models';

@Injectable({ providedIn: 'root' })
export class RentalContractService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/rentalcontracts`;

  getAll(page = 1, pageSize = 20): Observable<PagedResult<RentalContract>> {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<PagedResult<RentalContract>>(this.baseUrl, { params });
  }

  getById(id: string): Observable<RentalContract> {
    return this.http.get<RentalContract>(`${this.baseUrl}/${id}`);
  }

  create(contract: Partial<RentalContract>): Observable<RentalContract> {
    return this.http.post<RentalContract>(this.baseUrl, contract);
  }

  update(contract: RentalContract): Observable<RentalContract> {
    return this.http.put<RentalContract>(this.baseUrl, contract);
  }

  delete(id: string): Observable<RentalContract> {
    return this.http.delete<RentalContract>(`${this.baseUrl}/${id}`);
  }
}
