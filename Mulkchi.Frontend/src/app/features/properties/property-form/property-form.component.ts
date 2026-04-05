import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { PropertyService } from '../../../core/services/property.service';
import { PropertyImageService } from '../../../core/services/property-image.service';
import { Property, PropertyImage } from '../../../core/models';
import { ImageUploaderComponent } from '../../../shared/components/image-uploader/image-uploader.component';

@Component({
  selector: 'app-property-form',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule, 
    TranslateModule,
    ImageUploaderComponent
  ],
  templateUrl: './property-form.component.html',
  styleUrls: ['./property-form.component.scss']
})
export class PropertyFormComponent implements OnInit {
  isEditMode = false;
  propertyId: string | null = null;
  loading = false;
  saving = false;
  
  // Property form data
  property: any = {
    title: '',
    description: '',
    price: 0,
    address: '',
    city: '',
    region: '',
    propertyType: 'Apartment',
    listingType: 'Sale',
    area: 0,
    roomsCount: 1,
    bathroomsCount: 1,
    hasParking: false,
    hasFurniture: false,
    hasAirConditioning: false,
    hasHeating: false,
    yearBuilt: new Date().getFullYear()
  };

  // Image management
  propertyImages: PropertyImage[] = [];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private propertyService: PropertyService,
    private propertyImageService: PropertyImageService
  ) {}

  ngOnInit(): void {
    this.checkEditMode();
    if (this.isEditMode && this.propertyId) {
      this.loadProperty();
      this.loadPropertyImages();
    }
  }

  private checkEditMode(): void {
    this.propertyId = this.activatedRoute.snapshot.paramMap.get('id');
    this.isEditMode = !!this.propertyId;
  }

  private loadProperty(): void {
    if (!this.propertyId) return;
    
    this.loading = true;
    this.propertyService.getProperty(this.propertyId).subscribe({
      next: (property: any) => {
        this.property = property;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading property:', error);
        alert('Failed to load property');
        this.loading = false;
      }
    });
  }

  private loadPropertyImages(): void {
    if (!this.propertyId) return;
    
    this.propertyImageService.getPropertyImages(this.propertyId).subscribe({
      next: (images: any) => {
        this.propertyImages = images;
      },
      error: (error: any) => {
        console.error('Error loading images:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.saving) return;
    
    this.saving = true;
    
    const observable = this.isEditMode && this.propertyId
      ? this.propertyService.updateProperty(this.propertyId, this.property)
      : this.propertyService.createProperty(this.property);

    observable.subscribe({
      next: (response: any) => {
        const newPropertyId = this.isEditMode ? this.propertyId : response.id;
        
        if (!this.isEditMode) {
          // For new properties, set the propertyId for image upload
          this.propertyId = newPropertyId;
        }
        
        alert(this.isEditMode ? 'Property updated successfully!' : 'Property created successfully!');
        this.saving = false;
        
        // Navigate to property detail or stay on form for image upload
        if (this.isEditMode) {
          this.router.navigate(['/properties', this.propertyId]);
        } else {
          // Stay on form for image upload
          alert('Property created! Now you can upload images.');
        }
      },
      error: (error: any) => {
        console.error('Error saving property:', error);
        alert(`Failed to save property: ${error}`);
        this.saving = false;
      }
    });
  }

  onImagesUploaded(images: PropertyImage[]): void {
    this.propertyImages = [...this.propertyImages, ...images];
    alert('Images uploaded successfully!');
  }

  onImageDeleted(imageId: string): void {
    this.propertyImages = this.propertyImages.filter(img => img.id !== imageId);
    alert('Image deleted successfully!');
  }

  onPrimaryImageSet(imageId: string): void {
    // Update all images to set only one as primary
    this.propertyImages = this.propertyImages.map(img => ({
      ...img,
      isPrimary: img.id === imageId
    }));
    alert('Primary image updated!');
  }

  onCancel(): void {
    if (this.isEditMode && this.propertyId) {
      this.router.navigate(['/properties', this.propertyId]);
    } else {
      this.router.navigate(['/properties']);
    }
  }

  // Form validation
  get isFormValid(): boolean {
    return !!(
      this.property.title &&
      this.property.description &&
      this.property.address &&
      this.property.city &&
      this.property.region &&
      this.property.price > 0 &&
      this.property.area > 0
    );
  }

  // Enum helpers
  get propertyTypes(): string[] {
    return ['Apartment', 'House', 'Villa', 'Commercial', 'Land', 'Studio'];
  }

  get listingTypes(): string[] {
    return ['Sale', 'Rent', 'ShortTermRent'];
  }

  get regions(): string[] {
    return ['Tashkent', 'Samarkand', 'Bukhara', 'Fergana', 'Andijan', 'Namangan', 'Khorezm', 'Karakalpakstan'];
  }

  // Current year for form validation
  get currentYear(): number {
    return new Date().getFullYear();
  }
}
