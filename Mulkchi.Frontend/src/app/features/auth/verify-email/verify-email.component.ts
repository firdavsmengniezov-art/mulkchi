import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="verify-email-container">
      <div class="card">
        <ng-container [ngSwitch]="state">
          <div *ngSwitchCase="'loading'">
            <p>Email tasdiqlanmoqda...</p>
          </div>
          <div *ngSwitchCase="'success'">
            <h2>✅ Email tasdiqlandi!</h2>
            <p>Email manzilingiz muvaffaqiyatli tasdiqlandi.</p>
            <a routerLink="/">Bosh sahifaga qaytish</a>
          </div>
          <div *ngSwitchCase="'error'">
            <h2>❌ Xatolik</h2>
            <p>{{ errorMessage }}</p>
            <a routerLink="/">Bosh sahifaga qaytish</a>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    .verify-email-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 60vh;
      padding: 2rem;
    }
    .card {
      text-align: center;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.1);
      max-width: 400px;
    }
  `],
})
export class VerifyEmailComponent implements OnInit {
  state: 'loading' | 'success' | 'error' = 'loading';
  errorMessage = "Tasdiqlash tokeni noto'g'ri yoki muddati tugagan.";

  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.state = 'error';
      return;
    }

    this.http.get(`${this.apiUrl}/verify-email?token=${encodeURIComponent(token)}`).subscribe({
      next: () => {
        this.state = 'success';
      },
      error: (err) => {
        this.state = 'error';
        this.errorMessage =
          err?.error?.message ?? "Tasdiqlash tokeni noto'g'ri yoki muddati tugagan.";
      },
    });
  }
}
