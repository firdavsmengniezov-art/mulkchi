import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequest, UserRole } from '../../../core/models/auth.model';

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

  private authService = inject(AuthService);
  private router = inject(Router);

  register() {
    if (!this.firstName || !this.email || !this.password || !this.phone) {
      this.errorMsg = 'Barcha maydonlarni to\'ldiring';
      return;
    }
    
    const registerRequest: RegisterRequest = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phone: this.phone,
      password: this.password,
      role: this.selectedRole === 1 ? UserRole.Host : UserRole.Guest
    };
    
    this.loading = true;
    this.errorMsg = '';
    
    // Use actual AuthService
    this.authService.register(registerRequest).subscribe({
      next: (response) => {
        this.loading = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = 'Ro\'yxatdan o\'tish xatolik. Iltimos, qayta urinib ko\'ring.';
        console.error('Registration error:', err);
      }
    });
  }
}
