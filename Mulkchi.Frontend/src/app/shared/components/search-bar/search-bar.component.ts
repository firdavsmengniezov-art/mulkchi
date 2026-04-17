import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent {
  @Output() search = new EventEmitter<SearchParams>();

  location = '';
  propertyType: PropertyType = 'all';
  minPrice = 0;
  maxPrice = 1000000;
  showFilters = false;

  propertyTypes: PropertyTypeOption[] = [
    { value: 'all', label: 'Barcha turlari', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
    { value: 'apartment', label: 'Kvartira', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { value: 'house', label: 'Uy', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { value: 'commercial', label: 'Tijorat', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { value: 'land', label: 'Yer', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 01-.553-.894L15 7m0 13V7' }
  ];

  onSearch() {
    this.search.emit({
      location: this.location,
      propertyType: this.propertyType,
      minPrice: this.minPrice,
      maxPrice: this.maxPrice
    });
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  getSelectedTypeLabel(): string {
    const type = this.propertyTypes.find(t => t.value === this.propertyType);
    return type?.label || 'Barcha turlari';
  }
}

interface SearchParams {
  location: string;
  propertyType: string;
  minPrice: number;
  maxPrice: number;
}

type PropertyType = 'all' | 'apartment' | 'house' | 'commercial' | 'land';

interface PropertyTypeOption {
  value: PropertyType;
  label: string;
  icon: string;
}
