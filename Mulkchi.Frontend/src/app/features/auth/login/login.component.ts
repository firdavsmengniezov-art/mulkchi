import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LoginRequest } from '../../../core/models/auth.model';
import { AuthService } from '../../../core/services/auth.service';
import { LoggingService } from '../../../core/services/logging.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  email = '';
  password = '';
  remember = false;
  showPassword = false;
  loading = false;
  errorMsg = '';

  private authService = inject(AuthService);
  private router = inject(Router);
  private logger = inject(LoggingService);

  login() {
    if (!this.email || !this.password) {
      this.errorMsg = 'Email va parolni kiriting';
      return;
    }

    const loginRequest: LoginRequest = {
      email: this.email,
      password: this.password,
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
        this.errorMsg = "Login xatolik. Email yoki parol noto'g'ri.";
        this.logger.error('Login error:', err);
      },
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
