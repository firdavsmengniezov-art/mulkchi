import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Message } from '../models/message.models';
import { PagedResult } from '../models/property.models';

@Injectable({ providedIn: 'root' })
export class MessageService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/messages`;

  getAll(page = 1, pageSize = 20): Observable<PagedResult<Message>> {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<PagedResult<Message>>(this.baseUrl, { params });
  }

  getById(id: string): Observable<Message> {
    return this.http.get<Message>(`${this.baseUrl}/${id}`);
  }

  create(message: Partial<Message>): Observable<Message> {
    return this.http.post<Message>(this.baseUrl, message);
  }

  update(message: Message): Observable<Message> {
    return this.http.put<Message>(this.baseUrl, message);
  }

  delete(id: string): Observable<Message> {
    return this.http.delete<Message>(`${this.baseUrl}/${id}`);
  }
}
