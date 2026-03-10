import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: '<div class="container"><h1>Property List - Coming Soon</h1><a routerLink="/">Back to Home</a></div>'
})
export class PropertyListComponent {}
