import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class UiToastService {
  constructor(private readonly snackBar: MatSnackBar) {}

  success(message: string): void {
    this.open(message, '✓', ['toast-success']);
  }

  error(message: string): void {
    this.open(message, '✕', ['toast-error']);
  }

  info(message: string): void {
    this.open(message, 'i', ['toast-info']);
  }

  private open(message: string, action: string, panelClass: string[]): void {
    this.snackBar.open(message, action, {
      duration: 3500,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass,
    });
  }
}
