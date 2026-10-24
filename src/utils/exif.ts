import ExifReader from 'exifreader';

export interface GpsData {
  latitude: number;
  longitude: number;
  suggestedArea?: string;
  formattedCoordinates: string;
}

/**
 * Extract GPS coordinates from an image File or ArrayBuffer using ExifReader
 */
export async function extractExifGps(file: File): Promise<GpsData | null> {
  try {
    const tags = await ExifReader.load(file);
    if (tags['GPSLatitude'] && tags['GPSLongitude']) {
      const latDesc = tags['GPSLatitude'].description;
      const lonDesc = tags['GPSLongitude'].description;

      const lat = parseFloat(String(latDesc));
      const lon = parseFloat(String(lonDesc));

      if (!isNaN(lat) && !isNaN(lon)) {
        // Approximate heuristic for Ahmedabad demo areas
        let suggestedArea = 'Navrangpura';
        if (lat < 23.01) {
          suggestedArea = 'Maninagar';
        }

        return {
          latitude: lat,
          longitude: lon,
          suggestedArea,
          formattedCoordinates: `${lat.toFixed(5)}°N, ${lon.toFixed(5)}°E`,
        };
      }
    }
  } catch (err) {
    console.debug('No EXIF GPS tags found in file:', err);
  }
  return null;
}

/**
 * Get device GPS location with explicit user permission
 */
export async function getDeviceLocation(): Promise<GpsData> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        // Check proximity to Ahmedabad zones
        let suggested = 'Navrangpura';
        if (lat < 23.01) suggested = 'Maninagar';

        resolve({
          latitude: lat,
          longitude: lon,
          suggestedArea: suggested,
          formattedCoordinates: `${lat.toFixed(5)}°N, ${lon.toFixed(5)}°E`,
        });
      },
      (err) => {
        reject(new Error(err.message || 'Location permission denied'));
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  });
}
