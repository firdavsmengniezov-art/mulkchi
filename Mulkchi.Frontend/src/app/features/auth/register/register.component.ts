import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
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
    private authService: AuthService,
    private router: Router
  ) {}

  register() {
    if (!this.firstName || !this.email || !this.password || !this.phone) {
      this.errorMsg = 'Barcha maydonlarni to\'ldiring';
      return;
    }
    this.loading = true;
    this.errorMsg = '';
    this.authService.register({
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phone: this.phone,
      password: this.password,
      role: this.selectedRole
    }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'Ro\'yxatdan o\'tishda xatolik';
      }
    });
  }
}
