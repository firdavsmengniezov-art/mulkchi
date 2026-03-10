import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: '<div class="container"><h1>Property Detail - Coming Soon</h1><a routerLink="/properties">Back to List</a></div>'
})
export class PropertyDetailComponent {}
