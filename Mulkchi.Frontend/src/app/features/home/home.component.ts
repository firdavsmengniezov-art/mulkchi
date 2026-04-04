import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PropertyService } from '../../core/services/property.service';
import { Property, PropertyStatus, ListingType, PropertyType } from '../../core/models';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { PropertyCardComponent } from '../../shared/components/property-card/property-card.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, PropertyCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  properties: Property[] = [];
  loading = true;
  searchRegion = ''; 
  searchType = ''; 
  searchPrice = '';

  private propertyService = inject(PropertyService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  ngOnInit() {
    console.log('Home component initialized');
    console.log('API URL:', environment.apiUrl);
    
    this.loading = true;
    
    // Load properties from API
    this.propertyService.getProperties(1, 6)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          console.log('Raw response:', res);
          console.log('Properties received:', res); 
          console.log('Items:', res?.items);
          console.log('Type:', typeof res);
          
          // Handle both response formats
          if (res?.items) {
            this.properties = res.items;
          } else if (Array.isArray(res)) {
            this.properties = res;
          } else {
            this.properties = [];
          }
          
          console.log('Properties set:', this.properties.length);
          this.loading = false; 
        },
        error: (err) => { 
          console.error('Error loading properties:', err); 
          this.loading = false; 
        }
      });
  }

  ngOnDestroy() {
    console.log('Home component destroyed');
    this.destroy$.next();
    this.destroy$.complete();
  }

  search() {
    this.router.navigate(['/properties'], {
      queryParams: { region: this.searchRegion, type: this.searchType }
    });
  }
}
