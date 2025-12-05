/**
 * Electoral district coordinates mapping
 * Maps Swedish electoral districts (valkrets) to approximate center coordinates
 * 
 * TODO: Replace with proper GeoJSON boundaries from Lantmäteriet
 */

export interface ElectoralDistrict {
  name: string
  coordinates: [number, number] // [longitude, latitude]
}

/**
 * Mapping of electoral district names to coordinates
 * Coordinates are approximate centers for major districts
 */
export const ELECTORAL_DISTRICT_COORDINATES: Record<string, [number, number]> = {
  'Stockholms kommun': [18.0686, 59.3293],
  'Stockholms län': [18.0686, 59.3293],
  'Göteborgs kommun': [11.9746, 57.7089],
  'Göteborgs län': [11.9746, 57.7089],
  'Malmö kommun': [13.0007, 55.6059],
  'Skåne län': [13.0007, 55.6059],
  'Uppsala län': [17.6389, 59.8586],
  'Södermanlands län': [16.5114, 59.1955],
  'Östergötlands län': [15.6214, 58.4108],
  'Jönköpings län': [14.1614, 57.7815],
  'Kronobergs län': [14.7974, 56.8777],
  'Kalmar län': [16.3618, 56.6634],
  'Gotlands län': [18.2947, 57.6614],
  'Blekinge län': [15.5849, 56.1612],
  'Skåne läns norra och östra': [14.0389, 56.0877],
  'Skåne läns södra': [13.5533, 55.4817],
  'Skåne läns västra': [12.9141, 55.9104],
  'Hallands län': [12.6013, 56.6744],
  'Västra Götalands län': [11.9746, 57.7089],
  'Västra Götalands läns norra': [13.0, 58.2],
  'Västra Götalands läns södra': [12.7, 57.3],
  'Västra Götalands läns västra': [11.8, 57.9],
  'Västra Götalands läns östra': [13.3, 58.0],
  'Värmlands län': [13.1777, 59.3793],
  'Örebro län': [15.2066, 59.2741],
  'Västmanlands län': [16.5448, 59.6099],
  'Dalarnas län': [15.1786, 60.6749],
  'Gävleborgs län': [17.1413, 60.6749],
  'Västernorrlands län': [17.6389, 62.3908],
  'Jämtlands län': [14.6361, 63.1712],
  'Västerbottens län': [19.7167, 64.7507],
  'Norrbottens län': [22.1547, 65.5842],
}

/**
 * Get coordinates for an electoral district
 * Returns Stockholm coordinates as fallback
 */
export function getDistrictCoordinates(districtName: string): [number, number] {
  return (
    ELECTORAL_DISTRICT_COORDINATES[districtName] ||
    ELECTORAL_DISTRICT_COORDINATES['Stockholms kommun']
  )
}

