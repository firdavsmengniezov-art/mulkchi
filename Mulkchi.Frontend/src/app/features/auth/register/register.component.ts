import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequest } from '../../../core/models/auth.model';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule,
    TranslateModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  firstName = ''; 
  lastName = '';
  email = ''; 
  phone = '';
  password = ''; 
  loading = false; 
  errorMsg = '';

  private authService = inject(AuthService);
  private router = inject(Router);

  register() {
    if (!this.firstName || !this.email || !this.password || !this.phone) {
      this.errorMsg = 'Barcha maydonlarni to\'ldiring';
      return;
    }
    
    // Generate random email for testing
    const randomSuffix = Math.random().toString(36).substring(7);
    const testEmail = this.email.includes('@') 
      ? this.email.split('@')[0] + '+' + randomSuffix + '@' + this.email.split('@')[1]
      : this.email;
    
    const registerRequest: RegisterRequest = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: testEmail, // Random email
      phone: this.phone,
      password: this.password,
      preferredLanguage: 'uz'
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
        
        // Handle specific error cases
        if (err.status === 409) {
          this.errorMsg = 'Bu email allaqachon ro\'yxatdan o\'tgan. Iltimos, boshqa emaildan foydalaning.';
        } else if (err.status === 400) {
          this.errorMsg = 'Ma\'lumotlar noto\'g\'ri. Iltimos, barcha maydonlarni to\'g\'ri to\'ldiring.';
        } else {
          this.errorMsg = 'Ro\'yxatdan o\'tish xatolik. Iltimos, qayta urinib ko\'ring.';
        }
        
        console.error('Registration error:', err);
      }
    });
  }
}
