import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SavedSearchService } from '../../../core/services/saved-search.service';
import { CreateSavedSearchRequest, SavedSearchResponse } from '../../../core/models/saved-search.model';

@Component({
  selector: 'app-saved-search-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="saved-search-form">
      <div class="form-header">
        <h2>{{ isEditing ? 'Qidiruvni tahrirlash' : 'Yangi qidiruv saqlash' }}</h2>
        <p>Mulk qidiruv parametrlarini kiriting va saqlang</p>
      </div>

      <form [formGroup]="searchForm" (ngSubmit)="onSubmit()">
        <!-- Search Name -->
        <div class="form-group">
          <label for="name">Qidiruv nomi *</label>
          <input 
            type="text" 
            id="name" 
            formControlName="name"
            class="form-control"
            placeholder="Mening Toshkent qidiruvim"
          >
          <div class="error" *ngIf="searchForm.get('name')?.invalid && searchForm.get('name')?.touched">
            Qidiruv nomi kiritilishi shart
          </div>
        </div>

        <!-- City -->
        <div class="form-group">
          <label for="city">Shahar</label>
          <input 
            type="text" 
            id="city" 
            formControlName="city"
            class="form-control"
            placeholder="Toshkent"
          >
        </div>

        <!-- Property Type -->
        <div class="form-group">
          <label for="type">Mulk turi</label>
          <select id="type" formControlName="type" class="form-control">
            <option value="">Hammasi</option>
            <option value="Apartment">Kvartira</option>
            <option value="House">Uy</option>
            <option value="Villa">Villa</option>
            <option value="Room">Xona</option>
            <option value="Office">Ofis</option>
            <option value="Land">Yer</option>
            <option value="Commercial">Tijorat</option>
          </select>
        </div>

        <!-- Listing Type -->
        <div class="form-group">
          <label for="listingType">Sotish turi</label>
          <select id="listingType" formControlName="listingType" class="form-control">
            <option value="">Hammasi</option>
            <option value="Rent">Ijara</option>
            <option value="Sale">Sotuv</option>
            <option value="ShortTermRent">Kunlik ijara</option>
          </select>
        </div>

        <!-- Price Range -->
        <div class="form-row">
          <div class="form-group">
            <label for="minPrice">Eng arzon narx</label>
            <input 
              type="number" 
              id="minPrice" 
              formControlName="minPrice"
              class="form-control"
              placeholder="0"
              min="0"
            >
          </div>
          <div class="form-group">
            <label for="maxPrice">Eng qimmat narx</label>
            <input 
              type="number" 
              id="maxPrice" 
              formControlName="maxPrice"
              class="form-control"
              placeholder="100000000"
              min="0"
            >
          </div>
        </div>

        <!-- Area Range -->
        <div class="form-row">
          <div class="form-group">
            <label for="minArea">Eng kichik maydon</label>
            <input 
              type="number" 
              id="minArea" 
              formControlName="minArea"
              class="form-control"
              placeholder="20"
              min="0"
            >
          </div>
          <div class="form-group">
            <label for="maxArea">Eng katta maydon</label>
            <input 
              type="number" 
              id="maxArea" 
              formControlName="maxArea"
              class="form-control"
              placeholder="500"
              min="0"
            >
          </div>
        </div>

        <!-- Minimum Bedrooms -->
        <div class="form-group">
          <label for="minBedrooms">Eng kam xonalar</label>
          <input 
            type="number" 
            id="minBedrooms" 
            formControlName="minBedrooms"
            class="form-control"
            placeholder="1"
            min="1"
            max="20"
          >
        </div>

        <!-- Notification Settings -->
        <div class="form-section">
          <h3>Bildirish sozlamalari</h3>
          <div class="checkbox-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                formControlName="notifyByEmail"
                class="checkbox-input"
              >
              <span class="checkmark"></span>
              Email orqali bildirish
            </label>
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                formControlName="notifyByPush"
                class="checkbox-input"
              >
              <span class="checkmark"></span>
              Push bildirish
            </label>
          </div>
        </div>

        <!-- Active Status -->
        <div class="form-group">
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              formControlName="isActive"
              class="checkbox-input"
            >
            <span class="checkmark"></span>
            Faol qidiruv
          </label>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <button 
            type="submit" 
            class="btn btn-primary"
            [disabled]="searchForm.invalid || isLoading">
            {{ isLoading ? 'Saqlanmoqda...' : (isEditing ? 'Yangilash' : 'Saqlash') }}
          </button>
          
          <button 
            type="button" 
            class="btn btn-secondary"
            (click)="onCancel()"
            [disabled]="isLoading">
            Bekor qilish
          </button>
        </div>
      </form>

      <!-- Success/Error Messages -->
      <div class="alert alert-success" *ngIf="successMessage">
        {{ successMessage }}
      </div>
      
      <div class="alert alert-error" *ngIf="errorMessage">
        {{ errorMessage }}
      </div>
    </div>
  `,
  styleUrls: ['./saved-search-form.component.scss']
})
export class SavedSearchFormComponent implements OnInit {
  searchForm!: FormGroup;
  isEditing = false;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private savedSearchService: SavedSearchService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.searchForm = this.fb.group({
      id: [null],
      name: ['', [Validators.required]],
      city: [''],
      type: [''],
      listingType: [''],
      minPrice: [null],
      maxPrice: [null],
      minArea: [null],
      maxArea: [null],
      minBedrooms: [null],
      notifyByEmail: [true],
      notifyByPush: [true],
      isActive: [true]
    });
  }

  onSubmit(): void {
    if (this.searchForm.invalid) {
      this.markFormAsTouched();
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const savedSearchRequest: CreateSavedSearchRequest = this.searchForm.value;

    if (this.isEditing && this.searchForm.value.id) {
      // Update existing search
      this.savedSearchService.updateSavedSearch(this.searchForm.value.id, savedSearchRequest).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = 'Qidiruv muvaffaqiyatli yangilandi!';
            this.resetForm();
          }
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Qidiruvni yangilashda xatolik yuz berdi.';
        }
      });
    } else {
      // Create new search
      this.savedSearchService.createSavedSearch(savedSearchRequest).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = 'Qidiruv muvaffaqiyatli saqlandi!';
            this.resetForm();
          }
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Qidiruvni saqlashda xatolik yuz berdi.';
        }
      });
    }

    this.isLoading = false;
  }

  onCancel(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.searchForm.reset({
      id: null,
      name: '',
      city: '',
      type: '',
      listingType: '',
      minPrice: null,
      maxPrice: null,
      minArea: null,
      maxArea: null,
      minBedrooms: null,
      notifyByEmail: true,
      notifyByPush: true,
      isActive: true
    });
    
    this.successMessage = '';
    this.errorMessage = '';
    this.isEditing = false;
  }

  private markFormAsTouched(): void {
    Object.values(this.searchForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  // Method to set form for editing
  setEditData(search: any): void {
    this.isEditing = true;
    this.searchForm.patchValue({
      id: search.id,
      name: search.name,
      city: search.city,
      type: search.type,
      listingType: search.listingType,
      minPrice: search.minPrice,
      maxPrice: search.maxPrice,
      minArea: search.minArea,
      maxArea: search.maxArea,
      minBedrooms: search.minBedrooms,
      notifyByEmail: search.notifyByEmail,
      notifyByPush: search.notifyByPush,
      isActive: search.isActive
    });
  }
}
