# RideWithGPS GPX Downloader

A Chrome extension that converts RideWithGPS routes to GPX format for use with GPS devices and other applications.

## Features

- Automatically detects RideWithGPS route pages
- Adds a download button directly to the route page
- Converts route data to standard GPX format
- Includes waypoints for points of interest from the route
- Preserves elevation data
- Easy-to-use popup interface

## Installation

### From Chrome Web Store

*(Coming soon)*

### Manual Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the upper-right corner)
4. Click "Load unpacked" and select the directory containing the extension files
5. The extension should now be installed and active

## Usage

1. Navigate to any RideWithGPS route page (e.g., `https://ridewithgps.com/routes/49795658`)
2. You'll see a "Download GPX" button added to the page
3. Click the button to download the route as a GPX file
4. Alternatively, click the extension icon in the toolbar to open the popup interface
5. Click "Download GPX" in the popup

## File Structure

- `manifest.json` - Extension configuration
- `content.js` - Content script that runs on RideWithGPS pages
- `popup.html` & `popup.js` - Extension popup interface
- `background.js` - Background script for handling data conversion and downloads
- `converter.js` - Core logic for converting JSON to GPX format

## Technical Details

The extension works by:
1. Detecting when you're on a RideWithGPS route page
2. Fetching the route data from the JSON endpoint
3. Converting the route data to standard GPX format
4. Providing the GPX file for download

## Requirements

- Google Chrome or Chromium-based browser
- Access to RideWithGPS route pages

## Privacy

This extension:
- Does not collect any personal information
- Does not send data to any third-party servers
- Only accesses data from the specific route you're viewing
- All processing is done locally in your browser

## License

MIT

## Support

For issues, suggestions, or contributions, please submit an issue on GitHub.

---