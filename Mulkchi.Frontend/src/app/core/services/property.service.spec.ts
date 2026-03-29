import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { PropertyService } from './property.service';
import { environment } from '../../../environments/environment';

describe('PropertyService', () => {
  let service: PropertyService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PropertyService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(PropertyService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('yaratilishi kerak', () => {
    expect(service).toBeTruthy();
  });

  it('getProperties — GET so\'rov yuborishi kerak', () => {
    const mockProperties = {
      success: true,
      data: [
        { id: '1', title: 'Test kvartira', city: 'Toshkent' }
      ]
    };

    service.getProperties({}).subscribe(res => {
      expect(res.data.length).toBe(1);
      expect(res.data[0].city).toBe('Toshkent');
    });

    const req = httpMock.expectOne(
      `${environment.apiUrl}/properties`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProperties);
  });

  it('getPropertyById — to\'g\'ri URL ga so\'rov yuborishi kerak', () => {
    const id = 'test-id-123';

    service.getPropertyById(id).subscribe();

    const req = httpMock.expectOne(
      `${environment.apiUrl}/properties/${id}`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: {} });
  });
});
