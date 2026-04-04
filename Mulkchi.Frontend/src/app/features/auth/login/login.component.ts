import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = ''; 
  password = '';
  loading = false; 
  errorMsg = '';

  private authService = inject(AuthService);
  private router = inject(Router);

  login() {
    if (!this.email || !this.password) {
      this.errorMsg = 'Email va parolni kiriting';
      return;
    }
    
    const loginRequest: LoginRequest = {
      email: this.email,
      password: this.password
    };
    
    this.loading = true;
    this.errorMsg = '';
    
    // Use actual AuthService
    this.authService.login(loginRequest).subscribe({
      next: (response) => {
        this.loading = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = 'Login xatolik. Email yoki parol noto\'g\'ri.';
        console.error('Login error:', err);
      }
    });
  }
}
