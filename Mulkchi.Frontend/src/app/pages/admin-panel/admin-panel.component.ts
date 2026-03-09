import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule],
  template: '<div class="container"><h1>Admin Panel</h1><p>Tez orada tayyor bo\'ladi...</p></div>'
})
export class AdminPanelComponent {}
