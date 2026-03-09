import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:5009/api';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  get<T>(endpoint: string, useAuth: boolean = false): Observable<T> {
    const headers = useAuth ? this.getAuthHeaders() : undefined;
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, { headers });
  }

  post<T>(endpoint: string, body: any, useAuth: boolean = false): Observable<T> {
    const headers = useAuth ? this.getAuthHeaders() : undefined;
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, body, { headers });
  }

  put<T>(endpoint: string, body: any, useAuth: boolean = false): Observable<T> {
    const headers = useAuth ? this.getAuthHeaders() : undefined;
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, body, { headers });
  }

  delete<T>(endpoint: string, useAuth: boolean = false): Observable<T> {
    const headers = useAuth ? this.getAuthHeaders() : undefined;
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`, { headers });
  }

  postFile<T>(endpoint: string, formData: FormData, useAuth: boolean = false): Observable<T> {
    const headers = useAuth ? new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }) : undefined;
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, formData, { headers });
  }
}
