import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Property } from '../../core/models';
import { PropertyService } from '../../core/services/property.service';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { PropertyCardComponent } from '../../shared/components/property-card/property-card.component';

// Angular Material Imports
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NavbarComponent,
    PropertyCardComponent,
    TranslateModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSliderModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  properties: Property[] = [];
  loading = true;
  isSearching = false;

  // Search form fields
  searchRegion = '';
  searchType = '';
  searchPriceMin = 10000;
  searchPriceMax = 500000;
  showAdvancedFilters = false;
  rooms = '';

  // Stats for count-up animation
  statsUsers = 0;
  statsListings = 0;
  statsSatisfaction = 0;

  // Typewriter effect
  typewriterText = '';
  private fullText = "O'zbekistondagi orzuingizdagi uyni toping";

  // Regions list
  regions = [
    'Toshkent',
    'Andijon',
    'Buxoro',
    "Farg'ona",
    'Jizzax',
    'Xorazm',
    'Namangan',
    'Navoiy',
    'Qashqadaryo',
    'Samarqand',
    'Sirdaryo',
    'Surxondaryo',
    'Qoraqalpog‘iston',
  ];

  private propertyService = inject(PropertyService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    this.loading = true;

    if (isPlatformBrowser(this.platformId)) {
      this.startTypewriter();
      this.startCountUp();
    } else {
      this.typewriterText = this.fullText;
      this.statsUsers = 20;
      this.statsListings = 3200;
      this.statsSatisfaction = 96;
    }

    // Load properties from API
    this.propertyService
      .getProperties(1, 6)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          if (res?.items) {
            this.properties = res.items;
          } else if (Array.isArray(res)) {
            this.properties = res;
          } else {
            this.properties = [];
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading properties:', err);
          this.loading = false;
        },
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  startTypewriter() {
    let i = 0;
    const interval = setInterval(() => {
      if (i < this.fullText.length) {
        this.typewriterText += this.fullText.charAt(i);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 100); // 100ms delay per character
  }

  startCountUp() {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepTime = duration / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      this.statsUsers = Math.floor((20 / steps) * currentStep); // Actually 20K
      this.statsListings = Math.floor((3200 / steps) * currentStep);
      this.statsSatisfaction = Math.floor((96 / steps) * currentStep);

      if (currentStep >= steps) {
        this.statsUsers = 20;
        this.statsListings = 3200;
        this.statsSatisfaction = 96;
        clearInterval(interval);
      }
    }, stepTime);
  }

  toggleFilters() {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  search() {
    this.isSearching = true;
    // Simulate slight delay for loading state
    setTimeout(() => {
      this.isSearching = false;
      this.router.navigate(['/properties'], {
        queryParams: {
          region: this.searchRegion,
          type: this.searchType,
          minPrice: this.searchPriceMin,
          maxPrice: this.searchPriceMax,
          rooms: this.rooms || undefined,
        },
      });
    }, 600);
  }
}
