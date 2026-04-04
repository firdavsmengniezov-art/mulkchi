import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { SavedSearchListComponent } from './saved-search-list.component';
import { SavedSearchService } from '../../../core/services/saved-search.service';
import { of, throwError } from 'rxjs';
import { SavedSearch } from '../../../core/models/saved-search.model';

describe('SavedSearchListComponent', () => {
  let component: SavedSearchListComponent;
  let fixture: ComponentFixture<SavedSearchListComponent>;
  let savedSearchServiceSpy: jasmine.SpyObj<SavedSearchService>;

  const mockSavedSearches: SavedSearch[] = [
    {
      id: '1',
      name: 'Toshkent kvartiralari',
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
    },
    {
      id: '2',
      name: 'Samarqand uylari',
      city: 'Samarqand',
      type: 'House',
      listingType: 'Sale',
      minPrice: 100000000,
      maxPrice: 500000000,
      isActive: false,
      notifyByEmail: false,
      notifyByPush: true,
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z'
    }
  ];

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('SavedSearchService', [
      'getSavedSearches',
      'deleteSavedSearch',
      'toggleSavedSearch',
      'getSearchSummary',
      'isActiveStatus',
      'getNotificationSettings'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        RouterTestingModule,
        SavedSearchListComponent
      ],
      providers: [
        { provide: SavedSearchService, useValue: spy }
      ]
    }).compileComponents();

    savedSearchServiceSpy = TestBed.inject(SavedSearchService) as jasmine.SpyObj<SavedSearchService>;
    fixture = TestBed.createComponent(SavedSearchListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load saved searches on init', () => {
      // Arrange
      savedSearchServiceSpy.getSavedSearches.and.returnValue(of({
        success: true,
        message: 'Success',
        data: {
          items: mockSavedSearches,
          totalCount: 2,
          page: 1,
          pageSize: 10
        }
      }));

      // Act
      component.ngOnInit();
      fixture.detectChanges();

      // Assert
      expect(component.savedSearches).toEqual(mockSavedSearches);
      expect(component.totalCount).toBe(2);
      expect(component.totalPages).toBe(1);
      expect(component.isLoading).toBe(false);
    });

    it('should handle error when loading saved searches', () => {
      // Arrange
      savedSearchServiceSpy.getSavedSearches.and.returnValue(throwError('Error'));
      spyOn(console, 'error');

      // Act
      component.ngOnInit();
      fixture.detectChanges();

      // Assert
      expect(component.savedSearches).toEqual([]);
      expect(component.isLoading).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Error loading saved searches:', 'Error');
    });
  });

  describe('loadSavedSearches', () => {
    it('should load saved searches with pagination', () => {
      // Arrange
      savedSearchServiceSpy.getSavedSearches.and.returnValue(of({
        success: true,
        message: 'Success',
        data: {
          items: mockSavedSearches,
          totalCount: 25,
          page: 2,
          pageSize: 10
        }
      }));

      component.currentPage = 2;

      // Act
      component.loadSavedSearches();

      // Assert
      expect(savedSearchServiceSpy.getSavedSearches).toHaveBeenCalledWith(2, 10);
      expect(component.totalCount).toBe(25);
      expect(component.totalPages).toBe(3);
    });
  });

  describe('pagination', () => {
    beforeEach(() => {
      component.totalPages = 3;
      component.totalCount = 25;
      component.pageSize = 10;
    });

    it('should go to previous page', () => {
      // Arrange
      component.currentPage = 2;
      spyOn(component, 'loadSavedSearches');

      // Act
      component.previousPage();

      // Assert
      expect(component.currentPage).toBe(1);
      expect(component.loadSavedSearches).toHaveBeenCalled();
    });

    it('should not go to previous page if on first page', () => {
      // Arrange
      component.currentPage = 1;
      spyOn(component, 'loadSavedSearches');

      // Act
      component.previousPage();

      // Assert
      expect(component.currentPage).toBe(1);
      expect(component.loadSavedSearches).not.toHaveBeenCalled();
    });

    it('should go to next page', () => {
      // Arrange
      component.currentPage = 1;
      spyOn(component, 'loadSavedSearches');

      // Act
      component.nextPage();

      // Assert
      expect(component.currentPage).toBe(2);
      expect(component.loadSavedSearches).toHaveBeenCalled();
    });

    it('should not go to next page if on last page', () => {
      // Arrange
      component.currentPage = 3;
      spyOn(component, 'loadSavedSearches');

      // Act
      component.nextPage();

      // Assert
      expect(component.currentPage).toBe(3);
      expect(component.loadSavedSearches).not.toHaveBeenCalled();
    });
  });

  describe('deleteSearch', () => {
    beforeEach(() => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(component, 'loadSavedSearches');
    });

    it('should delete saved search when confirmed', () => {
      // Arrange
      savedSearchServiceSpy.deleteSavedSearch.and.returnValue(of({
        success: true,
        message: 'Deleted successfully'
      }));

      // Act
      component.deleteSearch('1');

      // Assert
      expect(window.confirm).toHaveBeenCalledWith('Bu qidiruvni o\'chirmoqchimisiz?');
      expect(savedSearchServiceSpy.deleteSavedSearch).toHaveBeenCalledWith('1');
      expect(component.loadSavedSearches).toHaveBeenCalled();
    });

    it('should not delete when cancelled', () => {
      // Arrange
      (window.confirm as jasmine.Spy).and.returnValue(false);
      savedSearchServiceSpy.deleteSavedSearch.and.returnValue(of({ success: true }));

      // Act
      component.deleteSearch('1');

      // Assert
      expect(savedSearchServiceSpy.deleteSavedSearch).not.toHaveBeenCalled();
      expect(component.loadSavedSearches).not.toHaveBeenCalled();
    });
  });

  describe('toggleSearch', () => {
    beforeEach(() => {
      component.savedSearches = mockSavedSearches;
    });

    it('should toggle saved search status', () => {
      // Arrange
      const event = { target: { checked: true } };
      savedSearchServiceSpy.toggleSavedSearch.and.returnValue(of({
        success: true,
        data: { ...mockSavedSearches[0], isActive: true }
      }));

      // Act
      component.toggleSearch('1', event);

      // Assert
      expect(savedSearchServiceSpy.toggleSavedSearch).toHaveBeenCalledWith('1');
      expect(mockSavedSearches[0].isActive).toBe(true);
    });

    it('should handle error when toggling', () => {
      // Arrange
      const event = { target: { checked: true } };
      savedSearchServiceSpy.toggleSavedSearch.and.returnValue(throwError('Error'));
      spyOn(console, 'error');

      // Act
      component.toggleSearch('1', event);

      // Assert
      expect(console.error).toHaveBeenCalledWith('Error toggling saved search:', 'Error');
    });
  });

  describe('utility methods', () => {
    beforeEach(() => {
      component.savedSearches = mockSavedSearches;
    });

    it('should format date correctly', () => {
      // Act
      const result = component.formatDate('2024-01-01T00:00:00Z');

      // Assert
      expect(result).toContain('2024');
    });

    it('should get search summary from service', () => {
      // Arrange
      savedSearchServiceSpy.getSearchSummary.and.returnValue('Test summary');

      // Act
      const result = component.getSearchSummary(mockSavedSearches[0]);

      // Assert
      expect(result).toBe('Test summary');
      expect(savedSearchServiceSpy.getSearchSummary).toHaveBeenCalledWith(mockSavedSearches[0]);
    });

    it('should get active status from service', () => {
      // Arrange
      savedSearchServiceSpy.isActiveStatus.and.returnValue('Faol');

      // Act
      const result = component.isActiveStatus(true);

      // Assert
      expect(result).toBe('Faol');
      expect(savedSearchServiceSpy.isActiveStatus).toHaveBeenCalledWith(true);
    });

    it('should get notification settings from service', () => {
      // Arrange
      savedSearchServiceSpy.getNotificationSettings.and.returnValue('Email, Push');

      // Act
      const result = component.getNotificationSettings(mockSavedSearches[0]);

      // Assert
      expect(result).toBe('Email, Push');
      expect(savedSearchServiceSpy.getNotificationSettings).toHaveBeenCalledWith(mockSavedSearches[0]);
    });
  });
});
