import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs/operators';
import { PropertySearchParams } from '../../../../core/models/property.model';
import { PropertyService } from '../../../../core/services/property.service';

@Component({
  selector: 'app-property-filter-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './property-filter-bar.component.html',
  styleUrls: ['./property-filter-bar.component.scss'],
})
export class PropertyFilterBarComponent implements OnInit {
  @Input() initialParams: PropertySearchParams = { page: 1, pageSize: 12 };
  @Output() filtersChanged = new EventEmitter<PropertySearchParams>();

  searchControl = new FormControl('');
  suggestions: string[] = [];
  showModal = false;
  isLocating = false;
  locationError = '';
  params: PropertySearchParams = { page: 1, pageSize: 12 };
  selectedCurrency = 'UZS';

  constructor(private propertyService: PropertyService) {}

  ngOnInit() {
    this.params = { ...this.initialParams };
    this.searchControl.setValue(this.params.city || '', { emitEvent: false });

    // Autocomplete with debounce
    this.searchControl.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        filter((q): q is string => typeof q === 'string' && q.length >= 2),
        switchMap((q) => this.propertyService.getAutocompleteSuggestions(q)),
      )
      .subscribe((results) => (this.suggestions = results));
  }

  selectSuggestion(city: string) {
    this.params.city = city;
    this.params.latitude = undefined;
    this.params.longitude = undefined;
    this.params.radiusKm = undefined;
    this.searchControl.setValue(city, { emitEvent: false });
    this.suggestions = [];
    this.applyFilters();
  }

  useMyLocation() {
    if (!('geolocation' in navigator)) {
      this.locationError = "Brauzer joylashuvni qo'llab-quvvatlamaydi.";
      return;
    }

    this.isLocating = true;
    this.locationError = '';

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.params = {
          ...this.params,
          city: undefined,
          region: undefined,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          radiusKm: 10,
        };
        this.searchControl.setValue('', { emitEvent: false });
        this.suggestions = [];
        this.isLocating = false;
        this.applyFilters();
      },
      () => {
        this.isLocating = false;
        this.locationError = "Joylashuvni aniqlab bo'lmadi. Ruxsatni tekshiring.";
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      },
    );
  }

  setListingType(type: string) {
    this.params.listingType = type as any;
  }

  setBedrooms(b: number | null) {
    this.params.bedrooms = b !== null ? b : undefined;
  }

  openModal() {
    this.showModal = true;
  }

  onModalApply(newParams: any) {
    this.params = { ...this.params, ...newParams };
    this.showModal = false;
    this.applyFilters();
  }

  applyFilters() {
    this.filtersChanged.emit({ ...this.params });
  }
}
