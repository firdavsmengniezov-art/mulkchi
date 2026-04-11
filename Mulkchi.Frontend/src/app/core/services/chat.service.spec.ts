import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { ChatService, Message } from './chat.service';
import { LoggingService } from './logging.service';

describe('ChatService', () => {
  let service: ChatService;
  let httpMock: HttpTestingController;

  const hubCallbacks: Record<string, (...args: unknown[]) => void> = {};

  const hubConnectionMock = {
    state: 'Disconnected',
    on: jasmine
      .createSpy('on')
      .and.callFake((eventName: string, callback: (...args: unknown[]) => void) => {
        hubCallbacks[eventName] = callback;
      }),
    onreconnecting: jasmine.createSpy('onreconnecting'),
    onreconnected: jasmine.createSpy('onreconnected'),
    onclose: jasmine.createSpy('onclose'),
    invoke: jasmine.createSpy('invoke').and.returnValue(Promise.resolve()),
    start: jasmine.createSpy('start').and.returnValue(Promise.resolve()),
    stop: jasmine.createSpy('stop').and.returnValue(Promise.resolve()),
  } as any;

  const authServiceMock = {
    isAuthenticated: jasmine.createSpy('isAuthenticated').and.returnValue(true),
    getToken: jasmine.createSpy('getToken').and.returnValue('test-token'),
    getCurrentUser: jasmine.createSpy('getCurrentUser').and.returnValue({ id: 'me' }),
  } as any;

  const loggerMock = {
    warn: jasmine.createSpy('warn'),
    error: jasmine.createSpy('error'),
  } as any;

  beforeEach(() => {
    Object.keys(hubCallbacks).forEach((key) => delete hubCallbacks[key]);

    spyOn(HubConnectionBuilder.prototype as any, 'withUrl').and.callFake(function (this: unknown) {
      return this;
    });
    spyOn(HubConnectionBuilder.prototype as any, 'withAutomaticReconnect').and.callFake(function (
      this: unknown,
    ) {
      return this;
    });
    spyOn(HubConnectionBuilder.prototype as any, 'configureLogging').and.callFake(function (
      this: unknown,
    ) {
      return this;
    });
    spyOn(HubConnectionBuilder.prototype as any, 'build').and.returnValue(hubConnectionMock);

    TestBed.configureTestingModule({
      providers: [
        ChatService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceMock },
        { provide: LoggingService, useValue: loggerMock },
      ],
    });

    service = TestBed.inject(ChatService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('yaratilishi kerak', () => {
    expect(service).toBeTruthy();
  });

  it('uploadAttachment — multipart orqali fayl yuklashi kerak', () => {
    const file = new File(['test'], 'doc.txt', { type: 'text/plain' });

    service.uploadAttachment(file).subscribe((response) => {
      expect(response.fileUrl).toBe('/chat-attachments/file.txt');
      expect(response.fileName).toBe('doc.txt');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/messages/upload-attachment`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBeTrue();
    req.flush({
      fileUrl: '/chat-attachments/file.txt',
      fileName: 'doc.txt',
      fileSize: 4,
      contentType: 'text/plain',
    });
  });

  it('sendFileMessage — SignalR da SendFileMessage metodini chaqirishi kerak', async () => {
    await service.sendFileMessage('receiver-1', '/chat-attachments/file.pdf', 'file.pdf');

    expect(hubConnectionMock.invoke).toHaveBeenCalledWith(
      'SendFileMessage',
      'receiver-1',
      '/chat-attachments/file.pdf',
      'file.pdf',
    );
  });

  it('MessageRead event kelganda xabar holatini oqilgan qilib yangilashi kerak', () => {
    const collected: Message[][] = [];
    service.getMessages().subscribe((messages) => collected.push(messages));

    hubCallbacks['ReceiveMessage']?.({
      id: 'm-1',
      senderId: 'me',
      receiverId: 'other',
      content: 'Salom',
      type: 'Text',
      isRead: false,
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
    });

    hubCallbacks['MessageRead']?.({ messageId: 'm-1', readAt: '2026-01-01T10:00:00Z' });

    const latest = collected[collected.length - 1];
    expect(latest[0].isRead).toBeTrue();
    expect(latest[0].readAt).toBe('2026-01-01T10:00:00Z');
  });
});
