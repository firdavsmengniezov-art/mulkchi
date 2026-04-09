import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  AfterViewInit,
  ElementRef,
  ViewChild,
  SimpleChanges,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

export interface MapMarker {
  lat: number;
  lng: number;
  title?: string;
  popup?: string;
}

/**
 * PropertyMapComponent — renders a Leaflet.js map.
 *
 * Usage (single marker):
 *   <app-property-map [lat]="property.latitude" [lng]="property.longitude"
 *                     [title]="property.title"></app-property-map>
 *
 * Usage (multiple markers):
 *   <app-property-map [markers]="mapMarkers" [zoom]="10"></app-property-map>
 */
@Component({
  selector: 'app-property-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div #mapContainer class="property-map-container" [style.height]="height"></div>
  `,
  styles: [`
    .property-map-container {
      width: 100%;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #e5e7eb;
    }
  `],
})
export class PropertyMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef<HTMLDivElement>;

  /** Single-marker convenience inputs */
  @Input() lat?: number | null;
  @Input() lng?: number | null;
  @Input() title?: string;
  @Input() popup?: string;

  /** Multi-marker mode */
  @Input() markers: MapMarker[] = [];

  /** Map zoom level */
  @Input() zoom = 13;

  /** Container height (CSS value) */
  @Input() height = '400px';

  private map: any;
  private L: any;
  private markerLayer: any[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  async ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    await this.initMap();
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (!this.map) return;
    if (changes['lat'] || changes['lng'] || changes['markers'] || changes['title'] || changes['popup']) {
      this.refreshMarkers();
    }
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  private async initMap() {
    // Dynamic import so Leaflet is only loaded in the browser
    this.L = await import('leaflet');

    // Fix default icon paths broken by webpack
    const iconDefault = this.L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
    this.L.Marker.prototype.options.icon = iconDefault;

    const center = this.getCenter();
    this.map = this.L.map(this.mapContainer.nativeElement, {
      center,
      zoom: this.zoom,
      scrollWheelZoom: false,
    });

    this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(this.map);

    this.refreshMarkers();
  }

  private getCenter(): [number, number] {
    if (this.lat != null && this.lng != null) return [this.lat, this.lng];
    if (this.markers.length > 0) return [this.markers[0].lat, this.markers[0].lng];
    // Default: Tashkent city center
    return [41.2995, 69.2401];
  }

  private refreshMarkers() {
    if (!this.map || !this.L) return;

    // Remove old markers
    this.markerLayer.forEach((m) => m.remove());
    this.markerLayer = [];

    const allMarkers = this.buildMarkerList();

    allMarkers.forEach((m) => {
      const marker = this.L.marker([m.lat, m.lng]).addTo(this.map);
      if (m.popup) marker.bindPopup(m.popup);
      else if (m.title) marker.bindTooltip(m.title);
      this.markerLayer.push(marker);
    });

    if (allMarkers.length === 1) {
      this.map.setView([allMarkers[0].lat, allMarkers[0].lng], this.zoom);
    } else if (allMarkers.length > 1) {
      const group = this.L.featureGroup(this.markerLayer);
      this.map.fitBounds(group.getBounds().pad(0.1));
    }
  }

  private buildMarkerList(): MapMarker[] {
    if (this.markers.length > 0) return this.markers;
    if (this.lat != null && this.lng != null) {
      return [{ lat: this.lat, lng: this.lng, title: this.title, popup: this.popup }];
    }
    return [];
  }
}
