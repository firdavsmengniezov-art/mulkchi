import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoggingService } from './logging.service';

import { 
  RentalContract, 
  CreateRentalContractRequest,
  UpdateRentalContractRequest,
  ContractStatus 
} from '../models/rental-contract.model';

@Injectable({
  providedIn: 'root'
})
export class RentalContractService {
  private readonly apiUrl = `${environment.apiUrl}/rental-contracts`;

  constructor(private http: HttpClient,
    private logger: LoggingService) {}

  // Contract CRUD operations
  getContracts(page = 1, pageSize = 10, status?: string): Observable<{ items: RentalContract[]; totalCount: number; page: number; pageSize: number }> {
    let url = `${this.apiUrl}?page=${page}&pageSize=${pageSize}`;
    if (status) url += `&status=${status}`;
    
    return this.http.get<any>(url).pipe(
      catchError(this.handleError)
    );
  }

  getContractById(id: string): Observable<RentalContract> {
    return this.http.get<RentalContract>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createContract(request: CreateRentalContractRequest): Observable<RentalContract> {
    return this.http.post<RentalContract>(this.apiUrl, request).pipe(
      catchError(this.handleError)
    );
  }

  updateContract(request: UpdateRentalContractRequest): Observable<RentalContract> {
    return this.http.put<RentalContract>(this.apiUrl, request).pipe(
      catchError(this.handleError)
    );
  }

  deleteContract(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Contract operations by booking
  getContractByBookingId(bookingId: string): Observable<RentalContract> {
    return this.http.get<RentalContract>(`${this.apiUrl}/by-booking/${bookingId}`).pipe(
      catchError(this.handleError)
    );
  }

  createContractFromBooking(bookingId: string, request: CreateRentalContractRequest): Observable<RentalContract> {
    return this.http.post<RentalContract>(`${this.apiUrl}/from-booking/${bookingId}`, request).pipe(
      catchError(this.handleError)
    );
  }

  // User-specific contracts
  getMyContracts(status?: string): Observable<RentalContract[]> {
    let url = `${this.apiUrl}/my`;
    if (status) url += `?status=${status}`;
    
    return this.http.get<RentalContract[]>(url).pipe(
      catchError(this.handleError)
    );
  }

  getContractsByUserId(userId: string): Observable<RentalContract[]> {
    return this.http.get<RentalContract[]>(`${this.apiUrl}/by-user/${userId}`).pipe(
      catchError(this.handleError)
    );
  }

  // Contract signing
  signContract(contractId: string): Observable<RentalContract> {
    return this.http.post<RentalContract>(`${this.apiUrl}/${contractId}/sign`, {}).pipe(
      catchError(this.handleError)
    );
  }

  // Contract status management
  updateContractStatus(contractId: string, status: ContractStatus): Observable<RentalContract> {
    return this.http.patch<RentalContract>(`${this.apiUrl}/${contractId}/status`, { status }).pipe(
      catchError(this.handleError)
    );
  }

  terminateContract(contractId: string, reason: string): Observable<RentalContract> {
    return this.http.post<RentalContract>(`${this.apiUrl}/${contractId}/terminate`, { reason }).pipe(
      catchError(this.handleError)
    );
  }

  // Document operations
  generateContractPDF(contractId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${contractId}/pdf`, { responseType: 'blob' }).pipe(
      catchError(this.handleError)
    );
  }

  downloadContractPDF(contractId: string, filename?: string): void {
    this.generateContractPDF(contractId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || `contract-${contractId}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.logger.error('Error downloading contract PDF:', err);
        alert('Failed to download contract PDF');
      }
    });
  }

  // Contract templates
  getContractTemplates(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/templates`).pipe(
      catchError(this.handleError)
    );
  }

  // Utility methods
  generateContractNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `RC-${year}${month}-${random}`;
  }

  calculateContractDuration(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isContractActive(contract: RentalContract): boolean {
    const now = new Date();
    const start = new Date(contract.startDate);
    const end = new Date(contract.endDate);
    return contract.status === ContractStatus.Active && now >= start && now <= end;
  }

  isContractExpired(contract: RentalContract): boolean {
    return new Date() > new Date(contract.endDate);
  }

  canUserViewContract(contract: RentalContract, userId: string, userRole: string): boolean {
    // Admin can view all contracts
    if (userRole === 'Admin') return true;
    
    // Tenant and Landlord can view their own contracts
    return contract.tenantId === userId || contract.landlordId === userId;
  }

  canUserSignContract(contract: RentalContract, userId: string): boolean {
    // Only tenant and landlord can sign
    if (contract.tenantId !== userId && contract.landlordId !== userId) return false;
    
    // Can't sign if already signed
    if (contract.tenantId === userId && contract.tenantSignedAt) return false;
    if (contract.landlordId === userId && contract.landlordSignedAt) return false;
    
    // Can only sign pending contracts
    return contract.status === ContractStatus.PendingSignature;
  }

  // Formatting helpers
  formatCurrency(amount: number, currency: string = 'UZS'): string {
    return `${currency} ${amount.toLocaleString('uz-UZ')}`;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getStatusBadgeColor(status: ContractStatus): string {
    switch (status) {
      case ContractStatus.Draft:
        return 'bg-gray-100 text-gray-800';
      case ContractStatus.PendingSignature:
        return 'bg-yellow-100 text-yellow-800';
      case ContractStatus.Active:
        return 'bg-green-100 text-green-800';
      case ContractStatus.Expired:
        return 'bg-red-100 text-red-800';
      case ContractStatus.Terminated:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  private handleError = (error: any): Observable<never> => {
    this.logger.error('RentalContractService error:', error);
    let errorMessage = 'An error occurred with rental contracts';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 403) {
      errorMessage = 'You do not have permission to access this contract';
    } else if (error.status === 404) {
      errorMessage = 'Contract not found';
    }
    
    return throwError(() => errorMessage);
  }
}
