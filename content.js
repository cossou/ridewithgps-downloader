/**
 * Content script that runs on RideWithGPS route pages
 */
(() => {
  // Check if we are on a route page
  const routeRegex = /^https:\/\/ridewithgps\.com\/routes\/(\d+)$/;
  const match = window.location.href.match(routeRegex);
  
  if (match) {
    const routeId = match[1];
    
    // Add button to the page
    addDownloadButton(routeId);
    
    // Listen for messages from popup or background
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'download') {
        fetchRouteData(routeId)
          .then(data => {
            sendResponse({ success: true, data });
          })
          .catch(error => {
            sendResponse({ success: false, error: error.message });
          });
        return true; // Indicates we will send a response asynchronously
      }
    });
  }

  /**
   * Adds a download GPX button to the page
   * @param {string} routeId - The route ID
   */
  function addDownloadButton(routeId) {
    // Create button
    const button = document.createElement('button');
    button.textContent = 'Download GPX';
    button.style.cssText = 'background-color: #4caf50; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; margin: 10px;';
    
    // Add hover effect
    button.addEventListener('mouseover', () => {
      button.style.backgroundColor = '#45a049';
    });
    
    button.addEventListener('mouseout', () => {
      button.style.backgroundColor = '#4caf50';
    });
    
    // Add click event
    button.addEventListener('click', async () => {
      button.disabled = true;
      button.textContent = 'Downloading...';
      
      try {
        const data = await fetchRouteData(routeId);
        // Send message to background script to convert and download
        chrome.runtime.sendMessage({
          action: 'convertAndDownload',
          data: data
        }, (response) => {
          if (response.success) {
            button.textContent = 'Downloaded!';
            setTimeout(() => {
              button.textContent = 'Download GPX';
              button.disabled = false;
            }, 2000);
          } else {
            button.textContent = 'Error: ' + response.error;
            setTimeout(() => {
              button.textContent = 'Download GPX';
              button.disabled = false;
            }, 3000);
          }
        });
      } catch (error) {
        button.textContent = 'Error: ' + error.message;
        setTimeout(() => {
          button.textContent = 'Download GPX';
          button.disabled = false;
        }, 3000);
      }
    });
    
    // Find a suitable place to add the button
    // Try to insert it in the page header or navigation area
    const headerArea = document.querySelector('.route-header, .route-title, header, .navbar');
    
    if (headerArea) {
      headerArea.appendChild(button);
    } else {
      // Fallback - add it to the top of the page
      document.body.insertBefore(button, document.body.firstChild);
    }
  }
  
  /**
   * Fetches the route data from the JSON URL
   * @param {string} routeId - The route ID
   * @returns {Promise<Object>} - The route data
   */
  async function fetchRouteData(routeId) {
    const jsonUrl = `https://ridewithgps.com/routes/${routeId}.json`;
    
    try {
      const response = await fetch(jsonUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching route data:', error);
      throw error;
    }
  }
})();