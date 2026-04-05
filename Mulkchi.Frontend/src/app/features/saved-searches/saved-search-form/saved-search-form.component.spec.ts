import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { SavedSearchFormComponent } from './saved-search-form.component';
import { SavedSearchService } from '../../../core/services/saved-search.service';
import { of, throwError } from 'rxjs';
import { CreateSavedSearchRequest } from '../../../core/models/saved-search.model';

describe('SavedSearchFormComponent', () => {
  let component: SavedSearchFormComponent;
  let fixture: ComponentFixture<SavedSearchFormComponent>;
  let savedSearchServiceSpy: jasmine.SpyObj<SavedSearchService>;
  let formBuilder: FormBuilder;

  const mockSavedSearch = {
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

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('SavedSearchService', [
      'createSavedSearch',
      'updateSavedSearch'
    ]);

    spy.createSavedSearch.and.returnValue(of({
      success: true,
      message: 'Created successfully',
      data: mockSavedSearch
    }));

    spy.updateSavedSearch.and.returnValue(of({
      success: true,
      message: 'Updated successfully',
      data: mockSavedSearch
    }));

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        SavedSearchFormComponent
      ],
      providers: [
        FormBuilder,
        { provide: SavedSearchService, useValue: spy }
      ]
    }).compileComponents();

    savedSearchServiceSpy = TestBed.inject(SavedSearchService) as jasmine.SpyObj<SavedSearchService>;
    formBuilder = TestBed.inject(FormBuilder);
    fixture = TestBed.createComponent(SavedSearchFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize form with default values', () => {
      // Act
      component.ngOnInit();

      // Assert
      expect(component.searchForm).toBeDefined();
      expect(component.searchForm.value.name).toBe('');
      expect(component.searchForm.value.notifyByEmail).toBe(true);
      expect(component.searchForm.value.notifyByPush).toBe(true);
      expect(component.searchForm.value.isActive).toBe(true);
    });
  });

  describe('form validation', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should be invalid when name is empty', () => {
      // Act
      component.searchForm.patchValue({ name: '' });
      fixture.detectChanges();

      // Assert
      expect(component.searchForm.invalid).toBe(true);
      expect(component.searchForm.get('name')?.invalid).toBe(true);
    });

    it('should be valid when name is provided', () => {
      // Act
      component.searchForm.patchValue({ name: 'Test Search' });
      fixture.detectChanges();

      // Assert
      expect(component.searchForm.valid).toBe(true);
      expect(component.searchForm.get('name')?.valid).toBe(true);
    });

    it('should mark all controls as touched on invalid submit', () => {
      // Arrange
      spyOn<any>(component, 'markFormAsTouched');

      // Act
      component.onSubmit();

      // Assert
      expect((component as any).markFormAsTouched).toHaveBeenCalled();
    });
  });

  describe('onSubmit', () => {
    beforeEach(() => {
      component.ngOnInit();
      component.searchForm.patchValue({
        name: 'Test Search',
        city: 'Toshkent',
        type: 'Apartment',
        listingType: 'Rent',
        minPrice: 5000000,
        maxPrice: 15000000,
        minArea: 50,
        maxArea: 100,
        minBedrooms: 2,
        notifyByEmail: true,
        notifyByPush: true,
        isActive: true
      });
    });

    it('should create new saved search', fakeAsync(() => {
      // Arrange
      savedSearchServiceSpy.createSavedSearch.and.returnValue(of({
        success: true,
        message: 'Created successfully',
        data: mockSavedSearch
      }));
      spyOn<any>(component, 'resetForm');

      // Act
      component.onSubmit();
      tick();
      fixture.detectChanges();

      // Assert
      expect(savedSearchServiceSpy.createSavedSearch).toHaveBeenCalled();
      expect(component.successMessage).toBe('Qidiruv muvaffaqiyatli saqlandi!');
      expect((component as any).resetForm).toHaveBeenCalled();
      expect(component.isLoading).toBe(false);
    }));

    it('should update existing saved search', fakeAsync(() => {
      // Arrange
      component.isEditing = true;
      component.searchForm.patchValue({ id: '1' });
      savedSearchServiceSpy.updateSavedSearch.and.returnValue(of({
        success: true,
        message: 'Updated successfully',
        data: mockSavedSearch
      }));
      spyOn<any>(component, 'resetForm');

      // Act
      component.onSubmit();
      tick();
      fixture.detectChanges();

      // Assert
      expect(savedSearchServiceSpy.updateSavedSearch).toHaveBeenCalledWith('1', component.searchForm.value);
      expect(component.successMessage).toBe('Qidiruv muvaffaqiyatli yangilandi!');
      expect((component as any).resetForm).toHaveBeenCalled();
    }));

    it('should handle error when creating saved search', () => {
      // Arrange
      savedSearchServiceSpy.createSavedSearch.and.returnValue(throwError({
        error: { message: 'Creation failed' }
      }));

      // Act
      component.onSubmit();

      // Assert
      expect(component.errorMessage).toBe('Creation failed');
      expect(component.isLoading).toBe(false);
    });

    it('should handle error when updating saved search', () => {
      // Arrange
      component.isEditing = true;
      component.searchForm.patchValue({ id: '1' });
      savedSearchServiceSpy.updateSavedSearch.and.returnValue(throwError({
        error: { message: 'Update failed' }
      }));

      // Act
      component.onSubmit();

      // Assert
      expect(component.errorMessage).toBe('Update failed');
      expect(component.isLoading).toBe(false);
    });
  });

  describe('onCancel', () => {
    it('should reset form when cancel is clicked', () => {
      component.ngOnInit();
      component.successMessage = 'Previous success';
      component.errorMessage = 'Previous error';
      component.isEditing = true;
      spyOn<any>(component, 'resetForm');

      // Act
      component.onCancel();

      // Assert
      expect((component as any).resetForm).toHaveBeenCalled();
    });
  });

  describe('resetForm', () => {
    it('should reset form values and state', () => {
      component.ngOnInit();
      component.searchForm.patchValue({
        name: 'Modified',
        city: 'Modified',
        notifyByEmail: false,
        notifyByPush: false,
        isActive: false
      });
      component.successMessage = 'Success';
      component.errorMessage = 'Error';
      component.isEditing = true;

      // Act
      (component as any).resetForm();

      // Assert
      expect(component.searchForm.value.name).toBe('');
      expect(component.searchForm.value.city).toBe('');
      expect(component.searchForm.value.notifyByEmail).toBe(true);
      expect(component.searchForm.value.notifyByPush).toBe(true);
      expect(component.searchForm.value.isActive).toBe(true);
      expect(component.successMessage).toBe('');
      expect(component.errorMessage).toBe('');
      expect(component.isEditing).toBe(false);
    });
  });

  describe('setEditData', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should set form for editing', () => {
      // Act
      component.setEditData(mockSavedSearch);

      // Assert
      expect(component.isEditing).toBe(true);
      expect(component.searchForm.value.name).toBe(mockSavedSearch.name);
      expect(component.searchForm.value.city).toBe(mockSavedSearch.city);
      expect(component.searchForm.value.type).toBe(mockSavedSearch.type);
      expect(component.searchForm.value.listingType).toBe(mockSavedSearch.listingType);
      expect(component.searchForm.value.minPrice).toBe(mockSavedSearch.minPrice);
      expect(component.searchForm.value.maxPrice).toBe(mockSavedSearch.maxPrice);
      expect(component.searchForm.value.minArea).toBe(mockSavedSearch.minArea);
      expect(component.searchForm.value.maxArea).toBe(mockSavedSearch.maxArea);
      expect(component.searchForm.value.minBedrooms).toBe(mockSavedSearch.minBedrooms);
      expect(component.searchForm.value.notifyByEmail).toBe(mockSavedSearch.notifyByEmail);
      expect(component.searchForm.value.notifyByPush).toBe(mockSavedSearch.notifyByPush);
      expect(component.searchForm.value.isActive).toBe(mockSavedSearch.isActive);
    });
  });

  describe('markFormAsTouched', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should mark all form controls as touched', () => {
      // Act
      (component as any).markFormAsTouched();

      // Assert
      expect(component.searchForm.touched).toBe(true);
      Object.keys(component.searchForm.controls).forEach(key => {
        const control = component.searchForm.get(key);
        expect(control?.touched).toBe(true);
      });
    });
  });

  describe('form field values', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should allow empty optional fields', () => {
      // Act
      component.searchForm.patchValue({
        name: 'Test Search',
        city: '',
        type: '',
        listingType: '',
        minPrice: null,
        maxPrice: null,
        minArea: null,
        maxArea: null,
        minBedrooms: null
      });

      // Assert
      expect(component.searchForm.valid).toBe(true);
    });

    it('should handle numeric fields correctly', () => {
      // Act
      component.searchForm.patchValue({
        name: 'Test Search',
        minPrice: 1000000,
        maxPrice: 5000000,
        minArea: 30,
        maxArea: 120,
        minBedrooms: 1
      });

      // Assert
      expect(component.searchForm.value.minPrice).toBe(1000000);
      expect(component.searchForm.value.maxPrice).toBe(5000000);
      expect(component.searchForm.value.minArea).toBe(30);
      expect(component.searchForm.value.maxArea).toBe(120);
      expect(component.searchForm.value.minBedrooms).toBe(1);
    });
  });
});
