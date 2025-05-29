/**
 * Popup script for the RideWithGPS GPX Converter extension
 */
document.addEventListener('DOMContentLoaded', () => {
  const downloadBtn = document.getElementById('downloadBtn');
  const statusEl = document.getElementById('status');
  const routeInfoEl = document.getElementById('routeInfo');
  const routeNameEl = document.getElementById('routeName');
  const routeIdEl = document.getElementById('routeId');

  // Check if we are on a RideWithGPS route page
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    const routeRegex = /^https:\/\/ridewithgps\.com\/routes\/(\d+)$/;
    const match = currentTab.url.match(routeRegex);

    if (match) {
      const routeId = match[1];
      routeIdEl.textContent = routeId;
      routeInfoEl.style.display = 'block';
      
      // Update status
      statusEl.textContent = 'Ready to download GPX file';
      downloadBtn.disabled = false;

      // Try to get the route title from the page
      chrome.scripting.executeScript({
        target: { tabId: currentTab.id },
        function: () => {
          const titleEl = document.querySelector('h1, .route-title');
          return titleEl ? titleEl.textContent.trim() : null;
        }
      }, (result) => {
        if (result && result[0]?.result) {
          routeNameEl.textContent = result[0].result;
        } else {
          routeNameEl.textContent = `Route ${routeId}`;
        }
      });

      // Setup download button
      downloadBtn.addEventListener('click', async () => {
        try {
          // Update UI
          downloadBtn.disabled = true;
          statusEl.textContent = 'Downloading route data...';
          statusEl.className = 'status';

          // Send message to content script to fetch route data
          chrome.tabs.sendMessage(currentTab.id, { action: 'download' }, (response) => {
            if (chrome.runtime.lastError) {
              console.error('Error sending message:', chrome.runtime.lastError);
              handleError('Could not communicate with page. Please refresh and try again.');
              return;
            }

            if (!response || !response.success) {
              handleError(response?.error || 'Failed to get route data');
              return;
            }

            // Now send the data to background for conversion and download
            chrome.runtime.sendMessage({
              action: 'convertAndDownload',
              data: response.data
            }, (downloadResponse) => {
              if (chrome.runtime.lastError) {
                console.error('Error sending to background:', chrome.runtime.lastError);
                handleError('Error processing GPX file');
                return;
              }

              if (!downloadResponse || !downloadResponse.success) {
                handleError(downloadResponse?.error || 'Failed to generate GPX file');
                return;
              }

              // Success!
              statusEl.textContent = 'GPX downloaded successfully!';
              statusEl.className = 'status success';

              // Reset button after delay
              setTimeout(() => {
                downloadBtn.disabled = false;
                statusEl.textContent = 'Ready to download GPX file';
                statusEl.className = 'status';
              }, 3000);
            });
          });
        } catch (error) {
          console.error('Error in download process:', error);
          handleError(error.message || 'An unexpected error occurred');
        }
      });
    } else {
      // Not on a route page
      statusEl.textContent = 'Please navigate to a RideWithGPS route page';
      downloadBtn.disabled = true;
    }
  });

  /**
   * Handles errors in the download process
   * @param {string} message - The error message
   */
  function handleError(message) {
    statusEl.textContent = `Error: ${message}`;
    statusEl.className = 'status error';
    downloadBtn.disabled = false;
  }
});