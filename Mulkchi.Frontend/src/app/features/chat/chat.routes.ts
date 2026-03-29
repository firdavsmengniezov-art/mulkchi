import { Routes } from '@angular/router';
import { ChatComponent } from './chat/chat.component';
import { authGuard } from '../../core/guards/auth.guard';

export const CHAT_ROUTES: Routes = [
  {
    path: 'chat',
    component: ChatComponent,
    canActivate: [authGuard]
  },
  {
    path: 'chat/:userId',
    component: ChatComponent,
    canActivate: [authGuard]
  }
];
