/**
 * Converts RideWithGPS JSON data to GPX format
 */
class RideWithGPSConverter {
  /**
   * Convert RideWithGPS JSON to GPX format
   * @param {Object} jsonData - The JSON data from RideWithGPS
   * @returns {string} - The GPX formatted data as a string
   */
  static convertToGPX(jsonData) {
    if (!jsonData || !jsonData.track_points) {
      throw new Error('Invalid JSON data: missing track_points array');
    }

    const routeName = jsonData.name || 'RideWithGPS Route';
    const trackPoints = jsonData.track_points;
    const pois = jsonData.points_of_interest || [];

    // Create GPX XML
    let gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx xmlns="http://www.topografix.com/GPX/1/1" 
     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
     xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd"
     version="1.1" 
     creator="RideWithGPS GPX Converter Extension">
  <metadata>
    <name>${this.escapeXml(routeName)}</name>
    <desc>${this.escapeXml(jsonData.description || '')}</desc>
  </metadata>
  <trk>
    <name>${this.escapeXml(routeName)}</name>
    <trkseg>`;

    // Add track points
    for (const point of trackPoints) {
      // RideWithGPS track_points use x for longitude, y for latitude, e for elevation
      gpxContent += `
      <trkpt lat="${point.y}" lon="${point.x}">
        <ele>${point.e}</ele>
      </trkpt>`;
    }

    gpxContent += `
    </trkseg>
  </trk>`;

    // Add waypoints for points of interest
    for (const poi of pois) {
      gpxContent += `
  <wpt lat="${poi.lat}" lon="${poi.lng}">
    <name>${this.escapeXml(poi.name || '')}</name>
    <desc>${this.escapeXml(poi.description || '')} (${poi.poi_type_name || 'waypoint'})</desc>
    <type>${poi.poi_type_name || 'waypoint'}</type>
  </wpt>`;
    }

    gpxContent += `
</gpx>`;

    return gpxContent;
  }

  /**
   * Escape XML special characters to prevent XML injection
   * @param {string} str - The string to escape
   * @returns {string} - Escaped string
   */
  static escapeXml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}

// Export the converter class
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = RideWithGPSConverter;
}