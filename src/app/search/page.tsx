'use client';

import React, { useState, useEffect, useCallback } from 'react';
import useSWR from 'swr'; // Import useSWR
import { Container } from '@/components/layout/Container';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider"; // For radius
// Import an icon for the location button
import { MapPinIcon } from '@heroicons/react/20/solid';
import { Badge } from "@/components/ui/Badge"; // Import Badge for specialties
import { Skeleton } from "@/components/ui/Skeleton"; // Add Skeleton

// Define a fetcher function for SWR
const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) {
    throw new Error('An error occurred while fetching the data.')
  }
  return res.json();
});

interface SearchParams {
  lat: number | null;
  lng: number | null;
  radius: number;
}

// Updated result type to include looked-up fields
interface ProviderSearchResult {
  _id: string;
  firstName?: string;
  lastName?: string;
  distanceMiles: number;
  location?: { city?: string; };
  bio?: string;
  specialties?: string[];
  providerType?: string;
  experience?: number;
}

// Pagination Metadata Interface
interface PaginationMetadata {
  currentPage: number;
  totalPages: number;
  totalResults: number;
  limit: number;
}

// API Response Interface
interface SearchApiResponse {
  results: ProviderSearchResult[];
  pagination: PaginationMetadata;
}

// Search Query state interface (updated)
interface SearchQuery {
  lat: number;
  lng: number;
  radius: number;
  page: number;
  limit: number;
  specialties?: string[]; // Array of strings
  providerType?: string[]; // Array of strings
}

// Define some sample filters (replace with dynamic data later)
const sampleSpecialties = ["Weight Loss", "Strength Training", "Yoga", "Pilates", "Running Coach"];
const sampleProviderTypes = ["trainer", "coach", "group_leader", "gym", "studio"];

export default function SearchPage() {
  const [manualLocation, setManualLocation] = useState(''); // Simple text input for now
  const [radius, setRadius] = useState(10); // Default radius in miles
  const [searchQuery, setSearchQuery] = useState<SearchQuery | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [geolocationError, setGeolocationError] = useState<string | null>(null);

  // State for filters
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedProviderTypes, setSelectedProviderTypes] = useState<string[]>([]);
  
  const itemsPerPage = 10; // Define limit

  // --- SWR Data Fetching ---
  const buildApiUrl = useCallback(() => {
    if (!searchQuery) return null;
    const params = new URLSearchParams({
      lat: searchQuery.lat.toString(),
      lng: searchQuery.lng.toString(),
      radius: searchQuery.radius.toString(),
      page: searchQuery.page.toString(),
      limit: searchQuery.limit.toString(),
    });
    if (searchQuery.specialties && searchQuery.specialties.length > 0) {
      params.append('specialties', searchQuery.specialties.join(','));
    }
    if (searchQuery.providerType && searchQuery.providerType.length > 0) {
      params.append('providerType', searchQuery.providerType.join(','));
    }
    return `/api/search?${params.toString()}`;
  }, [searchQuery]);

  const apiUrl = buildApiUrl();

  // Update SWR to expect the new response structure
  const { data: apiResponse, error: searchError, isLoading: isSearchLoading } = useSWR<SearchApiResponse>(apiUrl, fetcher);

  const results = apiResponse?.results;
  const pagination = apiResponse?.pagination;

  // --- Geolocation Handler ---
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsFetchingLocation(true);
    setGeolocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log("Current Location Coords:", { latitude, longitude });
        // TODO: Convert coords to a displayable address/name using reverse geocoding (optional)
        setManualLocation(`Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`); 
        // Trigger search with Page 1 and current filters
        setSearchQuery({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          radius: radius,
          page: 1, // Reset to page 1
          limit: itemsPerPage,
          specialties: selectedSpecialties, 
          providerType: selectedProviderTypes
        });
        setIsFetchingLocation(false);
      },
      (geoError) => {
        console.error("Geolocation error:", geoError);
        let message = "Could not get your location.";
        if (geoError.code === geoError.PERMISSION_DENIED) {
          message = "Location permission denied. Please enable it in your browser settings.";
        } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
          message = "Location information is unavailable.";
        } else if (geoError.code === geoError.TIMEOUT) {
          message = "Getting location timed out.";
        }
        alert(message);
        setGeolocationError(message);
        setIsFetchingLocation(false);
      },
      {
        enableHighAccuracy: false, // Lower accuracy is faster and often sufficient
        timeout: 10000, // 10 seconds
        maximumAge: 60000 // Allow cached position up to 1 minute old
      }
    );
  };

  // --- Search Form Submit Handler ---
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if(e) e.preventDefault();
    setGeolocationError(null);
    
    const coordMatch = manualLocation.match(/\(([-+]?\d*\.?\d+),\s*([-+]?\d*\.?\d+)\)/);
    let lat: number | null = null;
    let lng: number | null = null;

    if (coordMatch) {
      lat = parseFloat(coordMatch[1]);
      lng = parseFloat(coordMatch[2]);
    } else {
      console.warn("Manual text location requires geocoding (deferred). Using placeholder coordinates [0,0].");
      lat = 0; 
      lng = 0; 
    }

    if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
      // Set search query, reset to page 1, include filters
      setSearchQuery({
        lat,
        lng,
        radius,
        page: 1, // Reset to page 1
        limit: itemsPerPage,
        specialties: selectedSpecialties, 
        providerType: selectedProviderTypes
      });
    } else {
        setGeolocationError("Invalid location input for search.");
        setSearchQuery(null);
    }
  };

  // --- Filter Handlers ---
  // TODO: Implement actual filter UI, these are placeholders
  const handleSpecialtyChange = (specialty: string) => {
    setSelectedSpecialties(prev => 
      prev.includes(specialty) ? prev.filter(s => s !== specialty) : [...prev, specialty]
    );
    // Optionally trigger search immediately on filter change, or wait for explicit submit
    // handleSearchSubmit(); // Uncomment to search on filter change
  };

  const handleProviderTypeChange = (type: string) => {
    setSelectedProviderTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
    // Optionally trigger search immediately on filter change
    // handleSearchSubmit(); // Uncomment to search on filter change
  };

  // --- Pagination Handler ---
  const handlePageChange = (newPage: number) => {
    if (!searchQuery || newPage < 1 || (pagination && newPage > pagination.totalPages)) {
      return; // Invalid page or no active search
    }
    // Update only the page number in the search query state
    setSearchQuery(prev => prev ? { ...prev, page: newPage } : null);
    // Scroll to top of results might be nice here
    window.scrollTo({ top: document.getElementById('search-results-section')?.offsetTop || 0, behavior: 'smooth' });
  };

  // --- Debounced search on filter change (Optional) ---
  useEffect(() => {
      // If searchQuery exists (meaning an initial search happened) 
      // and filters changed, trigger a new search (debounced)
      if(searchQuery) {
          const handler = setTimeout(() => {
              setSearchQuery(prev => prev ? { 
                  ...prev, 
                  page: 1, // Reset to page 1 on filter change
                  specialties: selectedSpecialties, 
                  providerType: selectedProviderTypes 
              } : null);
          }, 500); // Debounce time: 500ms

          return () => {
              clearTimeout(handler);
          };
      }
  }, [selectedSpecialties, selectedProviderTypes]); // Rerun effect when filters change

  return (
    <Container className="py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Find Providers Near You</h1>

      {/* Search Form Card */}
      <Card className="max-w-lg mx-auto mb-8">
        <CardHeader>
          <CardTitle>Search Options</CardTitle>
        </CardHeader>
        <form onSubmit={handleSearchSubmit}>
          <CardContent className="space-y-4">
            {/* Location Input Section */}
            <div className="space-y-2">
              <Label htmlFor="location">Your Location</Label>
              <div className="flex gap-2">
                <Input 
                  id="location" 
                  value={manualLocation}
                  onChange={(e) => setManualLocation(e.target.value)}
                  placeholder="Enter City, Address, or ZIP..." 
                  required
                  className="flex-grow"
                  disabled={isFetchingLocation}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleUseCurrentLocation}
                  disabled={isFetchingLocation}
                  className="flex-shrink-0"
                >
                  <MapPinIcon className={`h-5 w-5 ${isFetchingLocation ? 'animate-pulse' : ''}`} />
                  <span className="sr-only">Use Current Location</span>
                </Button>
              </div>
              {isFetchingLocation && <p className="text-sm text-muted-foreground">Getting your location...</p>}
              {geolocationError && <p className="text-sm text-red-500">{geolocationError}</p>}
            </div>
            
            {/* Radius Slider */}
            <div>
              <Label htmlFor="radius">Search Radius: {radius} miles</Label>
              <Slider
                id="radius"
                min={1}
                max={50} // Max radius from spec
                step={1}
                value={[radius]}
                onValueChange={(value: number[]) => setRadius(value[0])}
                className="mt-2"
              />
            </div>

            {/* Filters Section - Placeholder UI using Checkboxes */}
            <div>
              <h3 className="text-sm font-medium mb-2 text-muted-foreground">Filter by Specialty</h3>
              <div className="flex flex-wrap gap-2 text-sm">
                {sampleSpecialties.map(spec => (
                  <div key={spec} className="flex items-center space-x-1">
                    <input 
                      type="checkbox" 
                      id={`spec-${spec}`}
                      checked={selectedSpecialties.includes(spec)}
                      onChange={() => handleSpecialtyChange(spec)}
                    />
                    <label htmlFor={`spec-${spec}`}>{spec}</label>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2 text-muted-foreground">Filter by Provider Type</h3>
              <div className="flex flex-wrap gap-2 text-sm">
                {sampleProviderTypes.map(type => (
                  <div key={type} className="flex items-center space-x-1">
                    <input 
                      type="checkbox" 
                      id={`type-${type}`}
                      checked={selectedProviderTypes.includes(type)}
                      onChange={() => handleProviderTypeChange(type)}
                    />
                    <label htmlFor={`type-${type}`} className="capitalize">{type.replace('_',' ')}</label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isFetchingLocation}>
              Search Providers
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Search Results Section */}
      <div id="search-results-section" className="mt-8">
        {searchError && <p className="text-red-500 text-center mb-4">Error loading results: {searchError.message}</p>}
        
        {/* Loading Skeletons */}
        {isSearchLoading && (
          <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                      <CardHeader><Skeleton className="h-6 w-1/2 mb-2" /></CardHeader>
                      <CardContent><Skeleton className="h-4 w-full" /></CardContent>
                  </Card>
              ))}
          </div>
        )}
        
        {/* Display message only when a search has happened */}
        {!isSearchLoading && !searchError && searchQuery && results?.length === 0 && (
          <p className="text-center text-muted-foreground">No providers found matching your criteria.</p>
        )}
        {/* Initial state message */}
        {!isSearchLoading && !searchError && !searchQuery && (
            <p className="text-center text-muted-foreground">Enter location and search to find providers.</p>
        )}
        
        {/* Results List */}
        {results && results.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-center">Search Results ({pagination?.totalResults})</h2>
            <div className="space-y-4">
              {results.map((provider) => (
                <Card key={provider._id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{provider.firstName || 'N/A'} {provider.lastName || ''}</CardTitle>
                      <span className="text-sm text-muted-foreground whitespace-nowrap">{provider.distanceMiles} mi</span>
                    </div>
                    {/* Display Provider Type if available */}
                    {provider.providerType && (
                       <p className="text-sm text-muted-foreground capitalize">
                         {provider.providerType.replace('_', ' ')}
                       </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    {/* Display Specialties as Badges */}
                    {provider.specialties && provider.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {provider.specialties.map((spec, index) => (
                          <Badge key={index} variant="secondary">{spec}</Badge>
                        ))}
                      </div>
                    )}
                    {/* Display truncated Bio */}
                    {provider.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {provider.bio}
                      </p>
                    )}
                    {!provider.bio && (
                       <p className="text-sm text-muted-foreground italic">No bio available.</p>
                    )}
                     {/* TODO: Add Link to provider profile page */}
                  </CardContent>
                   {/* Optional: Add actions in footer like 'View Profile' */}
                   {/* <CardFooter>
                     <Button variant="outline" size="sm">View Profile</Button>
                   </CardFooter> */}
                </Card>
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-8">
                <Button 
                  onClick={() => handlePageChange(pagination.currentPage - 1)} 
                  disabled={pagination.currentPage <= 1}
                  variant="outline"
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <Button 
                  onClick={() => handlePageChange(pagination.currentPage + 1)} 
                  disabled={pagination.currentPage >= pagination.totalPages}
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Container>
  );
} 