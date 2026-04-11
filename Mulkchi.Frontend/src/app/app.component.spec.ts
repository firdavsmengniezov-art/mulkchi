import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { AuthService } from './core/services/auth.service';
import { FavoriteService } from './core/services/favorite.service';
import { LanguageService } from './core/services/language.service';
import { LoggingService } from './core/services/logging.service';
import { NotificationService } from './core/services/notification.service';

describe('AppComponent', () => {
  const notificationServiceMock = {
    startConnection: jasmine.createSpy('startConnection'),
  };

  const authServiceMock = {
    currentUser$: { subscribe: () => ({ unsubscribe: () => {} }) },
    getToken: jasmine.createSpy('getToken').and.returnValue(null),
    refreshToken: jasmine.createSpy('refreshToken').and.returnValue({
      subscribe: () => ({ unsubscribe: () => {} }),
    }),
    clearAuth: jasmine.createSpy('clearAuth'),
  };

  const favoriteServiceMock = {
    loadUserFavorites: jasmine.createSpy('loadUserFavorites'),
  };

  const languageServiceMock = {
    init: jasmine.createSpy('init'),
  };

  const loggingServiceMock = {
    warn: jasmine.createSpy('warn'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, AppComponent],
      providers: [
        { provide: NotificationService, useValue: notificationServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: FavoriteService, useValue: favoriteServiceMock },
        { provide: LanguageService, useValue: languageServiceMock },
        { provide: LoggingService, useValue: loggingServiceMock },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render router outlet', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });
});
