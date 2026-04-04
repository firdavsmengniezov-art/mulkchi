import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SavedSearchService } from './saved-search.service';
import { environment } from '../../../environments/environment';
import { SavedSearch, CreateSavedSearchRequest } from '../models/saved-search.model';

describe('SavedSearchService', () => {
  let service: SavedSearchService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl;

  const mockSavedSearch: SavedSearch = {
    id: '1',
    name: 'Test Search',
    city: 'Toshkent',
    type: 'Apartment',
    listingType: 'Rent',
    minPrice: 5000000,
    maxPrice: 15000000,
    minArea: 50,
    maxArea: 100,
    minBedrooms: 2,
    isActive: true,
    notifyByEmail: true,
    notifyByPush: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  };

  const mockSavedSearches: SavedSearch[] = [mockSavedSearch];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SavedSearchService]
    });

    service = TestBed.inject(SavedSearchService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getSavedSearches', () => {
    it('should return saved searches with pagination', () => {
      // Arrange
      const expectedResponse = {
        success: true,
        message: 'Success',
        data: {
          items: mockSavedSearches,
          totalCount: 1,
          page: 1,
          pageSize: 10
        }
      };

      // Act
      service.getSavedSearches(1, 10).subscribe(response => {
        expect(response).toEqual(expectedResponse);
      });

      // Assert
      const req = httpMock.expectOne(`${apiUrl}/savedsearches?page=1&pageSize=10`);
      expect(req.request.method).toBe('GET');
      req.flush(expectedResponse);
    });

    it('should use default pagination parameters', () => {
      // Act
      service.getSavedSearches().subscribe();

      // Assert
      const req = httpMock.expectOne(`${apiUrl}/savedsearches?page=1&pageSize=10`);
      expect(req.request.method).toBe('GET');
    });
  });

  describe('getSavedSearchById', () => {
    it('should return saved search by ID', () => {
      // Arrange
      const expectedResponse = {
        success: true,
        message: 'Success',
        data: mockSavedSearch
      };

      // Act
      service.getSavedSearchById('1').subscribe(response => {
        expect(response).toEqual(expectedResponse);
      });

      // Assert
      const req = httpMock.expectOne(`${apiUrl}/savedsearches/1`);
      expect(req.request.method).toBe('GET');
      req.flush(expectedResponse);
    });
  });

  describe('createSavedSearch', () => {
    it('should create new saved search', () => {
      // Arrange
      const createRequest: CreateSavedSearchRequest = {
        name: 'New Search',
        city: 'Toshkent',
        type: 'Apartment',
        listingType: 'Rent'
      };

      const expectedResponse = {
        success: true,
        message: 'Created successfully',
        data: mockSavedSearch
      };

      // Act
      service.createSavedSearch(createRequest).subscribe(response => {
        expect(response).toEqual(expectedResponse);
      });

      // Assert
      const req = httpMock.expectOne(`${apiUrl}/savedsearches`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createRequest);
      req.flush(expectedResponse);
    });
  });

  describe('updateSavedSearch', () => {
    it('should update saved search', () => {
      // Arrange
      const updateRequest: CreateSavedSearchRequest = {
        name: 'Updated Search',
        city: 'Toshkent'
      };

      const expectedResponse = {
        success: true,
        message: 'Updated successfully',
        data: { ...mockSavedSearch, name: 'Updated Search' }
      };

      // Act
      service.updateSavedSearch('1', updateRequest).subscribe(response => {
        expect(response).toEqual(expectedResponse);
      });

      // Assert
      const req = httpMock.expectOne(`${apiUrl}/savedsearches/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateRequest);
      req.flush(expectedResponse);
    });
  });

  describe('toggleSavedSearch', () => {
    it('should toggle saved search status', () => {
      // Arrange
      const expectedResponse = {
        success: true,
        message: 'Toggled successfully',
        data: { ...mockSavedSearch, isActive: false }
      };

      // Act
      service.toggleSavedSearch('1').subscribe(response => {
        expect(response).toEqual(expectedResponse);
      });

      // Assert
      const req = httpMock.expectOne(`${apiUrl}/savedsearches/1/toggle`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({});
      req.flush(expectedResponse);
    });
  });

  describe('deleteSavedSearch', () => {
    it('should delete saved search', () => {
      // Arrange
      const expectedResponse = {
        success: true,
        message: 'Deleted successfully',
        data: mockSavedSearch
      };

      // Act
      service.deleteSavedSearch('1').subscribe(response => {
        expect(response).toEqual(expectedResponse);
      });

      // Assert
      const req = httpMock.expectOne(`${apiUrl}/savedsearches/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(expectedResponse);
    });
  });

  describe('utility methods', () => {
    describe('formatPropertyType', () => {
      it('should format property types correctly', () => {
        expect(service.formatPropertyType('Apartment')).toBe('Kvartira');
        expect(service.formatPropertyType('House')).toBe('Uy');
        expect(service.formatPropertyType('Villa')).toBe('Villa');
        expect(service.formatPropertyType('Room')).toBe('Xona');
        expect(service.formatPropertyType('Office')).toBe('Ofis');
        expect(service.formatPropertyType('Land')).toBe('Yer');
        expect(service.formatPropertyType('Commercial')).toBe('Tijorat');
        expect(service.formatPropertyType('')).toBe('Hammasi');
        expect(service.formatPropertyType(undefined)).toBe('Hammasi');
        expect(service.formatPropertyType('Unknown')).toBe('Unknown');
      });
    });

    describe('formatListingType', () => {
      it('should format listing types correctly', () => {
        expect(service.formatListingType('Rent')).toBe('Ijara');
        expect(service.formatListingType('Sale')).toBe('Sotuv');
        expect(service.formatListingType('ShortTermRent')).toBe('Kunlik ijara');
        expect(service.formatListingType('')).toBe('Hammasi');
        expect(service.formatListingType(undefined)).toBe('Hammasi');
        expect(service.formatListingType('Unknown')).toBe('Unknown');
      });
    });

    describe('formatPrice', () => {
      it('should format prices correctly', () => {
        expect(service.formatPrice(1000000)).toBe('1,000,000 so\'m');
        expect(service.formatPrice(50000000)).toBe('50,000,000 so\'m');
        expect(service.formatPrice(0)).toBe('0 so\'m');
        expect(service.formatPrice(null)).toBe('Narx belgilanmagan');
        expect(service.formatPrice(undefined)).toBe('Narx belgilanmagan');
      });
    });

    describe('formatArea', () => {
      it('should format areas correctly', () => {
        expect(service.formatArea(50)).toBe('50 m²');
        expect(service.formatArea(120.5)).toBe('120.5 m²');
        expect(service.formatArea(0)).toBe('0 m²');
        expect(service.formatArea(null)).toBe('Maydon belgilanmagan');
        expect(service.formatArea(undefined)).toBe('Maydon belgilanmagan');
      });
    });

    describe('getSearchSummary', () => {
      it('should generate search summary correctly', () => {
        const search: SavedSearch = {
          ...mockSavedSearch,
          city: 'Toshkent',
          type: 'Apartment',
          listingType: 'Rent',
          minPrice: 5000000,
          maxPrice: 15000000,
          minArea: 50,
          maxArea: 100,
          minBedrooms: 2
        };

        const summary = service.getSearchSummary(search);
        
        expect(summary).toContain('Shahar: Toshkent');
        expect(summary).toContain('Turi: Kvartira');
        expect(summary).toContain('Sotish turi: Ijara');
        expect(summary).toContain('Narx: 5,000,000 so\'m - 15,000,000 so\'m');
        expect(summary).toContain('Maydon: 50 m² - 100 m²');
        expect(summary).toContain('Eng kam xonalar: 2');
      });

      it('should handle empty search', () => {
        const emptySearch: SavedSearch = {
          id: '1',
          name: 'Empty Search',
          isActive: true,
          notifyByEmail: true,
          notifyByPush: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        };

        const summary = service.getSearchSummary(emptySearch);
        expect(summary).toBe('');
      });
    });

    describe('isActiveStatus', () => {
      it('should return correct status', () => {
        expect(service.isActiveStatus(true)).toBe('Faol');
        expect(service.isActiveStatus(false)).toBe('Faol emas');
      });
    });

    describe('getNotificationSettings', () => {
      it('should return notification settings correctly', () => {
        const search1: SavedSearch = {
          ...mockSavedSearch,
          notifyByEmail: true,
          notifyByPush: true
        };
        expect(service.getNotificationSettings(search1)).toBe('Email, Push');

        const search2: SavedSearch = {
          ...mockSavedSearch,
          notifyByEmail: true,
          notifyByPush: false
        };
        expect(service.getNotificationSettings(search2)).toBe('Email');

        const search3: SavedSearch = {
          ...mockSavedSearch,
          notifyByEmail: false,
          notifyByPush: true
        };
        expect(service.getNotificationSettings(search3)).toBe('Push');

        const search4: SavedSearch = {
          ...mockSavedSearch,
          notifyByEmail: false,
          notifyByPush: false
        };
        expect(service.getNotificationSettings(search4)).toBe('Bildirishlar o\'chirilgan');
      });
    });
  });
});
