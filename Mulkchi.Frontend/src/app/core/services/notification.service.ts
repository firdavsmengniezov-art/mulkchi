import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Notification, PagedResult } from '../models';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;
  
  constructor(private http: HttpClient) {}

  getNotifications(): Observable<PagedResult<Notification>> { 
    return this.http.get<PagedResult<Notification>>(this.apiUrl); 
  }

  markAsRead(id: string): Observable<any> { 
    return this.http.put(`${this.apiUrl}/${id}`, {}); 
  }
}
