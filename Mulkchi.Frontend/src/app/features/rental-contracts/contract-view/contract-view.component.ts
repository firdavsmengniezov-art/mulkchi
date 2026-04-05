import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-contract-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="container mx-auto px-4 py-8">
        <div class="bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 class="text-2xl font-bold text-gray-900 mb-4">Shartnoma</h1>
          <p class="text-gray-600">Shartnoma ko'rish funksiyasi tez orada ishga tushadi.</p>
          <button (click)="goBack()" class="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Orqaga
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ContractViewComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    console.log('ContractViewComponent initialized');
  }

  goBack(): void {
    this.location.back();
  }
}
