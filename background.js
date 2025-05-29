/**
 * Background service worker for the RideWithGPS GPX Downloader extension
 */

// Import the converter module
importScripts('converter.js');

// Listen for tab updates to set the icon based on URL
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const routeRegex = /^https:\/\/ridewithgps\.com\/routes\/(\d+)$/;
    const isRoutePage = routeRegex.test(tab.url);
    
    // Update the extension icon based on whether we're on a route page
    chrome.action.setIcon({
      tabId: tabId,
      path: isRoutePage ? {
        16: "images/icon16.png",
        48: "images/icon48.png",
        128: "images/icon128.png"
      } : {
        16: "images/icon_disabled.png",
        48: "images/icon_disabled.png",
        128: "images/icon_disabled.png"
      }
    });
    
    // Update badge text
    chrome.action.setBadgeText({
      tabId: tabId,
      text: isRoutePage ? "GPX" : "",
    });

    // Set text color for the badge
    chrome.action.setBadgeTextColor({
      tabId: tabId,
      color: "#FFFFFF"
    });
    
    // Update badge background color
    chrome.action.setBadgeBackgroundColor({
      tabId: tabId,
      color: "#4CAF50"
    });
  }
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'convertAndDownload' && message.data) {
    try {
      // Convert JSON to GPX
      const gpxData = RideWithGPSConverter.convertToGPX(message.data);
      
      // Generate file name based on route name or ID
      const routeName = message.data.name || `route-${Date.now()}`;
      const fileName = `${sanitizeFileName(routeName)}.gpx`;
      
      // In service workers, we need to use Data URLs instead of Blob URLs
      // Create a data URL from the GPX content
      const dataUrl = 'data:application/gpx+xml;base64,' + btoa(unescape(encodeURIComponent(gpxData)));
      
      // Download the file
      chrome.downloads.download({
        url: dataUrl,
        filename: fileName,
        saveAs: true
      }, (downloadId) => {
        if (downloadId) {
          sendResponse({ success: true });
        } else {
          sendResponse({ 
            success: false, 
            error: chrome.runtime.lastError ? chrome.runtime.lastError.message : 'Unknown error'
          });
        }
      });
      
      // Indicate we will send a response asynchronously
      return true;
    } catch (error) {
      console.error('Error converting or downloading GPX:', error);
      sendResponse({ success: false, error: error.message });
    }
  }
});

/**
 * Sanitizes a filename to remove illegal characters
 * @param {string} filename - The filename to sanitize
 * @returns {string} - Sanitized filename
 */
function sanitizeFileName(filename) {
  return filename
    .replace(/[/\\?%*:|"<>]/g, '-')  // Replace illegal characters with dash
    .replace(/\s+/g, '_')            // Replace spaces with underscore
    .slice(0, 100);                  // Limit length
}