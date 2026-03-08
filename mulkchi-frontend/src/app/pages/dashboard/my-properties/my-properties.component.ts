import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PropertyService } from '../../../core/services/property.service';
import { AuthService } from '../../../core/services/auth.service';
import { Property } from '../../../core/models/property.models';

@Component({
  selector: 'app-my-properties',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSnackBarModule],
  template: `
    <div class="my-properties-page">
      <div class="page-header">
        <h1>Mulklarim</h1>
        <button class="btn-gold" (click)="openForm()">+ Yangi mulk</button>
      </div>

      <!-- Add/Edit Form -->
      <div class="form-panel card-dark" *ngIf="showForm">
        <h3>{{ editingProperty ? 'Mulkni tahrirlash' : 'Yangi mulk qo\'shish' }}</h3>
        <form [formGroup]="propertyForm" (ngSubmit)="onSubmit()">
          <div class="form-grid">
            <div class="form-group">
              <label>Sarlavha</label>
              <input type="text" formControlName="title" placeholder="Mulk sarlavhasi">
            </div>
            <div class="form-group">
              <label>Shahar</label>
              <input type="text" formControlName="city" placeholder="Shahar">
            </div>
            <div class="form-group">
              <label>Manzil</label>
              <input type="text" formControlName="address" placeholder="To'liq manzil">
            </div>
            <div class="form-group">
              <label>Narx (UZS)</label>
              <input type="number" formControlName="price" placeholder="Narx">
            </div>
            <div class="form-group">
              <label>Maydon (m²)</label>
              <input type="number" formControlName="area" placeholder="Maydon">
            </div>
            <div class="form-group">
              <label>Xonalar</label>
              <input type="number" formControlName="numberOfBedrooms" placeholder="Xonalar soni" min="1">
            </div>
            <div class="form-group">
              <label>Hammomlar</label>
              <input type="number" formControlName="numberOfBathrooms" placeholder="Hammomlar soni" min="1">
            </div>
          </div>

          <div class="form-group full-width">
            <label>Tavsif</label>
            <textarea formControlName="description" placeholder="Mulk haqida tavsif" rows="3"></textarea>
          </div>

          <div class="listing-type-section">
            <label>E'lon turi</label>
            <div class="toggle-group">
              <button type="button" class="toggle-btn"
                [class.active]="propertyForm.get('listingType')?.value === 'Rent'"
                (click)="propertyForm.patchValue({listingType: 'Rent'})">
                Ijara
              </button>
              <button type="button" class="toggle-btn"
                [class.active]="propertyForm.get('listingType')?.value === 'Sale'"
                (click)="propertyForm.patchValue({listingType: 'Sale'})">
                Sotish
              </button>
            </div>
          </div>

          <div class="checkboxes">
            <label class="checkbox-label">
              <input type="checkbox" formControlName="petsAllowed"> Uy hayvonlari ruxsat
            </label>
            <label class="checkbox-label">
              <input type="checkbox" formControlName="isVacant"> Bo'sh
            </label>
            <label class="checkbox-label">
              <input type="checkbox" formControlName="hasWifi"> Wi-Fi bor
            </label>
            <label class="checkbox-label">
              <input type="checkbox" formControlName="hasParking"> Avtoturargoh
            </label>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-ghost" (click)="cancelForm()">Bekor qilish</button>
            <button type="submit" class="btn-gold" [disabled]="isLoading">
              {{ isLoading ? 'Saqlanmoqda...' : (editingProperty ? 'Saqlash' : 'Qo\'shish') }}
            </button>
          </div>
        </form>
      </div>

      <!-- Properties List -->
      <div class="properties-list">
        <p class="empty-state" *ngIf="properties.length === 0 && !isLoading">
          Hali mulk qo'shilmagan. "+ Yangi mulk" tugmasini bosing.
        </p>

        <div class="property-item card-dark" *ngFor="let prop of properties">
          <div class="prop-info">
            <h3>{{ prop.title }}</h3>
            <p>📍 {{ prop.city }} · {{ prop.area }} m² · {{ prop.numberOfBedrooms }} xona</p>
            <p class="prop-price">{{ getPropPrice(prop) }}</p>
          </div>
          <div class="prop-actions">
            <button class="btn-ghost small-btn" (click)="editProperty(prop)">✏️ Tahrirlash</button>
            <button class="btn-danger small-btn" (click)="deleteProperty(prop.id)">🗑️ O'chirish</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./my-properties.component.scss']
})
export class MyPropertiesComponent implements OnInit {
  private readonly propertyService = inject(PropertyService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  properties: Property[] = [];
  showForm = false;
  editingProperty: Property | null = null;
  isLoading = false;

  propertyForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    city: ['', Validators.required],
    address: ['', Validators.required],
    price: [null, Validators.required],
    area: [null, Validators.required],
    numberOfBedrooms: [1, Validators.required],
    numberOfBathrooms: [1, Validators.required],
    listingType: ['Rent'],
    petsAllowed: [false],
    isVacant: [true],
    hasWifi: [false],
    hasParking: [false]
  });

  ngOnInit(): void {
    this.loadProperties();
  }

  loadProperties(): void {
    this.propertyService.getAll({ pageSize: 50 }).subscribe({
      next: (result) => {
        const userId = this.authService.getUserId();
        this.properties = result.items.filter(p => p.hostId === userId);
      },
      error: () => {}
    });
  }

  openForm(): void {
    this.editingProperty = null;
    this.propertyForm.reset({ listingType: 'Rent', numberOfBedrooms: 1, numberOfBathrooms: 1, isVacant: true });
    this.showForm = true;
  }

  editProperty(property: Property): void {
    this.editingProperty = property;
    this.propertyForm.patchValue({
      title: property.title,
      description: property.description,
      city: property.city,
      address: property.address,
      price: property.monthlyRent ?? property.salePrice ?? 0,
      area: property.area,
      numberOfBedrooms: property.numberOfBedrooms,
      numberOfBathrooms: property.numberOfBathrooms,
      listingType: property.listingType,
      petsAllowed: property.petsAllowed,
      isVacant: property.isVacant,
      hasWifi: property.hasWifi,
      hasParking: property.hasParking
    });
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingProperty = null;
  }

  onSubmit(): void {
    if (this.propertyForm.invalid) return;
    this.isLoading = true;
    const values = this.propertyForm.value;
    const payload: Partial<Property> = {
      title: values.title,
      description: values.description,
      city: values.city,
      address: values.address,
      area: values.area,
      numberOfBedrooms: values.numberOfBedrooms,
      numberOfBathrooms: values.numberOfBathrooms,
      listingType: values.listingType,
      petsAllowed: values.petsAllowed,
      isVacant: values.isVacant,
      hasWifi: values.hasWifi,
      hasParking: values.hasParking,
      monthlyRent: values.listingType === 'Rent' ? values.price : undefined,
      salePrice: values.listingType === 'Sale' ? values.price : undefined,
    };

    if (this.editingProperty) {
      this.propertyService.update({ ...this.editingProperty, ...payload } as Property).subscribe({
        next: () => {
          this.snackBar.open('Mulk yangilandi!', 'Yopish', { duration: 3000 });
          this.showForm = false;
          this.loadProperties();
          this.isLoading = false;
        },
        error: () => { this.isLoading = false; }
      });
    } else {
      this.propertyService.create(payload).subscribe({
        next: () => {
          this.snackBar.open('Mulk qo\'shildi!', 'Yopish', { duration: 3000 });
          this.showForm = false;
          this.loadProperties();
          this.isLoading = false;
        },
        error: () => { this.isLoading = false; }
      });
    }
  }

  deleteProperty(id: string): void {
    if (!confirm('Haqiqatan ham o\'chirmoqchimisiz?')) return;
    this.propertyService.delete(id).subscribe({
      next: () => {
        this.snackBar.open('Mulk o\'chirildi', 'Yopish', { duration: 3000 });
        this.loadProperties();
      },
      error: () => {}
    });
  }

  getPropPrice(prop: Property): string {
    if (prop.listingType === 'Sale') return `${(prop.salePrice ?? 0).toLocaleString()} UZS`;
    return `${(prop.monthlyRent ?? 0).toLocaleString()} UZS/oy`;
  }
}
