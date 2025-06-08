// here-maps.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HereMapsService {
  private readonly apiKey = environment.api_key_heremaps;
  private readonly baseUrl = 'https://router.hereapi.com/v8';

  constructor(private http: HttpClient) {}
// Add this method to your HereMapsService
async searchAddresses(query: string): Promise<any[]> {
  try {
    const cleanQuery = query.trim();
    if (!cleanQuery) {
      throw new Error('Search query cannot be empty');
    }

    // Try multiple search strategies to match the comprehensive results you're seeing
    let allResults: any[] = [];

    // Strategy 1: Places API search (for businesses and POIs)
    try {
      const placesResults = await this.searchPlaces(cleanQuery);
      allResults.push(...placesResults);
    } catch (error) {
      console.warn('Places search failed:', error);
    }

    // Strategy 2: Standard geocoding
    try {
      const geocodeResults = await this.performGeocode(cleanQuery, {
        limit: 15,
        // Don't force English - allow multilingual results
        locationBias: "48.8566,2.3522",
        countryCode: 'FRA'
      });
      allResults.push(...geocodeResults);
    } catch (error) {
      console.warn('Geocoding search failed:', error);
    }

    // Strategy 3: Discover API for businesses (if no results yet)
    if (allResults.length < 5) {
      try {
        const discoverResults = await this.searchDiscover(cleanQuery);
        allResults.push(...discoverResults);
      } catch (error) {
        console.warn('Discover search failed:', error);
      }
    }

    // Remove duplicates and sort by relevance
    const uniqueResults = this.deduplicateResults(allResults);
    
    return uniqueResults.slice(0, 20); // Limit final results
  } catch (error: any) {
    console.error('Address search error:', error?.message || error);
    throw new Error(`Address search failed: ${error?.message || 'Unknown error'}`);
  }
}

// Search using HERE Places API (for businesses, restaurants, etc.)
private async searchPlaces(query: string): Promise<any[]> {
  const params = new URLSearchParams({
    q: query,
    apiKey: this.apiKey,
    limit: '15',
    at: "48.8566,2.3522", // Paris center
    in: 'countryCode:FRA'
    // Don't set lang parameter to allow multilingual results
  });

  const url = `https://places.ls.hereapi.com/places/v1/discover/search?${params.toString()}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Places API failed: ${response.status}`);
  }

  const data = await response.json();
  return data.results?.items || [];
}

// Standard geocoding (for addresses and locations)
private async performGeocode(query: string, options: {
  limit?: number;
  locationBias?: string;
  countryCode?: string;
}): Promise<any[]> {
  const params = new URLSearchParams({
    q: query,
    apiKey: this.apiKey,
    limit: (options.limit || 10).toString()
    // Removed lang parameter to allow Arabic/multilingual results
  });

  if (options.locationBias) {
    params.append('at', options.locationBias);
  }

  if (options.countryCode) {
    params.append('in', `countryCode:${options.countryCode}`);
  }

  // Include all types including places and businesses
  params.append('types', 'address,street,locality,area,city,county,state,country,place,business');

  const url = `https://geocode.search.hereapi.com/v1/geocode?${params.toString()}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Geocode failed: ${response.status}`);
  }

  const data = await response.json();
  return data.items || [];
}

// Search using Discover API for businesses and POIs
private async searchDiscover(query: string): Promise<any[]> {
  const params = new URLSearchParams({
    q: query,
    apiKey: this.apiKey,
    limit: '10',
    at: "48.8566,2.3522",
    in: 'countryCode:FRA'
  });

  const url = `https://discover.search.hereapi.com/v1/discover?${params.toString()}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Discover API failed: ${response.status}`);
  }

  const data = await response.json();
  return data.items || [];
}

// Remove duplicate results based on title and location
private deduplicateResults(results: any[]): any[] {
  const seen = new Set();
  return results.filter(item => {
    const key = `${item.title || item.name || ''}-${item.vicinity || item.address?.label || ''}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

// Alternative: Use Browse API for category-based search
async searchTunisianBusinesses(): Promise<any[]> {
  try {
    const params = new URLSearchParams({
      apiKey: this.apiKey,
      at: "48.8566,2.3522",
      in: 'countryCode:FRA',
      categories: 'restaurant,bank,government-office,retail,service',
      q: 'tunisia tunisian tunis',
      limit: '20'
    });

    const url = `https://browse.search.hereapi.com/v1/browse?${params.toString()}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Browse API failed: ${response.status}`);
    }

    const data = await response.json();
    return data.items || [];
  } catch (error: any) {
    console.error('Browse search error:', error);
    return [];
  }
}

  async calculateDrivingDistance(origin: string, destination: string): Promise<number> {
    try {
      // First geocode both addresses to get coordinates
      const [originCoords, destinationCoords] = await Promise.all([
        this.geocodeAddress(origin),
        this.geocodeAddress(destination)
      ]);

      // Then calculate route distance
      const response: any = await this.http.get(`${this.baseUrl}/routes`, {
        params: {
          transportMode: 'car',
          origin: `${originCoords.lat},${originCoords.lng}`,
          destination: `${destinationCoords.lat},${destinationCoords.lng}`,
          return: 'summary',
          apiKey: this.apiKey
        }
      }).toPromise();

      const distanceInMeters = response?.routes?.[0]?.sections?.[0]?.summary?.length;
      if (!distanceInMeters) throw new Error('Invalid distance response');
      
      return distanceInMeters / 1000; // Convert to kilometers
    } catch (error) {
      console.error('HERE Maps API error:', error);
      throw new Error('Failed to calculate distance');
    }
  }

  private async geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
    const response: any = await this.http.get('https://geocode.search.hereapi.com/v1/geocode', {
      params: {
        q: address,
        apiKey: this.apiKey
      }
    }).toPromise();

    if (!response?.items?.[0]?.position) {
      throw new Error('Address not found');
    }

    return {
      lat: response.items[0].position.lat,
      lng: response.items[0].position.lng
    };
  }
}