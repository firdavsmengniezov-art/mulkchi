import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Message, PagedResult } from '../models';

@Injectable({ providedIn: 'root' })
export class MessageService {
  private apiUrl = `${environment.apiUrl}/messages`;
  
  constructor(private http: HttpClient) {}

  getMessages(): Observable<PagedResult<Message>> { 
    return this.http.get<PagedResult<Message>>(this.apiUrl); 
  }

  sendMessage(receiverId: string, content: string, propertyId?: string): Observable<Message> {
    return this.http.post<Message>(this.apiUrl, { receiverId, content, propertyId });
  }
}
