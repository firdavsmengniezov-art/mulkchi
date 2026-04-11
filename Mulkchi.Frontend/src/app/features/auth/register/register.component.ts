import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { RegisterRequest } from '../../../core/models/auth.model';
import { AuthService } from '../../../core/services/auth.service';
import { LoggingService } from '../../../core/services/logging.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  password = '';
  confirmPassword = '';
  acceptTerms = false;
  showPassword = false;
  showConfirmPassword = false;
  loading = false;
  errorMsg = '';

  private authService = inject(AuthService);
  private router = inject(Router);
  private logger = inject(LoggingService);

  register() {
    if (!this.firstName || !this.email || !this.password || !this.phone) {
      this.errorMsg = "Barcha maydonlarni to'ldiring";
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(this.password)) {
      this.errorMsg =
        "Parol kamida 8 ta belgi, katta harf, kichik harf, raqam va maxsus belgi bo'lishi kerak";
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMsg = 'Parollar mos kelmadi';
      return;
    }

    if (!this.acceptTerms) {
      this.errorMsg = 'Foydalanish shartlariga rozilik bildiring';
      return;
    }

    const registerRequest: RegisterRequest = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phone: this.phone,
      password: this.password,
      preferredLanguage: 'uz',
    };

    this.loading = true;
    this.errorMsg = '';

    this.authService.register(registerRequest).subscribe({
      next: (response) => {
        this.loading = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;

        if (err.status === 409) {
          this.errorMsg =
            "Bu email allaqachon ro'yxatdan o'tgan. Iltimos, boshqa emaildan foydalaning.";
        } else if (err.status === 400) {
          this.errorMsg = "Ma'lumotlar noto'g'ri. Iltimos, barcha maydonlarni to'g'ri to'ldiring.";
        } else {
          this.errorMsg = "Ro'yxatdan o'tishda xatolik. Iltimos, qayta urinib ko'ring.";
        }
        this.logger.error('Registration error:', err);
      },
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
