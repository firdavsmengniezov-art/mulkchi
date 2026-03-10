import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  firstName = ''; 
  lastName = '';
  email = ''; 
  phone = '';
  password = ''; 
  selectedRole = 0;
  loading = false; 
  errorMsg = '';

  constructor(
    private router: Router
  ) {}

  register() {
    if (!this.firstName || !this.email || !this.password || !this.phone) {
      this.errorMsg = 'Barcha maydonlarni to\'ldiring';
      return;
    }
    this.loading = true;
    this.errorMsg = '';
    
    // Simulate registration - replace with actual service call
    setTimeout(() => {
      this.loading = false;
      this.router.navigate(['/']);
    }, 1000);
  }
}
