import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PropertyService } from '../../core/services/property.service';
import { Property, PropertyStatus, ListingType, PropertyType } from '../../core/models';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { PropertyCardComponent } from '../../shared/components/property-card/property-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, PropertyCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  properties: Property[] = [];
  loading = true;
  searchRegion = ''; 
  searchType = ''; 
  searchPrice = '';

  private propertyService = inject(PropertyService);
  private router = inject(Router);

  ngOnInit() {
    console.log('Home component initialized');
    console.log('API URL:', this.propertyService);
    
    this.loading = true;
    
    // Load properties from API
    this.propertyService.getProperties(1, 6).subscribe({
      next: res => { 
        console.log('Properties received:', res); 
        this.properties = res.items; 
        this.loading = false; 
      },
      error: err => { 
        console.error('Error loading properties:', err); 
        this.loading = false; 
      }
    });
  }

  search() {
    this.router.navigate(['/properties'], {
      queryParams: { region: this.searchRegion, type: this.searchType }
    });
  }
}
