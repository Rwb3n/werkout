import NodeGeocoder, { Options, Entry } from 'node-geocoder';

const options: Options = {
  provider: 'openstreetmap',
  // Optional dependencies
  // fetch: customFetchImplementation, // If you want to use a custom fetch function
  // apiKey: 'YOUR_API_KEY', // For providers requiring an API key
  formatter: null // 'gpx', 'string', ...
};

const geocoder = NodeGeocoder(options);

interface LocationInput {
  city?: string;
  state?: string;
  country?: string;
  address?: string; // Allow full address geocoding later if needed
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Geocodes a location string or components into coordinates.
 * Prefers address if provided, otherwise constructs a query from components.
 * @param location - Object containing city, state, country, or address.
 * @returns A promise resolving to coordinates { latitude, longitude } or null if not found.
 */
export const getCoordinates = async (
  location: LocationInput
): Promise<Coordinates | null> => {
  let query: string;

  if (location.address) {
    query = location.address;
  } else {
    // Construct query string from components, filtering out undefined parts
    query = [
        location.city,
        location.state,
        location.country
    ].filter(Boolean).join(', ');
  }

  if (!query) {
    console.warn('Geocoding skipped: No location details provided.');
    return null;
  }

  try {
    const res: Entry[] = await geocoder.geocode(query);
    if (res.length > 0 && res[0].latitude && res[0].longitude) {
      // Return the first result's coordinates
      return {
        latitude: res[0].latitude,
        longitude: res[0].longitude,
      };
    } else {
      console.warn(`Geocoding failed for query: "${query}". No results found.`);
      return null;
    }
  } catch (error) {
    console.error(`Geocoding error for query: "${query}":`, error);
    return null;
  }
}; 