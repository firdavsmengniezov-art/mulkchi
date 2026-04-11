import { convertToParamMap } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { ChatAttachmentUploadResponse, Message } from '../../../core/services/chat.service';
import { ChatComponent } from './chat.component';

describe('ChatComponent', () => {
  const routeParamMap$ = new BehaviorSubject(convertToParamMap({}));
  const currentUser$ = new BehaviorSubject<{ id: string } | null>({ id: 'me' });
  const connectionStatus$ = new BehaviorSubject<boolean>(true);
  const conversations$ = new BehaviorSubject<any[]>([]);
  const messages$ = new BehaviorSubject<Message[]>([]);
  const typing$ = new BehaviorSubject<any[]>([]);

  const chatServiceMock = {
    startConnection: jasmine.createSpy('startConnection'),
    loadConversations: jasmine.createSpy('loadConversations'),
    setCurrentConversation: jasmine.createSpy('setCurrentConversation'),
    loadConversationMessages: jasmine.createSpy('loadConversationMessages'),
    markAsRead: jasmine.createSpy('markAsRead'),
    sendMessage: jasmine.createSpy('sendMessage').and.returnValue(Promise.resolve()),
    sendTypingIndicator: jasmine
      .createSpy('sendTypingIndicator')
      .and.returnValue(Promise.resolve()),
    uploadAttachment: jasmine.createSpy('uploadAttachment').and.returnValue(
      of<ChatAttachmentUploadResponse>({
        fileUrl: '/chat-attachments/test.pdf',
        fileName: 'test.pdf',
        fileSize: 123,
        contentType: 'application/pdf',
      }),
    ),
    sendFileMessage: jasmine.createSpy('sendFileMessage').and.returnValue(Promise.resolve()),
    getConnectionStatus: jasmine
      .createSpy('getConnectionStatus')
      .and.returnValue(connectionStatus$.asObservable()),
    getConversations: jasmine
      .createSpy('getConversations')
      .and.returnValue(conversations$.asObservable()),
    getMessages: jasmine.createSpy('getMessages').and.returnValue(messages$.asObservable()),
    getTypingIndicators: jasmine
      .createSpy('getTypingIndicators')
      .and.returnValue(typing$.asObservable()),
  } as any;

  const authServiceMock = {
    currentUser$,
  } as any;

  const loggerMock = {
    error: jasmine.createSpy('error'),
  } as any;

  const activatedRouteMock = {
    paramMap: routeParamMap$.asObservable(),
  } as any;

  let component: ChatComponent;

  beforeEach(() => {
    chatServiceMock.markAsRead.calls.reset();
    chatServiceMock.sendMessage.calls.reset();
    chatServiceMock.sendFileMessage.calls.reset();
    chatServiceMock.uploadAttachment.calls.reset();

    component = new ChatComponent(chatServiceMock, authServiceMock, activatedRouteMock, loggerMock);
  });

  it('attachment tanlanganda upload qilib file xabar yuborishi kerak', async () => {
    component.selectedConversation = {
      otherUserId: 'user-2',
      otherUserName: 'Ali',
      lastMessage: '',
      lastMessageDate: new Date().toISOString(),
      unreadCount: 0,
    };

    component.newMessage = '';
    (component as any).selectedAttachmentFile = new File(['pdf'], 'test.pdf', {
      type: 'application/pdf',
    });
    component.selectedAttachmentName = 'test.pdf';

    await component.sendMessage();

    expect(chatServiceMock.uploadAttachment).toHaveBeenCalled();
    expect(chatServiceMock.sendFileMessage).toHaveBeenCalledWith(
      'user-2',
      '/chat-attachments/test.pdf',
      'test.pdf',
    );
    expect(component.selectedAttachmentName).toBeNull();
  });

  it("ochiq suhbatdagi kelgan o'qilmagan xabarlarni markAsRead qilishi kerak", () => {
    component.ngOnInit();
    component.selectedConversation = {
      otherUserId: 'user-2',
      otherUserName: 'Ali',
      lastMessage: '',
      lastMessageDate: new Date().toISOString(),
      unreadCount: 0,
    };

    messages$.next([
      {
        id: 'm-1',
        senderId: 'user-2',
        receiverId: 'me',
        content: 'Salom',
        type: 'Text',
        isRead: false,
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
      },
    ]);

    expect(chatServiceMock.markAsRead).toHaveBeenCalledWith('m-1');

    component.ngOnDestroy();
  });
});
